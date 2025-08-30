"use client";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Flame } from "lucide-react";

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

export default function MobileHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header className="flex items-center justify-between gap-4 px-4 lg:px-6 py-4 border-b border-white/10 bg-slate-900 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        <div className="lg:hidden w-8"></div>
        <div>
          <h1 className="text-base lg:text-lg font-medium">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-row gap-2 items-center">
          <Flame className="h-5 w-5 " />
          <span className="text-base text-gray-600 dark:text-gray-300">0</span>
        </div>

        <button className="relative " type="button" title="Bell Icon">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-500"></span>
        </button>
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
