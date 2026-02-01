import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const reminderOffsets = [
  { id: "60min", label: "60 minutes before", checked: true },
  { id: "30min", label: "30 minutes before", checked: true },
  { id: "10min", label: "10 minutes before", checked: true },
  { id: "live", label: "When contest goes LIVE", checked: false },
];

const channels = [
  { id: "whatsapp", label: "WhatsApp", icon: "💬", enabled: true },
  { id: "webpush", label: "Web Push", icon: "🔔", enabled: true },
  { id: "email", label: "Email", icon: "📧", enabled: false },
  { id: "alarm", label: "In-App Alarm", icon: "⏰", enabled: false },
];

const ReminderSettings = () => {
  const [offsets, setOffsets] = useState(reminderOffsets);
  const [channelSettings, setChannelSettings] = useState(channels);

  const toggleOffset = (id: string) => {
    setOffsets(
      offsets.map((o) => (o.id === id ? { ...o, checked: !o.checked } : o))
    );
  };

  const toggleChannel = (id: string) => {
    setChannelSettings(
      channelSettings.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Reminder Offsets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Reminder Timing</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choose when you want to be reminded before a contest starts.
        </p>
        <div className="space-y-3">
          {offsets.map((offset) => (
            <label
              key={offset.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 cursor-pointer transition-colors"
            >
              <div
                onClick={() => toggleOffset(offset.id)}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                  offset.checked
                    ? "bg-primary text-white"
                    : "border border-white/20 bg-white/5"
                }`}
              >
                {offset.checked && <Check className="h-3 w-3" />}
              </div>
              <span className="text-sm">{offset.label}</span>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Notification Channels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Notification Channels</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Choose how you want to receive your contest reminders.
        </p>
        <div className="space-y-4">
          {channelSettings.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{channel.icon}</span>
                <span className="text-sm font-medium">{channel.label}</span>
              </div>
              <Switch
                checked={channel.enabled}
                onCheckedChange={() => toggleChannel(channel.id)}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ReminderSettings;
