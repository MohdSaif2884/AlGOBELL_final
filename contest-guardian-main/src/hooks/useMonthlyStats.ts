import { useState, useEffect } from "react";

interface MonthlyStats {
  totalSetReminders: number;
  attendedContests: number;
  remindersSent: number;
  month: string; // Format: "YYYY-MM"
}

const STORAGE_KEY = "monthly-stats";

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getDefaultStats = (): MonthlyStats => ({
  totalSetReminders: 0,
  attendedContests: 0,
  remindersSent: 0,
  month: getCurrentMonth(),
});

export const useMonthlyStats = () => {
  const [stats, setStats] = useState<MonthlyStats>(getDefaultStats());

  // Load stats from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const currentMonth = getCurrentMonth();

        // Reset stats if it's a new month
        if (parsed.month !== currentMonth) {
          const newStats = getDefaultStats();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
          setStats(newStats);
        } else {
          setStats(parsed);
        }
      } else {
        const defaultStats = getDefaultStats();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStats));
        setStats(defaultStats);
      }
    } catch (error) {
      console.error("Error loading monthly stats:", error);
      setStats(getDefaultStats());
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const incrementTotalSetReminders = () => {
    setStats(prev => ({
      ...prev,
      totalSetReminders: prev.totalSetReminders + 1
    }));
  };

  const incrementAttendedContests = () => {
    setStats(prev => ({
      ...prev,
      attendedContests: prev.attendedContests + 1
    }));
  };

  const incrementRemindersSent = () => {
    setStats(prev => ({
      ...prev,
      remindersSent: prev.remindersSent + 1
    }));
  };

  const getAttendanceRate = (): number => {
    if (stats.totalSetReminders === 0) return 0;
    return Math.round((stats.attendedContests / stats.totalSetReminders) * 100);
  };

  const getRemindersProgress = (): { current: number; max: number } => {
    return { current: stats.remindersSent, max: 30 }; // Monthly target of 30
  };

  return {
    stats,
    incrementTotalSetReminders,
    incrementAttendedContests,
    incrementRemindersSent,
    getAttendanceRate,
    getRemindersProgress,
  };
};
