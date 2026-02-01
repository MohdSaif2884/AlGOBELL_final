 import { useEffect, useState } from "react";

const STORAGE_KEY = "alarm-offsets";

type OffsetSettings = {
  before60: boolean;
  before30: boolean;
  before10: boolean;
  onLive: boolean;
};

const DEFAULTS: OffsetSettings = {
  before60: true,
  before30: true,
  before10: false,
  onLive: true,
};

export default function ReminderOffsets() {
  const [settings, setSettings] = useState<OffsetSettings>(DEFAULTS);

  // =========================
  // LOAD FROM STORAGE
  // =========================
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULTS, ...parsed });
      }
    } catch {
      setSettings(DEFAULTS);
    }
  }, []);

  // =========================
  // SAVE TO STORAGE
  // =========================
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // =========================
  // TOGGLE
  // =========================
  const toggle = (key: keyof OffsetSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="font-semibold mb-1">
        ⏰ Reminder Offsets
      </h3>
      <p className="text-sm text-muted-foreground mb-2">
        When should we remind you?
      </p>

      <Row
        label="60 minutes before"
        checked={settings.before60}
        onChange={() => toggle("before60")}
      />
      <Row
        label="30 minutes before"
        checked={settings.before30}
        onChange={() => toggle("before30")}
      />
      <Row
        label="10 minutes before"
        checked={settings.before10}
        onChange={() => toggle("before10")}
      />
      <Row
        label="When contest goes LIVE"
        checked={settings.onLive}
        onChange={() => toggle("onLive")}
      />
    </div>
  );
}

// =========================
// UI ROW
// =========================
function Row({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-all ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`block w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
