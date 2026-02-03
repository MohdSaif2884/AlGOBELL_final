 import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Volume2, VolumeX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AlarmNotification({
  contestName,
  platform,
  timeUntil,
  isOpen,
  onDismiss,
  onSnooze,
}: any) {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const loopRef = useRef<number | null>(null);

  // =====================
  // SOUND ENGINE
  // =====================
  const playSound = () => {
    if (isMuted) return;

    try {
      const AudioCtx =
        window.AudioContext || (window as any).webkitAudioContext;

      audioCtx.current = new AudioCtx();
      const ctx = audioCtx.current;

      const beep = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = freq;
        osc.type = "sine";

        gain.gain.setValueAtTime(0.4, start);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          start + duration
        );

        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;

      // Loveable pattern (DO-RE-DO)
      for (let i = 0; i < 3; i++) {
        beep(880, now + i * 0.5, 0.18);
        beep(1100, now + i * 0.5 + 0.18, 0.18);
      }
    } catch (err) {
      console.log("Sound blocked:", err);
    }
  };

  const stopSound = () => {
    if (loopRef.current) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }

    if (audioCtx.current) {
      audioCtx.current.close();
      audioCtx.current = null;
    }
  };

  // =====================
  // AUTO LOOP
  // =====================
  useEffect(() => {
    if (!isOpen) return;

    playSound();

    loopRef.current = window.setInterval(() => {
      playSound();
    }, 3000);

    return () => stopSound();
  }, [isOpen, isMuted]);

  // =====================
  // ACTIONS
  // =====================
  const handleDismiss = () => {
    stopSound();
    onDismiss();
  };

  const handleSnooze = () => {
    stopSound();
    onSnooze();
  };

  // =====================
  // UI
  // =====================
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* MODAL */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-card w-[380px] p-8 text-center relative overflow-hidden">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />

              {/* CLOSE */}
              <button
                className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-lg"
                onClick={handleDismiss}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              {/* MUTE */}
              <button
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg"
                onClick={() => setIsMuted((m) => !m)}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-5 w-5 text-primary" />
                )}
              </button>

              {/* BELL */}
              <motion.div
                animate={{ rotate: [0, -20, 20, -20, 20, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="mx-auto mb-6 relative z-10"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl animate-glow-pulse">
                  <Bell className="h-10 w-10 text-white" />
                </div>
              </motion.div>

              {/* TEXT */}
              <h2 className="text-2xl font-bold mb-1 relative z-10">
                🔔 Contest Alert!
              </h2>

              <p className="text-lg relative z-10">
                {contestName}
              </p>

              <p className="text-sm text-muted-foreground mb-4 relative z-10">
                {platform}
              </p>

              <div className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full mb-6 relative z-10">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">
                  {timeUntil}
                </span>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 relative z-10">
                <Button
                  className="flex-1"
                  variant="hero"
                  onClick={handleDismiss}
                >
                  Go to Contest
                </Button>

                <Button
                  className="flex-1"
                  variant="glass"
                  onClick={handleSnooze}
                >
                  Snooze 5 min
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
