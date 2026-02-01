import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

const StatCard = ({ label, value, icon, trend }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold gradient-text">{value}</div>
      {trend && (
        <div className={`mt-2 text-xs ${trend.positive ? "text-success" : "text-destructive"}`}>
          {trend.positive ? "↑" : "↓"} {trend.value}
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
