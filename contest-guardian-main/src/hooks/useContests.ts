 import { useEffect, useState } from "react";

export interface Contest {
  id: string;
  name: string;
  platform: string;
  platformColor: string;
  platformInitial: string;
  startTime: string;
  endTime: string | null;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  link: string;
  isSubscribed: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const platformColors: Record<string, string> = {
  Codeforces: "from-blue-500 to-cyan-500",
  LeetCode: "from-orange-500 to-yellow-500",
  CodeChef: "from-yellow-600 to-orange-500",
  Kaggle: "from-purple-500 to-indigo-500",
  AtCoder: "from-gray-500 to-gray-700",
  Other: "from-slate-500 to-slate-700",
};

const normalizePlatform = (p: string) => {
  if (!p) return "Other";
  const map: Record<string, string> = {
    codeforces: "Codeforces",
    leetcode: "LeetCode",
    codechef: "CodeChef",
    kaggle: "Kaggle",
    atcoder: "AtCoder",
    other: "Other",
  };
  return map[p.toLowerCase()] || "Other";
};

// ============================
// TIME ENGINE (IST SAFE)
// ============================
function computeTimes(c: any) {
  const startRaw = c.startTime || c.start_time;
  const start = startRaw ? new Date(startRaw) : null;

  const durationSec =
    typeof c.duration === "number"
      ? c.duration
      : typeof c.durationSeconds === "number"
      ? c.durationSeconds
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
  }

  return {
    startTime: start?.toISOString() || "",
    endTime: end?.toISOString() || null,
    status,
  };
}

export const useContests = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContests = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/contests`);
      const json = await res.json();

      const raw = json?.data?.contests || [];

      const formatted = raw.map((c: any) => {
        const platform = normalizePlatform(c.platform);
        const timeData = computeTimes(c);

        return {
          id: c._id || c.id || crypto.randomUUID(),
          name: c.name || "Unnamed Contest",
          platform,
          platformColor:
            platformColors[platform] || platformColors.Other,
          platformInitial: platform.charAt(0),
          startTime: timeData.startTime,
          endTime: timeData.endTime,
          status: timeData.status,
          link: c.url || "#",
          isSubscribed: false,
        };
      });

      setContests(formatted);
    } catch (err) {
      console.error("Fetch contests error:", err);
      setError("Failed to load contests");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = (id: string) => {
    setContests((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isSubscribed: !c.isSubscribed }
          : c
      )
    );
  };

  useEffect(() => {
    fetchContests();
  }, []);

  return {
    contests,
    loading,
    error,
    refetch: fetchContests,
    toggleSubscription,
  };
};
