 import { motion } from "framer-motion";
import { Bell, ArrowRight, Zap, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const HeroSection = () => {
  const location = useLocation();

  // 🔥 HARD STOP — Hero only exists on landing page
  if (location.pathname !== "/") return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient pt-16">
      {/* Animated Background Orbs */}
      <div className="gradient-orb w-[500px] h-[500px] bg-primary/30 -top-20 -left-20" />
      <div
        className="gradient-orb w-[400px] h-[400px] bg-accent/30 top-1/2 -right-20"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="gradient-orb w-[300px] h-[300px] bg-success/20 bottom-20 left-1/3"
        style={{ animationDelay: "4s" }}
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-hero-pattern opacity-50" />

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 mb-8"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              Smart Contest Reminders
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Never Miss a{" "}
            <span className="gradient-text text-glow">
              Coding Contest
            </span>{" "}
            Again
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            AlgoBell sends you smart reminders before contests start.
            Choose your offset, pick your channels, and focus on what
            matters—coding.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {[
              { icon: Clock, text: "30 min before" },
              { icon: Bell, text: "WhatsApp & Email" },
              { icon: CheckCircle2, text: "5 Platforms" },
            ].map((item, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm"
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/dashboard">
              <Button variant="hero" size="xl" className="group">
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="hero-outline" size="xl">
                See How It Works
              </Button>
            </a>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 flex flex-col items-center"
          >
            <div className="flex -space-x-3 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-xs font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by{" "}
              <span className="text-foreground font-semibold">
                2,500+
              </span>{" "}
              competitive programmers
            </p>
          </motion.div>
        </div>

        {/* Floating Contest Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 max-w-md mx-auto"
        >
          <div className="glass-card p-6 animate-float">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-primary font-medium uppercase tracking-wider">
                  Upcoming
                </span>
                <h3 className="text-lg font-semibold mt-1">
                  Codeforces Round #924
                </h3>
              </div>
              <div className="feature-icon h-10 w-10">
                <Bell className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Starts in 2h 30m
              </span>
              <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
                Reminder Set
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
