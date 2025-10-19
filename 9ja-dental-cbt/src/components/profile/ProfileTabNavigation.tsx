import { cn } from "@/lib/utils";

export type ProfileTab =
  | "profile"
  | "achievements"
  | "settings"
  | "subscription";

interface ProfileTabNavigationProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

export function ProfileTabNavigation({
  activeTab,
  onTabChange,
}: ProfileTabNavigationProps) {
  const tabs: Array<{ key: ProfileTab; label: string }> = [
    { key: "profile", label: "Profile" },
    { key: "achievements", label: "Achievements" },
    { key: "settings", label: "Settings" },
    { key: "subscription", label: "Subscription" },
  ];

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-2 border border-amber-200/50 dark:border-slate-700 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center justify-center px-3 py-3 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 min-h-[2.5rem] touch-manipulation",
              activeTab === tab.key
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-700/50 hover:text-amber-700 dark:hover:text-amber-300 active:scale-95"
            )}
          >
            <span className="truncate">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
