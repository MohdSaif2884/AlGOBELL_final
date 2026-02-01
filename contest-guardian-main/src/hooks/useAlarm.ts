 import { useEffect, useRef, useState } from "react";

export interface AlarmContest {
  id: string;
  name: string;
  platform: string;
  startTime: string;
}

export interface AlarmEvent {
  contestId: string;
  contestName: string;
  platform: string;
  offsetMinutes: number; // 0 = LIVE
  fireTime: number; // timestamp (ms)
}

interface AlarmState {
  isRinging: boolean;
  currentAlarm: AlarmEvent | null;
}

const STORAGE_KEY = "scheduled-alarms";

// ============================
// LOCAL STORAGE HELPERS
// ============================
function loadAlarms(): AlarmEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAlarms(alarms: AlarmEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
}

// ============================
// HOOK
// ============================
export function useAlarm() {
  const [alarmState, setAlarmState] = useState<AlarmState>({
    isRinging: false,
    currentAlarm: null,
  });

  const timers = useRef<Record<string, number>>({});

  // ============================
  // RING ALARM
  // ============================
  const ringAlarm = (alarm: AlarmEvent) => {
    setAlarmState({
      isRinging: true,
      currentAlarm: alarm,
    });

    try {
      const audio = new Audio("/alarm.mp3");
      audio.play().catch(() => {});
    } catch {}
  };

  // ============================
  // SCHEDULE ONE ALARM
  // ============================
  const scheduleSingle = (alarm: AlarmEvent) => {
    const delay = alarm.fireTime - Date.now();

    if (delay <= 0) return;

    const id = window.setTimeout(() => {
      ringAlarm(alarm);
    }, delay);

    timers.current[`${alarm.contestId}-${alarm.offsetMinutes}`] = id;
  };

  // ============================
  // PUBLIC: SCHEDULE ALARMS
  // ============================
  const scheduleAlarms = (
    contest: AlarmContest,
    offsets: number[],
    includeLive: boolean
  ) => {
    const start = new Date(contest.startTime).getTime();
    if (isNaN(start)) return;

    let alarms = loadAlarms();

    // Remove old alarms for same contest
    alarms = alarms.filter(
      (a) => a.contestId !== contest.id
    );

    const newAlarms: AlarmEvent[] = [];

    offsets.forEach((min) => {
      const fireTime = start - min * 60 * 1000;

      if (fireTime > Date.now()) {
        newAlarms.push({
          contestId: contest.id,
          contestName: contest.name,
          platform: contest.platform,
          offsetMinutes: min,
          fireTime,
        });
      }
    });

    // LIVE alarm
    if (includeLive && start > Date.now()) {
      newAlarms.push({
        contestId: contest.id,
        contestName: contest.name,
        platform: contest.platform,
        offsetMinutes: 0,
        fireTime: start,
      });
    }

    const updated = [...alarms, ...newAlarms];

    saveAlarms(updated);

    // Schedule timers
    newAlarms.forEach(scheduleSingle);
  };

  // ============================
  // DISMISS
  // ============================
  const dismissAlarm = () => {
    setAlarmState({
      isRinging: false,
      currentAlarm: null,
    });
  };

  // ============================
  // SNOOZE
  // ============================
  const snoozeAlarm = (minutes = 5) => {
    if (!alarmState.currentAlarm) return;

    const snoozed: AlarmEvent = {
      ...alarmState.currentAlarm,
      offsetMinutes: -minutes,
      fireTime: Date.now() + minutes * 60 * 1000,
    };

    scheduleSingle(snoozed);

    dismissAlarm();
  };

  // ============================
  // LOAD ALARMS ON START
  // ============================
  useEffect(() => {
    const alarms = loadAlarms();
    alarms.forEach(scheduleSingle);
  }, []);

  // ============================
  // PUBLIC API
  // ============================
  return {
    alarmState,
    scheduleAlarms,
    dismissAlarm,
    snoozeAlarm,
  };
}
