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
    <header className="flex items-center justify-between gap-4 px-8 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Space for toggle button when sidebar is collapsed */}
        <div
          className={`transition-all duration-300 ${isDesktopCollapsed ? "lg:w-12" : "lg:w-0"
            }`}
        ></div>
        <div className="lg:hidden w-8"></div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            {headline}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationPopover />
        <button
          className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          title="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
