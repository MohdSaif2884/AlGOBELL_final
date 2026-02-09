import { Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatToIST } from "@/lib/timeUtils";

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
    case "codeforces":
      return { color: "from-blue-500 to-cyan-500", initial: "CF" };
    case "leetcode":
      return { color: "from-orange-500 to-yellow-500", initial: "LC" };
    case "codechef":
      return { color: "from-yellow-600 to-orange-600", initial: "CC" };
    case "atcoder":
      return { color: "from-gray-500 to-gray-700", initial: "AC" };
    case "kaggle":
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
  status,
  link,
  isSubscribed,
  onToggleSubscription,
}: Props) {
  let statusBadge = null;
  let timeLabel = "";

  if (status === "LIVE") {
    timeLabel = "LIVE NOW";
    statusBadge = (
      <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        LIVE
      </span>
    );
  } else if (status === "FINISHED") {
    timeLabel = "Finished";
    statusBadge = (
      <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
        FINISHED
      </span>
    );
  } else {
    console.log("Raw from API:", startTime);
    console.log("Parsed Date:", new Date(startTime));
    console.log("IST:", new Date(startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }));

    timeLabel = formatToIST(startTime);

    statusBadge = (
      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
        UPCOMING
      </span>
    );
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
        <div className="flex items-center gap-2">
          {statusBadge}
          <span className="text-sm text-muted-foreground">
            {timeLabel}
          </span>
        </div>

        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:text-primary/80"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {isSubscribed && (
        <div className="mt-2 text-xs text-green-400">
          ● Reminders set
        </div>
      )}
    </div>
  );
}
