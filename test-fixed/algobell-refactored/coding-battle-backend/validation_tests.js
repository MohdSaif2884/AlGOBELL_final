const mongoose = require("mongoose");
const config = require("./config");
const Contest = require("./models/Contest");

async function runValidationTests() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodbUri);
    console.log("✅ Connected to MongoDB for validation tests");

    // 1. Count total contests
    const totalContests = await Contest.countDocuments();
    console.log(`📊 Total contests in DB: ${totalContests}`);

    // 2. Check for duplicates (platform + clistId)
    const duplicates = await Contest.aggregate([
      {
        $group: {
          _id: { platform: "$platform", clistId: "$clistId" },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`🔍 Duplicate entries found: ${duplicates.length}`);
    if (duplicates.length > 0) {
      duplicates.forEach(dup => {
        console.log(`  - Platform: ${dup._id.platform}, clistId: ${dup._id.clistId}, Count: ${dup.count}`);
      });
    }

    // 3. Pick 5 random contests
    const randomContests = await Contest.aggregate([{ $sample: { size: 5 } }]);
    console.log(`🎲 Random sample of 5 contests:`);

    let statusMismatches = 0;
    let invalidDates = 0;

    const now = new Date();

    randomContests.forEach((contest, index) => {
      console.log(`\nContest ${index + 1}:`);
      console.log(`  Name: ${contest.name}`);
      console.log(`  Platform: ${contest.platform}`);
      console.log(`  startTime (raw): ${contest.startTime}`);
      console.log(`  startTime (ISO): ${contest.startTime.toISOString()}`);
      console.log(`  endTime: ${contest.endTime}`);
      console.log(`  Stored status: ${contest.status}`);

      // Compute expected status
      let expectedStatus;
      if (now < contest.startTime) {
        expectedStatus = "upcoming";
      } else if (now > contest.endTime) {
        expectedStatus = "ended";
      } else {
        expectedStatus = "live";
      }
      console.log(`  Expected status: ${expectedStatus}`);

      if (contest.status !== expectedStatus) {
        statusMismatches++;
        console.log(`  ❌ Status mismatch!`);
      } else {
        console.log(`  ✅ Status matches`);
      }

      // Validate ISO
      if (isNaN(new Date(contest.startTime))) {
        invalidDates++;
        console.log(`  ❌ Invalid startTime date!`);
      } else {
        console.log(`  ✅ Valid startTime date`);
      }
    });

    // 4. Final summary
    console.log(`\n📋 Validation Summary:`);
    console.log(`  Total contests: ${totalContests}`);
    console.log(`  Duplicate entries: ${duplicates.length}`);
    console.log(`  Invalid ISO dates: ${invalidDates}`);
    console.log(`  Status mismatches: ${statusMismatches}`);

    // 5. Check for MongoDB duplicate key errors in logs (simulate by checking if any upsert errors, but since read-only, just note)
    console.log(`\n🔍 MongoDB duplicate key errors: Not applicable in read-only validation (check server logs for any during fetch operations)`);

  } catch (error) {
    console.error("❌ Validation test failed:", error.message);
  } finally {
    // Disconnect
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

// Run the tests
runValidationTests();
