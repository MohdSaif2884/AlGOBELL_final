import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  reminderOffsets?: number[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const DEFAULT_LIMIT = 300;

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

function mapStatus(status?: string): "UPCOMING" | "LIVE" | "FINISHED" {
  const s = String(status || "").toLowerCase();
  if (s === "live") return "LIVE";
  if (s === "ended") return "FINISHED";
  return "UPCOMING";
}

export const useContests = () => {
  const { user, session } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContests = async () => {
    const res = await fetch(
      `${API_URL}/api/contests?limit=${DEFAULT_LIMIT}`
    );
    const json = await res.json();

    const raw = json?.data?.contests || [];

    const formatted: Contest[] = raw.map((c: any) => {
      const platform = String(c.platform || "other").toLowerCase();

      return {
        id: c._id,
        name: c.name || "Unnamed Contest",
        platform,
        platformColor:
          platformColors[platform] || platformColors.other,
        platformInitial: platform.charAt(0).toUpperCase(),
        startTime: new Date(c.startTime).toISOString(),
        endTime: c.endTime
          ? new Date(c.endTime).toISOString()
          : null,
        status: mapStatus(c.status),
        link: c.url || "#",
        isSubscribed: false, // Will be overridden by merge
      };
    });

    return formatted;
  };

  const fetchSubscriptions = async () => {
    if (!session?.token) return [];

    const res = await fetch(`${API_URL}/api/reminders/subscriptions`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json?.data?.subscriptions || [];
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const contests = await fetchContests();

      if (!user) {
        setContests(contests);
        return;
      }

      const subs = await fetchSubscriptions();

      const merged = contests.map(c => {
        const match = subs.find((s: any) => String(s.contestId) === String(c.id));
        return {
          ...c,
          isSubscribed: !!match,
          reminderOffsets: match ? match.offsetMinutes : [],
        };
      });

      setContests(merged);
    } catch (err) {
      console.error("Load data error:", err);
      setError("Failed to load contests");
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscription = async (id: string): Promise<boolean> => {
    if (!session?.token) return false;

    try {
      const contest = contests.find(c => c.id === id);
      if (!contest) return false;

      const method = contest.isSubscribed ? "DELETE" : "POST";
      const url = contest.isSubscribed
        ? `${API_URL}/api/contests/${id}/unsubscribe`
        : `${API_URL}/api/contests/${id}/subscribe`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (res.ok) {
        // Refetch data to update state
        await loadData();
        return true;
      } else {
        console.error("Subscription API error:", res.status, res.statusText);
        return false;
      }
    } catch (err) {
      console.error("Toggle subscription error:", err);
      return false;
    }
  };

  useEffect(() => {
    if (user !== undefined) { // Wait for auth state to be determined
      loadData();
    }
  }, [user]);

  return {
    contests,
    loading,
    error,
    refetch: loadData,
    toggleSubscription,
  };
};
