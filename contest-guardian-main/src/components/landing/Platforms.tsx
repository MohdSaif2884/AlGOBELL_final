import { motion } from "framer-motion";

const platforms = [
  {
    name: "Codeforces",
    color: "from-blue-500 to-blue-600",
    initial: "CF",
  },
  {
    name: "LeetCode",
    color: "from-amber-500 to-orange-500",
    initial: "LC",
  },
  {
    name: "CodeChef",
    color: "from-amber-600 to-yellow-500",
    initial: "CC",
  },
  {
    name: "AtCoder",
    color: "from-gray-600 to-gray-700",
    initial: "AC",
  },
  {
    name: "HackerRank",
    color: "from-green-500 to-emerald-500",
    initial: "HR",
  },
];

const Platforms = () => {
  return (
    <section id="platforms" className="relative py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm text-primary font-medium uppercase tracking-wider">Supported Platforms</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            All Major Platforms, One Dashboard
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We automatically sync contests from the biggest competitive programming platforms.
          </p>
        </motion.div>

        {/* Platforms Grid */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="platform-badge cursor-pointer group"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-110`}>
                {platform.initial}
              </div>
              <span className="font-medium">{platform.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: "500+", label: "Contests Tracked Monthly" },
            { value: "24/7", label: "Auto-Sync" },
            { value: "99.9%", label: "Uptime" },
            { value: "<1min", label: "Sync Delay" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Platforms;
