import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MonthlyStatsProps {
  attendanceRate?: number;
  remindersSent?: number;
}

const MonthlyStats = ({ attendanceRate = 94, remindersSent = 23 }: MonthlyStatsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">This Month</h3>
      </div>
      
      <div className="space-y-4">
        {/* Attendance Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Attendance Rate</span>
            <span className="text-sm font-semibold text-success">{attendanceRate}%</span>
          </div>
          <Progress value={attendanceRate} className="h-2" />
        </div>
        
        {/* Reminders Sent */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Reminders Sent</span>
            <span className="text-sm font-semibold">{remindersSent}</span>
          </div>
          <Progress value={(remindersSent / 30) * 100} className="h-2" />
        </div>
      </div>
    </motion.div>
  );
};

export default MonthlyStats;
