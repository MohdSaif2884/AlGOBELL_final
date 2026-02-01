import { motion } from "framer-motion";
import { Search, Clock, Bell } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Choose Your Platforms",
    description: "Select from Codeforces, LeetCode, CodeChef, AtCoder, and HackerRank. We fetch contests automatically.",
  },
  {
    icon: Clock,
    title: "Set Your Reminder Offsets",
    description: "Pick how long before: 60 min, 30 min, 10 min, or when it goes live. No clock-setting needed.",
  },
  {
    icon: Bell,
    title: "Get Notified Your Way",
    description: "Receive alerts via WhatsApp, Web Push, Email, or In-App alarm. Never miss a contest again.",
  },
];

const HowItWorks = () => {
  return (
    <section id="features" className="relative py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm text-primary font-medium uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            Simple Setup, Smart Reminders
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three steps to never miss another coding contest. Set it once, and we handle the rest.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector Line (hidden on mobile, shown on md+) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="glass-card p-8 h-full hover:border-primary/30 transition-all duration-300 hover-glow">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="feature-icon mb-6">
                  <step.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
