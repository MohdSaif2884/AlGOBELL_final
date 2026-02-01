 console.log("🔥 USING API CONTESTS FILE");

const API_URL = import.meta.env.VITE_API_URL;

const ALLOWED_PLATFORMS = [
  "codeforces",
  "leetcode",
  "codechef",
  "kaggle",
  "other",
];

// ============================
// TIME HELPERS
// ============================
function safeDate(val: any) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function computeTimes(c: any) {
  const start = safeDate(
    c.startTime || c.start_time || c.start
  );

  // duration usually in SECONDS
  const durationSec =
    typeof c.duration === "number"
      ? c.duration
      : typeof c.durationSeconds === "number"
      ? c.durationSeconds
      : typeof c.length === "number"
      ? c.length
      : 0;

  const end =
    start && durationSec
      ? new Date(start.getTime() + durationSec * 1000)
      : null;

  const now = new Date();

  let status: "UPCOMING" | "LIVE" | "FINISHED" = "UPCOMING";

  if (start && end) {
    if (now >= start && now <= end) status = "LIVE";
    else if (now > end) status = "FINISHED";
  } else if (start && now >= start) {
    // fallback: if no duration, assume live
    status = "LIVE";
  }

  return {
    startTime: start?.toISOString() || null,
    endTime: end?.toISOString() || null,
    status,
  };
}

// ============================
// NORMALIZE + FILTER
// ============================
function normalizeAndFilter(contests: any[]) {
  return (contests || [])
    .filter((c) =>
      ALLOWED_PLATFORMS.includes(
        (c.platform || "").toLowerCase()
      )
    )
    .map((c) => {
      const platformKey = (c.platform || "").toLowerCase();

      const platformMap: Record<string, any> = {
        codeforces: {
          name: "Codeforces",
          initial: "CF",
          color: "from-blue-500 to-sky-600",
        },
        leetcode: {
          name: "LeetCode",
          initial: "LC",
          color: "from-orange-500 to-yellow-500",
        },
        codechef: {
          name: "CodeChef",
          initial: "CC",
          color: "from-yellow-600 to-orange-600",
        },
        kaggle: {
          name: "Kaggle",
          initial: "K",
          color: "from-purple-500 to-indigo-600",
        },
        other: {
          name: "Other",
          initial: "O",
          color: "from-gray-500 to-gray-600",
        },
      };

      const timeData = computeTimes(c);

      const finalContest = {
        ...c,

        id:
          c._id ||
          c.externalId ||
          c.id ||
          crypto.randomUUID(),

        platform:
          platformMap[platformKey]?.name ||
          c.platform,

        platformInitial:
          platformMap[platformKey]?.initial || "?",

        platformColor:
          platformMap[platformKey]?.color ||
          "from-gray-500 to-gray-600",

        // 🔥 THESE FIX YOUR UI
        startTime: timeData.startTime,
        endTime: timeData.endTime,
        status: timeData.status,
      };

      console.log("🧠 NORMALIZED:", {
        name: finalContest.name,
        status: finalContest.status,
        start: finalContest.startTime,
        end: finalContest.endTime,
      });

      return finalContest;
    });
}

// ============================
// API FUNCTIONS
// ============================
export async function getContests(platform = "all") {
  const res = await fetch(
    `${API_URL}/api/contests?platform=${platform}`
  );

  const json = await res.json();
  const raw = json?.data?.contests || [];

  return normalizeAndFilter(raw);
}

export async function getLiveContests() {
  const res = await fetch(
    `${API_URL}/api/contests/live`
  );

  const json = await res.json();
  const raw = json?.data?.contests || [];

  return normalizeAndFilter(raw);
}
