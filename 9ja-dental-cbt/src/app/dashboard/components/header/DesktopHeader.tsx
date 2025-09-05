"use client";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle } from "lucide-react";

interface DesktopHeaderProps {
  isDesktopCollapsed?: boolean;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/quiz": "Quiz Mode",
  "/dashboard/settings": "Settings",
  "/dashboard/leaderboard": "Leaderboard",
  "/dashboard/profile": "Profile",
  "/dashboard/study": "Study",
  "/dashboard/specialities": "Specialities",
  "/dashboard/subscription": "Subscription",
  "/dashboard/progress": "Progress",
};
const pageHeadlines: Record<string, string> = {
  "/dashboard": "Level up, create quizzes and study",
  "/dashboard/quiz": "Create your quiz",
  "/dashboard/settings": "Manage your account settings",
  "/dashboard/leaderboard": "See how you rank among your peers",
  "/dashboard/profile": "View and edit your profile",
  "/dashboard/study": "Study and review materials",
  "/dashboard/specialities": "Explore dental specialities",
  "/dashboard/subscription": "Manage your subscription",
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
    <header className="flex items-center justify-between gap-4 px-4 lg:px-6 py-4 border-b border-white/10 bg-slate-900 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        {/* Space for toggle button when sidebar is collapsed */}
        <div
          className={`transition-all duration-300 ${
            isDesktopCollapsed ? "lg:w-12" : "lg:w-0"
          }`}
        ></div>
        <div className="lg:hidden w-8"></div>
        <div>
          <h1 className="text-base lg:text-lg font-medium">{title}</h1>
          <p className="text-xs lg:text-sm text-white/60">{headline}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative " type="button" title="Bell Icon">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-500"></span>
        </button>
        <HelpCircle className="h-5 w-5 " />
        <div
          className="h-8 w-8 rounded-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80)",
          }}
        ></div>
      </div>
    </header>
  );
}
