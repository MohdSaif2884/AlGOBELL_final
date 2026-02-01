 import { Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  name: string;
  platform: string;
  startTime: string;
  endTime: string | null;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  link: string;
  isSubscribed: boolean;
  onToggleSubscription: (id: string) => void;
}

function getPlatformStyle(platform: string) {
  switch (platform) {
    case "Codeforces":
      return { color: "from-blue-500 to-cyan-500", initial: "CF" };
    case "LeetCode":
      return { color: "from-orange-500 to-yellow-500", initial: "LC" };
    case "CodeChef":
      return { color: "from-yellow-600 to-orange-600", initial: "CC" };
    case "AtCoder":
      return { color: "from-gray-500 to-gray-700", initial: "AC" };
    case "Kaggle":
      return { color: "from-purple-500 to-pink-500", initial: "K" };
    default:
      return { color: "from-slate-500 to-slate-700", initial: "O" };
  }
}

export default function ContestCard({
  id,
  name,
  platform,
  startTime,
  endTime,
  status,
  link,
  isSubscribed,
  onToggleSubscription,
}: Props) {
  const now = new Date();
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : null;

  const isLive =
    status === "LIVE" ||
    (start && end && now >= start && now <= end);

  const isFinished =
    status === "FINISHED" ||
    (end && now > end);

  function formatTimeDiff(ms: number) {
    const totalMin = Math.floor(ms / 60000);
    const days = Math.floor(totalMin / 1440);
    const hours = Math.floor((totalMin % 1440) / 60);
    const mins = totalMin % 60;

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  let timeLabel = "Time unavailable";

  if (isFinished) {
    timeLabel = "Finished";
  } else if (isLive) {
    timeLabel = "LIVE";
  } else {
    const diff = start.getTime() - now.getTime();
    timeLabel = `Starts in ${formatTimeDiff(diff)}`;
  }

  const style = getPlatformStyle(platform);

  return (
    <div className="glass-card p-4 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${style.color} flex items-center justify-center font-bold text-white`}
          >
            {style.initial}
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase">
              {platform}
            </div>
            <div className="font-semibold leading-tight">
              {name}
            </div>
          </div>
        </div>

        <Button
          size="icon"
          variant={isSubscribed ? "default" : "ghost"}
          onClick={() => onToggleSubscription(id)}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {isLive ? (
          <span className="flex items-center gap-2 text-green-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            {timeLabel}
          </span>
        )}

        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:text-primary/80"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {isSubscribed && !isFinished && (
        <div className="mt-2 text-xs text-green-400">
          ● Reminders set
        </div>
      )}
    </div>
  );
}
