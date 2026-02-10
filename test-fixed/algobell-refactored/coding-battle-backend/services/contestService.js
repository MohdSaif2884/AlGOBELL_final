const axios = require("axios");
const Contest = require("../models/Contest");
const User = require("../models/User");
const Reminder = require("../models/Reminder");

class ContestService {
  constructor() {
    this.apis = [
      {
        // 🔥 ONLY PRIMARY SOURCE — CLIST
        name: "Clist",
        url: "https://clist.by/api/v4/contest/",
        timeout: 30000,
        parser: this.parseClistResponse.bind(this),
        headers: process.env.CLIST_USERNAME && process.env.CLIST_API_KEY ? {
          Authorization: `ApiKey ${process.env.CLIST_USERNAME}:${process.env.CLIST_API_KEY}`,
        } : {},
        params: {
          order_by: "start",
          limit: 200,
          with_resource: true,
        },
        enabled: !!(process.env.CLIST_USERNAME && process.env.CLIST_API_KEY),
      },
    ];
  }

  // =========================
  // FETCH WITH RETRY
  // =========================
  async fetchWithRetry(config, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 ${config.name} attempt ${attempt} - Hitting URL: ${config.url}`);

        const response = await axios.get(config.url, {
          timeout: config.timeout,
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "application/json",
            ...config.headers,
          },
          params: config.params || {},
        });

        // Log response status and length
        console.log(`✅ ${config.name} response: Status ${response.status}, Length: ${JSON.stringify(response.data).length} chars`);

        return response;
      } catch (err) {
        const status = err.response?.status;
        const statusText = err.response?.statusText;
        const code = err.code;

        // Handle 401/403 errors clearly
        if (status === 401) {
          console.error(`❌ ${config.name} failed: 401 Unauthorized - Check API credentials`);
        } else if (status === 403) {
          console.error(`❌ ${config.name} failed: 403 Forbidden - API access denied`);
        } else {
          console.error(`❌ ${config.name} failed: ${err.message}`);
        }

        console.error(`❌ Failure details: Status ${status} ${statusText}, Code: ${code}`);

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

    return contests.map((contest) => {
      const resourceName = contest.host || contest.resource?.name || contest.resource || "";
      return {
        clistId: contest.id, // 🔥 TRUE UNIQUE ID
        name: contest.event,
        site: resourceName,
        start_time: contest.start,
        end_time: contest.end,
        duration: Number(contest.duration || 0),
        url: contest.href,
      };
    });
  }

  // =========================
  // TIME PARSING HELPER
  // =========================
  parseTimeString(raw) {
    if (!raw) return null;

    // If already has timezone info, use directly
    if (raw.endsWith("Z") || raw.includes("+")) {
      return new Date(raw);
    }

    // Otherwise treat as UTC explicitly
    return new Date(raw + "Z");
  }

  // =========================
  // PLATFORM NORMALIZER
  // =========================
  normalizePlatform(name) {
    const lower = name.toLowerCase();

    if (lower.includes("codechef")) return "codechef";
    if (lower.includes("codeforces")) return "codeforces";
    if (lower.includes("leetcode")) return "leetcode";
    if (lower.includes("atcoder")) return "atcoder";
    if (lower.includes("kaggle")) return "kaggle";
    if (lower.includes("hackerrank")) return "hackerrank";

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
    let totalMatched = 0;
    let totalModified = 0;
    let totalUpserted = 0;
    let totalFetched = 0;
    let successfulSources = [];

    // Clear entire contests collection once before refetching
    const count = await Contest.countDocuments();
    console.log("Deleting contests:", count);
    await Contest.deleteMany({});

    // Clean existing duplicates before fetching new ones
    console.log('🧹 Cleaning existing duplicate contests...');
    const cleanedDuplicates = await this.removeDuplicateContests();
    console.log(`🗑️ Cleaned ${cleanedDuplicates} existing duplicates`);

    // Log total documents in DB before saving
    const totalDocsBefore = await Contest.countDocuments();
    console.log(`📊 Total contests in DB before fetch: ${totalDocsBefore}`);

    // Log earliest and latest start times in DB
    const dbContests = await Contest.find({}, { startTime: 1 }).sort({ startTime: 1 }).lean();
    if (dbContests.length > 0) {
      const earliestDB = dbContests[0].startTime;
      const latestDB = dbContests[dbContests.length - 1].startTime;
      console.log(`📅 DB contests range: ${earliestDB.toISOString()} to ${latestDB.toISOString()}`);
    }

    for (const api of this.apis) {
      if (api.enabled === false) {
        if (api.name === 'Clist') {
          console.error(`❌ Clist credentials missing in environment variables (CLIST_USERNAME and CLIST_API_KEY)`);
        } else {
          console.log(`⏭️ Skipping ${api.name}`);
        }
        continue;
      }

      try {
        console.log(`📥 Fetching from ${api.name}`);
        let allContests = [];
        let offset = 0;
        const maxContests = 1000; // Safety cap
        const now = new Date();
        const startOfDayUTC = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0, 0, 0
        ));

        while (allContests.length < maxContests) {
          const currentParams = { ...api.params, offset, start__gte: startOfDayUTC.toISOString() };
          const res = await this.fetchWithRetry({ ...api, params: currentParams });

          // Log raw response.data.objects[0] before parsing
          console.log("Raw Clist object sample:");
          console.log(JSON.stringify(res.data.objects?.[0], null, 2));

          // Log all resource names
          const allResources = res.data.objects?.map((c) => ({
            host: c.host,
            resource: c.resource,
            resourceName: c.resource?.name,
            event: c.event
          })) || [];
          console.log("All resource mappings (first 10):");
          console.log(JSON.stringify(allResources.slice(0, 10), null, 2));

          const contests = api.parser(res.data);
          allContests = allContests.concat(contests);

          console.log(`📊 Page ${Math.floor(offset / api.params.limit) + 1}: ${contests.length} contests (Total: ${allContests.length})`);

          // Check if there's a next page
          if (!res.data.meta?.next || contests.length === 0) {
            break;
          }

          offset += api.params.limit;
        }

        let contests = allContests.slice(0, maxContests); // Apply safety cap

        // Filter out contests without valid clistId and deduplicate
        contests = contests.filter(c => c.clistId && typeof c.clistId === 'number');
        const uniqueContests = contests.reduce((acc, current) => {
          const x = acc.find(item => item.clistId === current.clistId);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        contests = uniqueContests;
        console.log(`📊 Filtered and deduplicated count from ${api.name}: ${contests.length}`);

        // Log earliest and latest start times from fetched contests
        if (contests.length > 0) {
          const validContests = contests.filter(c => c.start_time).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
          if (validContests.length > 0) {
            const earliestFetched = new Date(validContests[0].start_time);
            const latestFetched = new Date(validContests[validContests.length - 1].start_time);
            console.log(`📅 Fetched contests range: ${earliestFetched.toISOString()} to ${latestFetched.toISOString()}`);
          }
        }

        // Log raw resource names for first 10 contests
        contests.slice(0, 10).forEach((c, index) => {
          console.log(`Raw resource name ${index + 1}: ${c.site}`);
          if (index === 0) {
            console.log(`Full contest object:`, JSON.stringify(c, null, 2));
          }
        });

        let matched = 0;
        let modified = 0;
        let upserted = 0;

        for (const c of contests) {
          try {
            if (!c.name || !c.site || !c.start_time) {
              continue;
            }

            const platform = this.normalizePlatform(c.site).toLowerCase();

            // Use the robust time parsing helper
            const startTime = this.parseTimeString(c.start_time);
            if (!startTime) {
              console.log(`⚠️ Failed to parse start time: ${c.start_time} for contest: ${c.name}`);
              continue;
            }

            // =========================
            // SAFE END TIME
            // =========================
            let endTime;
            if (c.end_time) {
              endTime = this.parseTimeString(c.end_time);
              if (!endTime) {
                console.log(`⚠️ Failed to parse end time: ${c.end_time} for contest: ${c.name}`);
                continue;
              }
            } else {
              const fallbackMinutes = this.getFixedMinutes(platform);
              endTime = new Date(
                startTime.getTime() + fallbackMinutes * 60000
              );
            }

            const now = new Date();
            let status = "upcoming";

            if (now < startTime) status = "upcoming";
            else if (now >= startTime && now <= endTime) status = "live";
            else status = "ended";

            // =========================
            // 🔥 TRUE UNIQUE ID SYSTEM - Use clistId
            // =========================
            const externalId = `clist_${c.clistId}`;

            // Use updateOne with $set and upsert for proper duplicate handling
            const updateResult = await Contest.updateOne(
              { clistId: c.clistId },
              {
                $set: {
                  clistId: c.clistId,
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
                }
              },
              { upsert: true }
            );

            matched += updateResult.matchedCount;
            modified += updateResult.modifiedCount;
            upserted += updateResult.upsertedCount;

            if (updateResult.upsertedCount > 0) {
              console.log(`✅ Upserted new contest: ${c.name}`);
              // =========================
              // SMART ALARM ENGINE
              // =========================
              try {
                const savedContest = await Contest.findOne({ clistId: c.clistId });
                await this.createSmartAlarmsForContest({
                  contestId: savedContest._id,
                  platform,
                  contestName: c.name,
                  startTime
                });
              } catch (smartAlarmError) {
                console.error('❌ Smart alarm creation failed:', smartAlarmError.message);
              }
            } else if (updateResult.modifiedCount > 0) {
              console.log(`🔄 Updated existing contest: ${c.name}`);
            } else {
              console.log(`⏭️ No changes needed for: ${c.name}`);
            }
          } catch (err) {
            console.log("⚠️ Skipped contest:", c.name, "Error:", err.message);
          }
        }

        console.log(
          `✅ ${api.name}: Matched ${matched}, Modified ${modified}, Inserted ${upserted}, Total ${contests.length}`
        );

        totalMatched += matched;
        totalModified += modified;
        totalUpserted += upserted;
        totalFetched += contests.length;
        successfulSources.push(api.name);

      } catch (err) {
        console.error(`❌ ${api.name} failed:`, err.message);
        console.error(`❌ Failure reason:`, err.response?.status, err.response?.statusText, err.code);
      }
    }

    if (successfulSources.length === 0) {
      throw new Error("All APIs failed");
    }

    const totalDocsAfter = await Contest.countDocuments();
    console.log(`📊 Total contests in DB after fetch: ${totalDocsAfter}`);
    console.log(`📊 Net change: ${totalDocsAfter - totalDocsBefore}`);

    // Log platform-specific counts
    const platformStats = await this.getPlatformStats();
    console.log(`📊 Platform counts:`);
    platformStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    console.log(`🔄 Sync Summary: Matched ${totalMatched}, Modified ${totalModified}, Inserted ${totalUpserted}`);

    // Remove any duplicate contests that may have been created
    const removedDuplicates = await this.removeDuplicateContests();
    console.log(`🗑️ Auto-removed ${removedDuplicates} duplicate contests`);

    // Auto remove finished contests
    const removedFinished = await this.removeFinishedContests();
    console.log(`🗑️ Auto-removed ${removedFinished} finished contests`);

    // Verify one contest
    const test = await Contest.findOne({ clistId: 64954542 });
    console.log("Stored startTime:", test.startTime);

    return {
      sources: successfulSources,
      matched: totalMatched,
      modified: totalModified,
      upserted: totalUpserted,
      total: totalFetched,
      dbBefore: totalDocsBefore,
      dbAfter: totalDocsAfter,
      platformStats,
      removedFinished,
    };
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

    return await Contest.aggregate([
      { $match: query },

      // Deduplicate contests with same name, startTime, platform
      {
        $group: {
          _id: {
            name: "$name",
            startTime: "$startTime",
            platform: "$platform"
          },
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } },

      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "live"] }, then: 1 },
                { case: { $eq: ["$status", "upcoming"] }, then: 2 },
                { case: { $eq: ["$status", "ended"] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },

      { $sort: { statusOrder: 1, startTime: 1 } },

      { $limit: Number(limit) },

      {
        $project: {
          statusOrder: 0
        }
      }
    ]);
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
  // AUTO REMOVE FINISHED CONTESTS
  // =========================
  async removeFinishedContests() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    const result = await Contest.deleteMany({ endTime: { $lt: cutoff } });

    if (result.deletedCount > 0) {
      console.log(`🗑️ Auto-removed ${result.deletedCount} finished contests (older than 24 hours)`);
    }

    return result.deletedCount;
  }

  // =========================
  // REMOVE DUPLICATE CONTESTS
  // =========================
  async removeDuplicateContests() {
    // Find duplicates based on name, startTime, and platform
    const duplicates = await Contest.aggregate([
      {
        $group: {
          _id: {
            name: "$name",
            startTime: "$startTime",
            platform: "$platform"
          },
          ids: { $push: "$_id" },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    let removed = 0;

    for (const group of duplicates) {
      const [keep, ...remove] = group.ids;
      if (remove.length > 0) {
        const result = await Contest.deleteMany({
          _id: { $in: remove }
        });
        removed += result.deletedCount;
        console.log(`🗑️ Removed ${result.deletedCount} duplicates for contest: ${group._id.name}`);
      }
    }

    if (removed > 0) {
      console.log(`🗑️ Total removed ${removed} duplicate contests`);
    }

    return removed;
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
