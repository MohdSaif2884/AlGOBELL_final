 import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  isNative,
  scheduleContestNotification,
  cancelContestNotification,
} from "@/lib/capacitor";

export interface ScheduledAlarm {
  id: string;
  contestId: string;
  contestName: string;
  platform: string;
  triggerTime: number;
  offsetMinutes: number;
  nativeNotificationId?: number;
}

interface AlarmState {
  isRinging: boolean;
  currentAlarm: ScheduledAlarm | null;
}

const STORAGE_KEY = "algobell-alarms";

// =======================
// STORAGE
// =======================
const loadAlarms = (): ScheduledAlarm[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveAlarms = (alarms: ScheduledAlarm[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
};

export const useAlarm = () => {
  const [alarms, setAlarms] = useState<ScheduledAlarm[]>([]);
  const [alarmState, setAlarmState] = useState<AlarmState>({
    isRinging: false,
    currentAlarm: null,
  });

  const timers = useRef<Record<string, number>>({});

  // =======================
  // RING
  // =======================
  const ringAlarm = (alarm: ScheduledAlarm) => {
    setAlarmState({
      isRinging: true,
      currentAlarm: alarm,
    });
  };

  // =======================
  // TIMER
  // =======================
  const armTimer = (alarm: ScheduledAlarm) => {
    const delay = alarm.triggerTime - Date.now();
    if (delay <= 0) return;

    const timerId = window.setTimeout(() => {
      ringAlarm(alarm);
    }, delay);

    timers.current[alarm.id] = timerId;
  };

  // =======================
  // SCHEDULE
  // =======================
  const scheduleAlarm = useCallback(
    async (
      contestId: string,
      contestName: string,
      platform: string,
      contestStartTime: Date,
      offsetMinutes: number
    ) => {
      const triggerTime =
        contestStartTime.getTime() - offsetMinutes * 60000;

      if (triggerTime <= Date.now()) return null;

      const id = `${contestId}-${offsetMinutes}`;

      let nativeNotificationId: number | undefined;

      if (isNative()) {
        const notifId = await scheduleContestNotification(
          contestId,
          contestName,
          platform,
          new Date(triggerTime),
          offsetMinutes
        );
        nativeNotificationId = notifId ?? undefined;
      }

      const alarm: ScheduledAlarm = {
        id,
        contestId,
        contestName,
        platform,
        triggerTime,
        offsetMinutes,
        nativeNotificationId,
      };

      setAlarms((prev) => {
        const updated = prev.filter((a) => a.id !== id);
        const result = [...updated, alarm];
        saveAlarms(result);
        return result;
      });

      armTimer(alarm);

      toast.success(
        `Alarm set for ${offsetMinutes} min before ${contestName}`
      );

      return id;
    },
    []
  );

  // =======================
  // CANCEL
  // =======================
  const cancelAlarm = useCallback(
    async (alarmId: string) => {
      const alarm = alarms.find((a) => a.id === alarmId);

      if (alarm?.nativeNotificationId && isNative()) {
        await cancelContestNotification(
          alarm.nativeNotificationId
        );
      }

      if (timers.current[alarmId]) {
        clearTimeout(timers.current[alarmId]);
        delete timers.current[alarmId];
      }

      setAlarms((prev) => {
        const updated = prev.filter((a) => a.id !== alarmId);
        saveAlarms(updated);
        return updated;
      });
    },
    [alarms]
  );

  // =======================
  // DISMISS
  // =======================
  const dismissAlarm = useCallback(() => {
    setAlarmState({
      isRinging: false,
      currentAlarm: null,
    });
  }, []);

  // =======================
  // SNOOZE
  // =======================
  const snoozeAlarm = useCallback(
    (minutes = 5) => {
      const current = alarmState.currentAlarm;
      if (!current) return;

      const triggerTime = Date.now() + minutes * 60000;

      const snoozed: ScheduledAlarm = {
        ...current,
        id: `${current.id}-snooze`,
        triggerTime,
        offsetMinutes: -minutes,
      };

      setAlarms((prev) => {
        const updated = [...prev, snoozed];
        saveAlarms(updated);
        return updated;
      });

      armTimer(snoozed);

      toast.info(`Snoozed for ${minutes} minutes`);
      dismissAlarm();
    },
    [alarmState.currentAlarm, dismissAlarm]
  );

  // =======================
  // TEST ALARM
  // =======================
  const triggerAlarm = useCallback(
    (contestName: string, platform: string) => {
      const testAlarm: ScheduledAlarm = {
        id: "test-alarm",
        contestId: "test",
        contestName,
        platform,
        triggerTime: Date.now(),
        offsetMinutes: 0,
      };

      ringAlarm(testAlarm);
    },
    []
  );

  // =======================
  // LOAD ON START
  // =======================
  useEffect(() => {
    const stored = loadAlarms();
    setAlarms(stored);
    stored.forEach(armTimer);
  }, []);

  return {
    alarms,
    alarmState,
    scheduleAlarm,
    cancelAlarm,
    dismissAlarm,
    snoozeAlarm,
    triggerAlarm,
  };
};
