"use client";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProgressStore } from "@/store/progressStore";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NotificationPopover } from "@/components/ui/NotificationPopover";
// import { ThemeToggle } from "@/components/theme/ThemeToggle";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/quiz": "Quiz Mode",
  "/dashboard/leaderboard": "Leaderboard",
  "/dashboard/profile": "Account Settings",
  "/dashboard/study": "Study",
  "/dashboard/progress": "Progress",
};

interface MobileHeaderProps {
  onStreakCalendarOpen?: () => void;
  className?: string;
}

export default function MobileHeader({
  onStreakCalendarOpen,
  className,
}: MobileHeaderProps = {}) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";
  const { recentActivity } = useProgressStore();

  // Check if user has activity today
  const hasActivityToday = recentActivity.some((activity) => {
    const activityDate = new Date(activity.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString();
  });

  return (
    <header
      className={cn(
        "lg:hidden fixed top-0 left-0 right-0 z-40 w-full",
        "flex items-center justify-between gap-4 px-4 py-3",
        "border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm",
        "supports-[padding:env(safe-area-inset-top)]:pt-[calc(env(safe-area-inset-top)+0.75rem)]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="lg:hidden w-8"></div>
        <div>
          <h1 className="text-base lg:text-lg font-medium text-slate-900 dark:text-white">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Activity Icon and Badge */}
        <motion.button
          onClick={onStreakCalendarOpen}
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
            "hover:bg-muted/50 active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            hasActivityToday && "animate-pulse"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Open recent activity. Activity count: ${recentActivity.length}`}
        >
          <Activity className="h-5 w-5 text-orange-500" />
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 font-bold text-xs px-1.5 py-0.5"
          >
            {recentActivity.length}
          </Badge>
          {hasActivityToday && (
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            />
          )}
        </motion.button>
        <NotificationPopover className="lg:hidden" />
        {/* <ThemeToggle variant="icon" /> */}
      </div>
    </header>
  );
}
