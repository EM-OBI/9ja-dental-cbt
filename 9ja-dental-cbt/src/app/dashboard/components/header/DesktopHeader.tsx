"use client";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { NotificationPopover } from "@/components/ui/NotificationPopover";

interface DesktopHeaderProps {
  isDesktopCollapsed?: boolean;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/quiz": "Quiz Mode",
  "/dashboard/leaderboard": "Leaderboard",
  "/dashboard/profile": "Account Settings",
  "/dashboard/study": "Study",
  "/dashboard/progress": "Progress",
};
const pageHeadlines: Record<string, string> = {
  "/dashboard": "Level up, create quizzes and study",
  "/dashboard/quiz": "Create your quiz",
  "/dashboard/leaderboard": "See how you rank among your peers",
  "/dashboard/profile": "Manage your account and preferences",
  "/dashboard/study": "Study and review materials",
  "/dashboard/progress": "Track your learning progress",
};

export default function DesktopHeader({
  isDesktopCollapsed = false,
}: DesktopHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";
  const headline =
    pageHeadlines[pathname] || "Level up, create quizzes and study";

  return (
    <header className="flex items-center justify-between gap-4 px-4 lg:px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        {/* Space for toggle button when sidebar is collapsed */}
        <div
          className={`transition-all duration-300 ${
            isDesktopCollapsed ? "lg:w-12" : "lg:w-0"
          }`}
        ></div>
        <div className="lg:hidden w-8"></div>
        <div>
          <h1 className="text-base lg:text-lg font-medium text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-xs lg:text-sm text-slate-600 dark:text-white/60">
            {headline}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationPopover />
        <button
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Help"
        >
          <HelpCircle className="h-5 w-5 text-slate-700 dark:text-white" />
        </button>
      </div>
    </header>
  );
}
