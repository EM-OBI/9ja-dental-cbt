"use client";
import { usePathname } from "next/navigation";
// import { Activity } from "lucide-react";
// import { useProgressStore } from "@/store/progressStore";
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
  // onStreakCalendarOpen?: () => void;
  className?: string;
}

export default function MobileHeader({
  // onStreakCalendarOpen,
  className,
}: MobileHeaderProps = {}) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";
  // const { recentActivity } = useProgressStore();

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
        {/* <button
          onClick={onStreakCalendarOpen}
          className={cn(
            "relative flex items-center gap-2 p-2 rounded-lg transition-colors",
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          aria-label={`Open recent activity. Activity count: ${recentActivity.length}`}
        >
          <Activity className="h-5 w-5 text-orange-500" />
          {recentActivity.length > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-white text-xs font-medium flex items-center justify-center min-w-[20px]">
              {recentActivity.length > 99 ? "99+" : recentActivity.length}
            </div>
          )}
        </button> */}
        <NotificationPopover className="lg:hidden" />
        {/* <ThemeToggle variant="icon" /> */}
      </div>
    </header>
  );
}
