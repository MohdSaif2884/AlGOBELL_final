// Test the deduplication logic from contestService.js
class TestContestService {
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
}

// Test data with duplicates
const testData = [
  {
    clistId: 1,
    name: "Codeforces Round #123",
    site: "codeforces",
    start_time: "2024-01-15T10:00:00",
    end_time: "2024-01-15T12:00:00",
    duration: 7200,
    url: "https://codeforces.com/contest/123"
  },
  {
    clistId: 2,
    name: "Codeforces Round #123", // Same name
    site: "codeforces", // Same site
    start_time: "2024-01-15T10:00:00", // Same time
    end_time: "2024-01-15T12:00:00",
    duration: 7200,
    url: "https://codeforces.com/contest/123"
  },
  {
    clistId: 3,
    name: "Codeforces Round #124",
    site: "codeforces",
    start_time: "2024-01-16T10:00:00",
    end_time: "2024-01-16T12:00:00",
    duration: 7200,
    url: "https://codeforces.com/contest/124"
  },
  {
    clistId: 4,
    name: "Codeforces Round #123", // Another duplicate
    site: "CodeForces", // Different case
    start_time: "2024-01-15T10:00:00",
    end_time: "2024-01-15T12:00:00",
    duration: 7200,
    url: "https://codeforces.com/contest/123"
  }
];

console.log("Original contests count:", testData.length);

const service = new TestContestService();

// Test the deduplication logic
const contests = testData.filter(c => c.clistId && typeof c.clistId === 'number');
const uniqueContests = contests.reduce((acc, current) => {
  const platform = service.normalizePlatform(current.site).toLowerCase();
  const key = `${current.name.trim().toLowerCase()}-${platform}-${current.start_time}`;
  const x = acc.find(item => {
    const itemPlatform = service.normalizePlatform(item.site).toLowerCase();
    return `${item.name.trim().toLowerCase()}-${itemPlatform}-${item.start_time}` === key;
  });
  if (!x) {
    return acc.concat([current]);
  } else {
    console.log(`🔄 Duplicate contest found and skipped: ${current.name} (${current.site}) - using existing with clistId ${x.clistId}`);
    return acc;
  }
}, []);

console.log("After deduplication count:", uniqueContests.length);
console.log("Unique contests:");
uniqueContests.forEach(c => console.log(`- ${c.name} (${c.site}) - clistId: ${c.clistId}`));
