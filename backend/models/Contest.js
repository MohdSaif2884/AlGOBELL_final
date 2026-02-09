const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    clistId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true
    },

    externalId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true
    },

    platform: {
      type: String,
      required: true,
      enum: [
        "codeforces",
        "leetcode",
        "codechef",
        "atcoder",
        "kaggle",
        "hackerrank",
        "hackerearth",
        "topcoder",
        "other"
      ],
      index: true
    },

    startTime: {
      type: String,
      required: true,
      index: true
    },

    endTime: {
      type: String,
      required: true
    },

    duration: {
      type: Number, // minutes
      required: true
    },

    url: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["upcoming", "live", "ended"],
      default: "upcoming",
      index: true
    },

    subscriberCount: {
      type: Number,
      default: 0
    },

    lastFetched: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes
contestSchema.index({ platform: 1, startTime: 1 });
contestSchema.index({ status: 1, startTime: 1 });
contestSchema.index({ platform: 1, clistId: 1 }, { unique: true });

// Export Mongoose Model
module.exports = mongoose.model("Contest", contestSchema);
