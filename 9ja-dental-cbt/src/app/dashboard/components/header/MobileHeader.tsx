"use client";
import { usePathname } from "next/navigation";
import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProgressStore } from "@/store/progressStore";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
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
}

export default function MobileHeader({
  onStreakCalendarOpen,
}: MobileHeaderProps = {}) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";
  const { streakData, recentActivity, initializeStreakData } =
    useProgressStore();
  const [mounted, setMounted] = useState(false);

  // Initialize streak data after hydration
  useEffect(() => {
    setMounted(true);
    initializeStreakData();
  }, [initializeStreakData]);

  // Check if user has activity today
  const hasActivityToday = recentActivity.some((activity) => {
    const activityDate = new Date(activity.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString();
  });

  // Prevent hydration mismatch by showing 0 until mounted
  const displayStreak = mounted ? streakData.currentStreak : 0;

  return (
    <header className="flex items-center justify-between gap-4 px-4 lg:px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        <div className="lg:hidden w-8"></div>
        <div>
          <h1 className="text-base lg:text-lg font-medium text-slate-900 dark:text-white">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Streak Flame Icon and Badge */}
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
          aria-label={`Open streak calendar. Current streak: ${displayStreak} days`}
        >
          <Flame className="h-5 w-5 text-orange-500" />
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 font-bold text-xs px-1.5 py-0.5"
          >
            {displayStreak}
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
        <div className="h-8 w-8 rounded-full bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80')]"></div>
      </div>
    </header>
  );
}
