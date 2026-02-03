 const express = require("express");
const router = express.Router();

const contestService = require("../services/contestService");
const reminderService = require("../services/reminderService");
const ApiResponse = require("../middleware/apiResponse");
const { protect } = require("../middleware/auth");
const config = require("../config");
const Contest = require("../models/Contest");

// ==========================================
// DEV — MANUAL FETCH
// ==========================================
router.get("/fetch", async (req, res) => {
  try {
    const result = await contestService.fetchAndStoreContests();
    return ApiResponse.success(res, result, "Contests fetched successfully");
  } catch (error) {
    console.error("❌ Fetch error:", error.stack || error);
    return ApiResponse.error(res, error.message || "Fetch failed");
  }
});

// ==========================================
// DEV — REMOVE DUPLICATES (DB SIDE, FAST)
// ==========================================
router.get("/remove-duplicates", async (req, res) => {
  try {
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
      }
    }

    const total = await Contest.countDocuments();

    return ApiResponse.success(
      res,
      {
        removed,
        remaining: total
      },
      "Duplicates cleaned successfully"
    );
  } catch (err) {
    console.error("❌ Dedup error:", err.stack || err);
    return ApiResponse.error(res, "Failed to clean duplicates");
  }
});

// ==========================================
// DEV — UPDATE STATUSES
// ==========================================
router.get("/update-statuses", async (req, res) => {
  try {
    const stats = await contestService.updateContestStatuses();
    const cleaned = await contestService.cleanupOldContests();

    return ApiResponse.success(
      res,
      {
        ...stats,
        cleaned
      },
      "Statuses updated and old contests cleaned"
    );
  } catch (error) {
    console.error("❌ Update error:", error.stack || error);
    return ApiResponse.error(res, error.message || "Update failed");
  }
});

// ==========================================
// PUBLIC — GET CONTESTS
// ==========================================
router.get("/", async (req, res) => {
  try {
    if (!config.features.contests) {
      return ApiResponse.featureDisabled(res, "Contests");
    }

    const { platform, limit } = req.query;

    const contests = await contestService.getUpcomingContests({
      platform,
      limit: parseInt(limit) || 100
    });

    return ApiResponse.success(res, { contests }, "Contests fetched");
  } catch (error) {
    console.error("❌ Get contests error:", error.stack || error);
    return ApiResponse.error(res, "Failed to fetch contests");
  }
});

// ==========================================
// LIVE CONTESTS
// ==========================================
router.get("/live", async (req, res) => {
  try {
    const contests = await contestService.getLiveContests();
    return ApiResponse.success(res, { contests }, "Live contests fetched");
  } catch (error) {
    console.error("❌ Live contests error:", error.stack || error);
    return ApiResponse.error(res, "Failed to fetch live contests");
  }
});

// ==========================================
// PLATFORM STATS
// ==========================================
router.get("/stats", async (req, res) => {
  try {
    const stats = await contestService.getPlatformStats();
    return ApiResponse.success(res, { stats }, "Stats fetched");
  } catch (error) {
    console.error("❌ Stats error:", error.stack || error);
    return ApiResponse.error(res, "Failed to fetch stats");
  }
});

// ==========================================
// PROTECTED — SUBSCRIBE
// ==========================================
router.post("/:id/subscribe", protect, async (req, res) => {
  try {
    const { customOffsets } = req.body;
    const contestId = req.params.id;
    const userId = req.user._id;

    const reminders = await reminderService.createReminders(
      userId,
      contestId,
      customOffsets
    );

    return ApiResponse.success(
      res,
      { reminders },
      "Subscribed successfully",
      201
    );
  } catch (error) {
    console.error("❌ Subscribe error:", error.stack || error);
    return ApiResponse.error(res, "Subscribe failed");
  }
});

// ==========================================
// PROTECTED — UNSUBSCRIBE
// ==========================================
router.delete("/:id/unsubscribe", protect, async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user._id;

    const Reminder = require("../models/Reminder");

    const result = await Reminder.updateMany(
      { userId, contestId, status: "pending" },
      { status: "cancelled" }
    );

    return ApiResponse.success(
      res,
      { cancelled: result.modifiedCount },
      "Unsubscribed"
    );
  } catch (error) {
    console.error("❌ Unsubscribe error:", error.stack || error);
    return ApiResponse.error(res, "Unsubscribe failed");
  }
});

// ==========================================
// GET CONTEST BY ID
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const contest = await contestService.getContestById(req.params.id);

    if (!contest) {
      return ApiResponse.notFound(res, "Contest");
    }

    return ApiResponse.success(res, { contest }, "Contest fetched");
  } catch (error) {
    console.error("❌ Get contest error:", error.stack || error);
    return ApiResponse.error(res, "Failed to fetch contest");
  }
});

module.exports = router;
