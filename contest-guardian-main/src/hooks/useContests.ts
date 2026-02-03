 import { useEffect, useState } from "react";

export interface Contest {
  id: string;
  name: string;
  platform: string; // always lowercase
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
  codeforces: "from-blue-500 to-cyan-500",
  leetcode: "from-orange-500 to-yellow-500",
  codechef: "from-yellow-600 to-orange-500",
  kaggle: "from-purple-500 to-indigo-500",
  atcoder: "from-gray-500 to-gray-700",
  hackerrank: "from-green-500 to-emerald-500",
  hackerearth: "from-pink-500 to-rose-500",
  topcoder: "from-red-500 to-orange-500",
  other: "from-slate-500 to-slate-700",
};

function computeTimes(c: any) {
  const start = new Date(c.startTime);
  const end = new Date(c.endTime);
  const now = new Date();

  let status: "UPCOMING" | "LIVE" | "FINISHED" = "UPCOMING";

  if (now >= start && now <= end) status = "LIVE";
  else if (now > end) status = "FINISHED";

  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
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

      const res = await fetch(`${API_URL}/api/contests?limit=100`);
      const json = await res.json();

      const raw = json?.data?.contests || [];

      const formatted = raw.map((c: any) => {
        const platform = String(c.platform || "other").toLowerCase();
        const timeData = computeTimes(c);

        return {
          id: c._id,
          name: c.name || "Unnamed Contest",
          platform,
          platformColor:
            platformColors[platform] || platformColors.other,
          platformInitial: platform.charAt(0).toUpperCase(),
          startTime: timeData.startTime,
          endTime: timeData.endTime,
          status: timeData.status,
          link: c.url || "#",
          isSubscribed: false,
        };
      });

      const unique = new Map<string, Contest>();
      formatted.forEach((contest) => {
        const key = contest.id || `${contest.name}-${contest.startTime}`;
        if (!unique.has(key)) {
          unique.set(key, contest);
        }
      });

      setContests(Array.from(unique.values()));
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
