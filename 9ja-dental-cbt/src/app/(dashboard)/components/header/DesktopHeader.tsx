"use client";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { NotificationPopover } from "@/components/ui/NotificationPopover";

interface DesktopHeaderProps {
  isDesktopCollapsed?: boolean;
}

const pageTitles: Record<string, string> = {
  "/overview": "Dashboard",
  "/quiz": "Quiz Mode",
  "/leaderboard": "Leaderboard",
  "/profile": "Account Settings",
  "/study": "Study",
  "/progress": "Progress",
};
const pageHeadlines: Record<string, string> = {
  "/overview": "Level up, create quizzes and study",
  "/quiz": "Create your quiz",
  "/leaderboard": "See how you rank among your peers",
  "/profile": "Manage your account and preferences",
  "/study": "Study and review materials",
  "/progress": "Track your learning progress",
};

export default function DesktopHeader({
  isDesktopCollapsed = false,
}: DesktopHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";
  const headline =
    pageHeadlines[pathname] || "Level up, create quizzes and study";

  return (
    <header className="flex items-center justify-between gap-4 px-4 lg:px-6 py-3 border-b border-slate-200 dark:border-border bg-white dark:bg-card backdrop-blur-lg">
      <div className="flex items-center gap-4">
        {/* Space for toggle button when sidebar is collapsed */}
        <div
          className={`transition-all duration-300 ${
            isDesktopCollapsed ? "lg:w-12" : "lg:w-0"
          }`}
        ></div>
        <div className="lg:hidden w-8"></div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {headline}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
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
