 import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Volume2,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import ContestCard from "@/components/dashboard/ContestCard";
import ReminderSettings from "@/components/dashboard/ReminderSettings";
import AlarmNotification from "@/components/alarm/AlarmNotification";
import PlatformFilter from "@/components/dashboard/PlatformFilter";
import ReminderOffsets from "@/components/dashboard/ReminderOffsets";
import NotificationChannels from "@/components/dashboard/NotificationChannels";
import MonthlyStats from "@/components/dashboard/MonthlyStats";
import WhatsAppSetup from "@/components/dashboard/WhatsAppSetup";
import UpcomingContestsList from "@/components/dashboard/UpcomingContestsList";
import { useAlarm } from "@/hooks/useAlarm";
import { useContests } from "@/hooks/useContests";
import { useAuth } from "@/contexts/AuthContext";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Calendar, label: "Contests", id: "contests" },
  { icon: Settings, label: "Settings", id: "settings" },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const { alarmState, dismissAlarm, snoozeAlarm, triggerAlarm } = useAlarm();
  const { contests, loading, error, refetch, toggleSubscription } = useContests();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Get user display name and initials
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  // Filter contests by platform
  const filteredContests = selectedPlatform === "all"
    ? contests
    : contests.filter((c) => c.platform === selectedPlatform);

  // Count contests by platform
  const contestCounts = contests.reduce((acc, contest) => {
    acc[contest.platform] = (acc[contest.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get time until for alarm display
  const getTimeUntilDisplay = () => {
    if (!alarmState.currentAlarm) return "Now";
    const offsetMins = alarmState.currentAlarm.offsetMinutes;
    if (offsetMins === 0) return "Starting Now! 🚀";
    return `${offsetMins} min remaining`;
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Alarm Notification Modal */}
      <AlarmNotification
        contestName={alarmState.currentAlarm?.contestName || "Contest"}
        platform={alarmState.currentAlarm?.platform || "Platform"}
        timeUntil={getTimeUntilDisplay()}
        isOpen={alarmState.isRinging}
        onDismiss={dismissAlarm}
        onSnooze={() => snoozeAlarm(5)}
      />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="feature-icon h-8 w-8">
            <Bell className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">AlgoBell</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="lg:translate-x-0 fixed top-0 left-0 z-40 h-full w-[280px] border-r border-white/5 bg-background/95 backdrop-blur-xl transition-transform lg:transition-none"
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <Link to="/" className="hidden lg:flex items-center gap-2 mb-8">
            <div className="feature-icon h-10 w-10">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AlgoBell</span>
          </Link>

          {/* Nav Items */}
          <nav className="flex-1 mt-16 lg:mt-0">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                {userInitial}
              </div>
              <div>
                <div className="text-sm font-medium">{userName}</div>
                <div className="text-xs text-muted-foreground">Free Plan</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-[280px] pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "contests" && "Contest Explorer"}
              {activeTab === "settings" && "Reminder Settings"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === "dashboard" &&
                "Track your upcoming contests and performance at a glance."}
              {activeTab === "contests" &&
                "Browse and subscribe to contests from all platforms."}
              {activeTab === "settings" &&
                "Customize when and how you receive notifications."}
            </p>
          </motion.div>

          {/* Dashboard View */}
          {activeTab === "dashboard" && (
            <>
              {/* Test Alarm Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                    In-App Alarm
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Test how the alarm will sound on your phone
                  </p>
                </div>
                <Button
                  variant="hero"
                  onClick={() => triggerAlarm("Codeforces Round #924", "Codeforces", "10 min")}
                  className="gap-2 shrink-0"
                >
                  <Bell className="h-4 w-4" />
                  Test Alarm 🔔
                </Button>
              </motion.div>

              {/* Main Dashboard Grid - Two Columns */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Upcoming Contests */}
                <div className="lg:col-span-2">
                  <UpcomingContestsList
                    contests={contests}
                    onSubscribe={toggleSubscription}
                    onViewAll={() => setActiveTab("contests")}
                    loading={loading}
                  />
                  
                  {error && (
                    <div className="mt-4 glass-card p-4 text-center">
                      <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                      <p className="text-sm text-destructive">{error}</p>
                      <Button variant="glass" size="sm" onClick={refetch} className="mt-3">
                        Try Again
                      </Button>
                    </div>
                  )}
                </div>

                {/* Right Column - Settings Widgets */}
                <div className="space-y-4">
                  <ReminderOffsets />
                  <NotificationChannels />
                  <WhatsAppSetup isPro={true} />
                  <MonthlyStats attendanceRate={94} remindersSent={23} />
                </div>
              </div>
            </>
          )}

          {/* Contests View */}
          {activeTab === "contests" && (
            <div>
              {/* Platform Filters */}
              <PlatformFilter
                selected={selectedPlatform}
                onSelect={setSelectedPlatform}
                contestCounts={contestCounts}
              />
              
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {filteredContests.length} {selectedPlatform === "all" ? "contests from all platforms" : `${selectedPlatform} contests`}
                </p>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={refetch}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
              
              {loading && contests.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">Loading contests...</span>
                </div>
              ) : filteredContests.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No {selectedPlatform} contests found</p>
                  <Button 
                    variant="glass" 
                    size="sm" 
                    onClick={() => setSelectedPlatform("all")} 
                    className="mt-4"
                  >
                    Show All Platforms
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContests.map((contest) => (
                    <ContestCard 
                      key={contest.id} 
                      {...contest}
                      onToggleSubscription={toggleSubscription}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings View */}
          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <ReminderSettings />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
