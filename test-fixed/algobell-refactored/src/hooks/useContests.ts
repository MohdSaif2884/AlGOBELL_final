 import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:4000/api/contests";

// Normalize platform from backend → UI
function normalizePlatform(p: string) {
  const s = p.toLowerCase();
  if (s.includes("codeforces")) return "Codeforces";
  if (s.includes("leetcode")) return "LeetCode";
  if (s.includes("codechef")) return "CodeChef";
  if (s.includes("atcoder")) return "AtCoder";
  if (s.includes("kaggle")) return "Kaggle";
  return "Other";
}

// Normalize status
function normalizeStatus(status: string) {
  const s = status.toLowerCase();
  if (s === "live") return "LIVE";
  if (s === "upcoming") return "UPCOMING";
  return "FINISHED";
}

export function useContests() {
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(API);
      const raw = res.data?.data?.contests || [];

      const normalized = raw.map((c: any) => ({
        id: c._id,
        name: c.name,
        platform: normalizePlatform(c.platform),
        platformRaw: c.platform,
        startTime: c.startTime,
        endTime: c.endTime,
        link: c.url,
        status: normalizeStatus(c.status),
        isSubscribed: false,
      }));

      // Hide finished contests
      const filtered = normalized.filter(
        (c: any) => c.status !== "FINISHED"
      );

      setContests(filtered);
    } catch (err) {
      console.error(err);
      setError("Failed to load contests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const toggleSubscription = (id: string) => {
    setContests((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isSubscribed: !c.isSubscribed }
          : c
      )
    );
  };

  return {
    contests,
    loading,
    error,
    refetch: fetchContests,
    toggleSubscription,
  };
}
