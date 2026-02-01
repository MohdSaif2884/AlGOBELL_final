 const axios = require("axios");
const Contest = require("../models/Contest");

class ContestService {
  constructor() {
    this.apis = [
      {
        name: "Kontests",
        url: "https://kontests.net/api/v1/all",
        timeout: 20000,
        parser: this.parseKontestsResponse.bind(this)
      },
      {
        name: "Clist",
        url: "https://clist.by/api/v4/contest/",
        timeout: 25000,
        parser: this.parseClistResponse.bind(this),
        headers: {
          Authorization: `ApiKey ${process.env.CLIST_USERNAME || ""}:${process.env.CLIST_API_KEY || ""}`
        },
        params: {
          upcoming: true,
          format: "json",
          limit: 100
        },
        enabled: !!(
          process.env.CLIST_USERNAME &&
          process.env.CLIST_API_KEY
        )
      }
    ];
  }

  // =========================
  // FETCH WITH RETRY
  // =========================
  async fetchWithRetry(config, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 ${config.name} attempt ${attempt}`);

        return await axios.get(config.url, {
          timeout: config.timeout,
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "application/json",
            ...config.headers
          },
          params: config.params || {}
        });
      } catch (err) {
        console.error(`❌ ${config.name} failed:`, err.message);
        if (attempt === maxRetries) throw err;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  // =========================
  // PARSERS
  // =========================
  parseKontestsResponse(data = []) {
    return data.map((c) => ({
      name: c.name,
      site: c.site || "",
      start_time: c.start_time,
      end_time: c.end_time,
      duration: Number(c.duration || 0),
      url: c.url
    }));
  }

  parseClistResponse(data = {}) {
    const contests = data.objects || data.results || [];

    return contests.map((c) => ({
      name: c.event,
      site: c.resource?.name || "",
      start_time: c.start,
      end_time: c.end,
      duration: Number(c.duration || 0),
      url: c.href
    }));
  }

  // =========================
  // PLATFORM NORMALIZER
  // =========================
  normalizePlatform(site = "") {
    const s = site.toLowerCase();

    if (s.includes("codeforces")) return "codeforces";
    if (s.includes("leetcode")) return "leetcode";
    if (s.includes("codechef")) return "codechef";
    if (s.includes("atcoder")) return "atcoder";
    if (s.includes("kaggle")) return "kaggle";
    if (s.includes("hackerrank")) return "hackerrank";
    if (s.includes("hackerearth")) return "hackerearth";
    if (s.includes("topcoder")) return "topcoder";

    return "other";
  }

  // =========================
  // SAFE DURATION FALLBACKS (MINUTES)
  // =========================
  getFixedMinutes(platform) {
    const map = {
      codeforces: 120,
      leetcode: 90,
      codechef: 180,
      atcoder: 120,
      kaggle: 10080 // 7 days
    };

    return map[platform] || 120;
  }

  // =========================
  // FETCH + STORE
  // =========================
  async fetchAndStoreContests() {
    let lastError;

    for (const api of this.apis) {
      if (api.enabled === false) {
        console.log(`⏭️  Skipping ${api.name}`);
        continue;
      }

      try {
        console.log(`📥 Fetching from ${api.name}`);
        const res = await this.fetchWithRetry(api);
        const contests = api.parser(res.data);

        let saved = 0;

        for (const c of contests) {
          try {
            if (!c.name || !c.site || !c.start_time) continue;

            const platform = this.normalizePlatform(c.site);
            const startTime = new Date(c.start_time);

            if (isNaN(startTime.getTime())) continue;

            // =========================
            // SAFE END TIME LOGIC
            // =========================
            let endTime;

            if (c.end_time) {
              endTime = new Date(c.end_time);
            } else {
              const fallbackMinutes = this.getFixedMinutes(platform);
              endTime = new Date(
                startTime.getTime() + fallbackMinutes * 60000
              );
            }

            const now = new Date();

            let status = "upcoming";
            if (now > endTime) {
              status = "ended";
            } else if (now >= startTime && now <= endTime) {
              status = "live";
            }

            const externalId = `${platform}_${c.name}_${startTime.toISOString()}`
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "_");

            await Contest.findOneAndUpdate(
              { externalId },
              {
                externalId,
                name: c.name,
                platform,
                startTime,
                endTime,
                duration: Math.max(
                  1,
                  Math.floor((endTime - startTime) / 60000)
                ),
                url: c.url || "",
                status,
                lastFetched: new Date()
              },
              { upsert: true, new: true }
            );

            saved++;
          } catch (err) {
            console.log("⚠️  Skipped contest:", c.name);
          }
        }

        console.log(`✅ ${api.name}: Saved ${saved}/${contests.length}`);
        return { source: api.name, saved, total: contests.length };
      } catch (err) {
        lastError = err;
        console.error(`❌ ${api.name} failed:`, err.message);
      }
    }

    throw new Error(lastError?.message || "All APIs failed");
  }

  // =========================
  // QUERIES
  // =========================
  async getUpcomingContests({ platform, limit = 50 }) {
    const query = {
      status: { $in: ["upcoming", "live"] }
    };

    if (platform && platform !== "all") {
      query.platform = platform;
    }

    const contests = await Contest.find(query)
      .sort({ startTime: 1 })
      .limit(Number(limit))
      .lean();

    return contests.map((c) => ({
      ...c,
      isLive: c.status === "live",
      isUpcoming: c.status === "upcoming",
      timeUntilStart: Math.floor(
        (new Date(c.startTime) - new Date()) / 60000
      )
    }));
  }

  async getLiveContests() {
    return Contest.find({ status: "live" })
      .sort({ startTime: 1 })
      .lean();
  }

  async getContestById(contestId) {
    try {
      return await Contest.findById(contestId).lean();
    } catch (err) {
      return null;
    }
  }

  // =========================
  // STATUS UPDATES
  // =========================
  async updateContestStatuses() {
    const now = new Date();

    await Contest.updateMany(
      { status: { $in: ["upcoming", "live"] }, endTime: { $lt: now } },
      { status: "ended" }
    );

    await Contest.updateMany(
      {
        status: "upcoming",
        startTime: { $lte: now },
        endTime: { $gt: now }
      },
      { status: "live" }
    );

    console.log("🔁 Contest statuses updated");
  }

  // =========================
  // CLEANUP OLD CONTESTS
  // =========================
  async cleanupOldContests() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const result = await Contest.deleteMany({
      status: "ended",
      endTime: { $lt: cutoff }
    });

    if (result.deletedCount > 0) {
      console.log(`🗑️ Cleaned ${result.deletedCount} old contests`);
    }

    return result.deletedCount;
  }

  // =========================
  // PLATFORM STATS
  // =========================
  async getPlatformStats() {
    return Contest.aggregate([
      {
        $match: {
          status: { $in: ["upcoming", "live"] }
        }
      },
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
  }
}

module.exports = new ContestService();
