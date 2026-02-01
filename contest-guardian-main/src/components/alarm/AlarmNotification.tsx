import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Clock, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlarmNotificationProps {
  contestName: string;
  platform: string;
  timeUntil: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSnooze: () => void;
}

const AlarmNotification = ({
  contestName,
  platform,
  timeUntil,
  isOpen,
  onDismiss,
  onSnooze,
}: AlarmNotificationProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Create alarm sound using Web Audio API
  const playAlarmSound = () => {
    if (isMuted) return;

    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      const ctx = audioContextRef.current;

      const playBeep = (frequency: number, startTime: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play alarm pattern
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        playBeep(880, now + i * 0.4, 0.15);
        playBeep(1100, now + i * 0.4 + 0.15, 0.15);
      }
    } catch (error) {
      console.log("Audio playback failed:", error);
    }
  };

  const stopAlarmSound = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen && !isMuted) {
      playAlarmSound();
      // Repeat alarm every 3 seconds
      const interval = setInterval(() => {
        if (!isMuted) playAlarmSound();
      }, 3000);

      return () => {
        clearInterval(interval);
        stopAlarmSound();
      };
    }
  }, [isOpen, isMuted]);

  const handleDismiss = () => {
    stopAlarmSound();
    onDismiss();
  };

  const handleSnooze = () => {
    stopAlarmSound();
    onSnooze();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Alarm Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-card w-full max-w-md p-8 text-center relative overflow-hidden">
              {/* Animated background pulse */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />

              {/* Content */}
              <div className="relative z-10">
                {/* Bell Icon with animation */}
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  className="mx-auto mb-6"
                >
                  <div className="feature-icon h-20 w-20 mx-auto animate-glow-pulse">
                    <Bell className="h-10 w-10 text-white" />
                  </div>
                </motion.div>

                {/* Contest Info */}
                <h2 className="text-2xl font-bold mb-2">🔔 Contest Alert!</h2>
                <p className="text-lg text-foreground mb-1">{contestName}</p>
                <p className="text-sm text-muted-foreground mb-2">{platform}</p>

                {/* Time Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 mb-6">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-primary font-semibold">{timeUntil}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    onClick={handleDismiss}
                  >
                    Go to Contest
                  </Button>
                  <Button
                    variant="glass"
                    size="lg"
                    className="flex-1"
                    onClick={handleSnooze}
                  >
                    Snooze 5 min
                  </Button>
                </div>

                {/* Mute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-primary" />
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 left-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AlarmNotification;
