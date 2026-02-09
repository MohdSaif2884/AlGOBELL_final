const ContestService = require('./services/contestService');

class TestTimeParsing {
  constructor() {
    this.contestService = new ContestService();
  }

  testTimeParsing() {
    console.log('🧪 Testing Time Parsing Logic\n');

    // Sample data from Clist API (UTC times without Z)
    const sampleData = {
      objects: [
        {
          id: 12345,
          event: "Codeforces Round #900",
          host: "codeforces",
          start: "2024-01-15T10:00:00", // UTC, no Z
          end: "2024-01-15T12:00:00",   // UTC, no Z
          duration: 7200,
          href: "https://codeforces.com/contest/123",
          resource: { name: "Codeforces" }
        },
        {
          id: 12346,
          event: "LeetCode Weekly Contest",
          host: "leetcode",
          start: "2024-01-15T14:30:00+05:30", // IST timezone
          end: "2024-01-15T16:30:00+05:30",
          duration: 7200,
          href: "https://leetcode.com/contest/weekly",
          resource: { name: "LeetCode" }
        }
      ]
    };

    const contests = this.contestService.parseClistResponse(sampleData);

    contests.forEach((c, index) => {
      console.log(`\n📅 Contest ${index + 1}: ${c.name}`);
      console.log(`   Raw start_time: ${c.start_time}`);
      console.log(`   Raw end_time: ${c.end_time}`);

      // Simulate the parsing logic from fetchAndStoreContests
      const platform = this.contestService.normalizePlatform(c.site);
      const startTime = new Date(c.start_time);

      let endTime;
      if (c.end_time) {
        endTime = new Date(c.end_time);
      } else {
        const fallbackMinutes = this.contestService.getFixedMinutes(platform);
        endTime = new Date(startTime.getTime() + fallbackMinutes * 60000);
      }

      console.log(`   Parsed startTime: ${startTime.toISOString()}`);
      console.log(`   Parsed endTime: ${endTime.toISOString()}`);
      console.log(`   StartTime UTC: ${startTime.toUTCString()}`);
      console.log(`   EndTime UTC: ${endTime.toUTCString()}`);

      // Check if times are reasonable (not in past for test)
      const now = new Date();
      const isUpcoming = startTime > now;
      console.log(`   Status: ${isUpcoming ? 'Upcoming' : 'Past'}`);
    });

    console.log('\n✅ Time parsing test completed');
  }
}

const test = new TestTimeParsing();
test.testTimeParsing();
