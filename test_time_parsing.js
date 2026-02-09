class TestContestService {
  parseClistResponse(data = {}) {
    const contests = data.objects || data.results || [];

    return contests.map((contest) => {
      const resourceName = contest.host || contest.resource?.name || contest.resource || "";
      return {
        clistId: contest.id,
        name: contest.event,
        site: resourceName,
        start_time: contest.start,
        end_time: contest.end,
        duration: Number(contest.duration || 0),
        url: contest.href,
      };
    });
  }

  testTimeParsing() {
    // Sample data from Clist API (without Z)
    const sampleData = {
      objects: [
        {
          id: 12345,
          event: "Test Contest",
          host: "codeforces",
          start: "2024-01-15T10:00:00",
          end: "2024-01-15T12:00:00",
          duration: 7200,
          href: "https://codeforces.com/contest/123",
          resource: { name: "Codeforces" }
        }
      ]
    };

    const contests = this.parseClistResponse(sampleData);
    const c = contests[0];

    console.log("Original start_time:", c.start_time);
    console.log("Original end_time:", c.end_time);

    // Test the parsing logic
    let startTimeStr = c.start_time;
    if (!startTimeStr.includes('Z') && !startTimeStr.includes('+')) {
      startTimeStr += 'Z';
    }
    const startTime = new Date(startTimeStr);

    let endTimeStr = c.end_time;
    if (!endTimeStr.includes('Z') && !endTimeStr.includes('+')) {
      endTimeStr += 'Z';
    }
    const endTime = new Date(endTimeStr);

    console.log("Parsed startTime:", startTime.toISOString());
    console.log("Parsed endTime:", endTime.toISOString());
    console.log("StartTime UTC:", startTime.toUTCString());
    console.log("EndTime UTC:", endTime.toUTCString());

    // Test with timezone already present
    const sampleWithTZ = {
      objects: [
        {
          id: 12346,
          event: "Test Contest 2",
          host: "codeforces",
          start: "2024-01-15T10:00:00+05:30",
          end: "2024-01-15T12:00:00+05:30",
          duration: 7200,
          href: "https://codeforces.com/contest/124",
          resource: { name: "Codeforces" }
        }
      ]
    };

    const contests2 = this.parseClistResponse(sampleWithTZ);
    const c2 = contests2[0];

    console.log("\nWith timezone:");
    console.log("Original start_time:", c2.start_time);
    console.log("Original end_time:", c2.end_time);

    let startTimeStr2 = c2.start_time;
    if (!startTimeStr2.includes('Z') && !startTimeStr2.includes('+')) {
      startTimeStr2 += 'Z';
    }
    const startTime2 = new Date(startTimeStr2);

    let endTimeStr2 = c2.end_time;
    if (!endTimeStr2.includes('Z') && !endTimeStr2.includes('+')) {
      endTimeStr2 += 'Z';
    }
    const endTime2 = new Date(endTimeStr2);

    console.log("Parsed startTime:", startTime2.toISOString());
    console.log("Parsed endTime:", endTime2.toISOString());
    console.log("StartTime UTC:", startTime2.toUTCString());
    console.log("EndTime UTC:", endTime2.toUTCString());
  }
}

const test = new TestContestService();
test.testTimeParsing();
