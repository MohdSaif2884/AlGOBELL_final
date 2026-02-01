import { motion } from "framer-motion";
import {
  MessageSquare,
  Bell,
  Mail,
  Volume2,
  Globe,
  Moon,
  Smartphone,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "WhatsApp Alerts",
    description: "Get instant WhatsApp messages with contest details and direct links.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Bell,
    title: "Web Push",
    description: "Browser notifications that work even when the tab is closed.",
    color: "from-primary to-blue-500",
  },
  {
    icon: Mail,
    title: "Email Reminders",
    description: "Clean, beautiful email digests with all your upcoming contests.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Volume2,
    title: "In-App Alarm",
    description: "Custom alarm sounds that grab your attention when needed.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Globe,
    title: "Timezone Smart",
    description: "Automatic timezone detection shows times in your local zone.",
    color: "from-cyan-500 to-teal-500",
  },
  {
    icon: Moon,
    title: "Sleep Hours",
    description: "Set quiet hours to avoid notifications during your rest time.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Beautiful responsive design that works perfectly on any device.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is encrypted and never shared with third parties.",
    color: "from-slate-500 to-zinc-500",
  },
];

const Features = () => {
  return (
    <section className="relative py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm text-primary font-medium uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            Everything You Need to Stay on Track
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to ensure you never miss a contest, no matter how you prefer to be notified.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass-card p-6 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg transition-transform group-hover:scale-110`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
