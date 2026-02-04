const axios = require("axios");
const Contest = require("../models/Contest");
const User = require("../models/User");
const Reminder = require("../models/Reminder");

class ContestService {
  constructor() {
    this.apis = [
      {
        // 🔥 PRIMARY SOURCE — CLIST
        name: "Clist",
        url: "https://clist.by/api/v4/contest/",
        timeout: 30000,
        parser: this.parseClistResponse.bind(this),
        headers: {
          Authorization: `ApiKey ${process.env.CLIST_USERNAME}:${process.env.CLIST_API_KEY}`,
        },
        params: {
          start__gte: new Date().toISOString(),
          order_by: "start",
          limit: 100,
        },
        enabled: true,
      },

      {
        // ⚠️ FALLBACK — Kontests
        name: "Kontests",
        url: "https://kontests.net/api/v1/all",
        timeout: 20000,
        parser: this.parseKontestsResponse.bind(this),
        enabled: true,
      },
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
            ...config.headers,
          },
          params: config.params || {},
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
      url: c.url,
    }));
  }

  parseClistResponse(data = {}) {
    const contests = data.objects || data.results || [];

    return contests.map((c) => ({
      clistId: c.id, // 🔥 TRUE UNIQUE ID
      name: c.event,
      site: c.resource?.name || "",
      start_time: c.start,
      end_time: c.end,
      duration: Number(c.duration || 0),
      url: c.href,
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
  // SAFE DURATION FALLBACKS
  // =========================
  getFixedMinutes(platform) {
    const map = {
      codeforces: 120,
      leetcode: 90,
      codechef: 180,
      atcoder: 120,
      kaggle: 10080, // 7 days
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
        console.log(`⏭️ Skipping ${api.name}`);
        continue;
      }

      try {
        console.log(`📥 Fetching from ${api.name}`);
        const res = await this.fetchWithRetry(api);
        const contests = api.parser(res.data);

        let saved = 0;
        let skipped = 0;

        for (const c of contests) {
          try {
            if (!c.name || !c.site || !c.start_time) {
              skipped++;
              continue;
            }

            const platform = this.normalizePlatform(c.site);
            const startTime = new Date(c.start_time);

            if (isNaN(startTime.getTime())) {
              skipped++;
              continue;
            }

            // =========================
            // SAFE END TIME
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

            if (now > endTime) status = "ended";
            else if (now >= startTime && now <= endTime)
              status = "live";

            // =========================
            // 🔥 TRUE UNIQUE ID SYSTEM
            // =========================
            const externalId = c.clistId
              ? `clist_${c.clistId}`
              : `${platform}_${startTime.getTime()}`;

            const result = await Contest.findOneAndUpdate(
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
                lastFetched: new Date(),
              },
              { upsert: true, new: false }
            );

            if (!result) {
              saved++;
              // =========================
              // SMART ALARM ENGINE
              // =========================
              try {
                await this.createSmartAlarmsForContest({
                  contestId: result._id || (await Contest.findOne({ externalId }))._id,
                  platform,
                  contestName: c.name,
                  startTime
                });
              } catch (smartAlarmError) {
                console.error('❌ Smart alarm creation failed:', smartAlarmError.message);
              }
            } else {
              skipped++;
            }
          } catch (err) {
            console.log("⚠️ Skipped contest:", c.name);
            skipped++;
          }
        }

        console.log(
          `✅ ${api.name}: Saved ${saved}, Skipped ${skipped}, Total ${contests.length}`
        );

        return {
          source: api.name,
          saved,
          skipped,
          total: contests.length,
        };
      } catch (err) {
        lastError = err;
        console.error(`❌ ${api.name} failed:`, err.message);
      }
    }

    throw new Error(lastError?.message || "All APIs failed");
  }

  // =========================
  // STATUS CALCULATION (UTC-SAFE)
  // =========================
  calculateContestStatus(startTime, endTime) {
    const now = new Date(); // UTC by default

    if (now < startTime) return "upcoming";
    if (startTime <= now && now <= endTime) return "live";
    return "ended";
  }

  // =========================
  // QUERIES
  // =========================
  async getAllContests({ platform, limit = 100 }) {
    const query = {};

    if (platform && platform !== "all") {
      query.platform = platform;
    }

    const contests = await Contest.find(query)
      .sort({ startTime: 1 })
      .limit(Number(limit))
      .lean();

    // Dynamically calculate status for each contest
    return contests.map((c) => {
      const status = this.calculateContestStatus(c.startTime, c.endTime);
      return {
        ...c,
        status,
        isLive: status === "live",
        isUpcoming: status === "upcoming",
        isEnded: status === "ended",
        timeUntilStart: Math.floor(
          (new Date(c.startTime) - new Date()) / 60000
        ),
      };
    });
  }

  // Keep old method for backward compatibility
  async getUpcomingContests({ platform, limit = 50 }) {
    const allContests = await this.getAllContests({ platform, limit });
    return allContests.filter(c => c.status !== "ended");
  }

  async getLiveContests() {
    return Contest.find({ status: "live" })
      .sort({ startTime: 1 })
      .lean();
  }

  async getContestById(contestId) {
    try {
      return await Contest.findById(contestId).lean();
    } catch {
      return null;
    }
  }

  // =========================
  // STATUS UPDATES
  // =========================
  async updateContestStatuses() {
    const now = new Date();

    const ended = await Contest.updateMany(
      {
        status: { $in: ["upcoming", "live"] },
        endTime: { $lt: now },
      },
      { status: "ended" }
    );

    const live = await Contest.updateMany(
      {
        status: "upcoming",
        startTime: { $lte: now },
        endTime: { $gt: now },
      },
      { status: "live" }
    );

    console.log(
      `🔁 Status updated → Ended: ${ended.modifiedCount}, Live: ${live.modifiedCount}`
    );

    return {
      ended: ended.modifiedCount,
      live: live.modifiedCount,
    };
  }

  // =========================
  // CLEANUP OLD CONTESTS
  // =========================
  async cleanupOldContests() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);

    const result = await Contest.deleteMany({
      status: "ended",
      endTime: { $lt: cutoff },
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
          status: { $in: ["upcoming", "live"] },
        },
      },
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
  }

  // =========================
  // SMART ALARM ENGINE
  // =========================
  async createSmartAlarmsForContest({ contestId, platform, contestName, startTime }) {
    // Find all PRO users with smart alarm enabled for this platform
    const users = await User.find({
      'subscription.plan': 'pro',
      'smartAlarm.enabled': true,
      'smartAlarm.platform': platform
    });

    if (users.length === 0) {
      console.log(`⏭️ No smart alarms for ${platform} contests`);
      return;
    }

    let created = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        const offsetMinutes = user.smartAlarm.offsetMinutes || 30;
        const triggerTime = new Date(startTime.getTime() - offsetMinutes * 60000);

        // Check if reminder already exists (prevent duplicates)
        const existingReminder = await Reminder.findOne({
          userId: user._id,
          contestId,
          type: 'smart'
        });

        if (existingReminder) {
          console.log(`⏭️ Skipped existing smart alarm for ${user.email} → ${contestName}`);
          skipped++;
          continue;
        }

        // Create smart alarm reminder
        await Reminder.create({
          userId: user._id,
          contestId,
          offsetMinutes,
          scheduledAt: triggerTime,
          channels: {
            email: user.contestPreferences?.enabledChannels?.email || false,
            whatsapp: user.contestPreferences?.enabledChannels?.whatsapp || false,
            push: user.contestPreferences?.enabledChannels?.push || true
          },
          type: 'smart'
        });

        console.log(`🔔 Smart alarm set for ${user.email} → ${contestName} (${offsetMinutes}min before)`);
        created++;
      } catch (error) {
        console.error(`❌ Failed to create smart alarm for ${user.email}:`, error.message);
      }
    }

    console.log(`✅ Smart alarms: Created ${created}, Skipped ${skipped} for ${platform} contest`);
  }
}

module.exports = new ContestService();
