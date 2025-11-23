"use client";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationPopover } from "@/components/ui/NotificationPopover";

const pageTitles: Record<string, string> = {
  "/overview": "Dashboard",
  "/quiz": "Quiz Mode",
  "/leaderboard": "Leaderboard",
  "/profile": "Account Settings",
  "/study": "Study",
  "/progress": "Progress",
};

interface MobileHeaderProps {
  className?: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function MobileHeader({
  className,
  isSidebarOpen = false,
  onToggleSidebar,
}: MobileHeaderProps = {}) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <header
      className={cn(
        "lg:hidden fixed top-0 left-0 right-0 z-40 w-full",
        "flex items-center justify-between gap-4 px-4 py-3",
        "border-b border-slate-200 dark:border-border bg-white/95 dark:bg-card backdrop-blur-sm",
        "supports-[padding:env(safe-area-inset-top)]:pt-[calc(env(safe-area-inset-top)+0.75rem)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            title="Toggle sidebar"
            aria-label="Toggle mobile sidebar"
            type="button"
            onClick={onToggleSidebar}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isSidebarOpen
                ? "text-slate-900 dark:text-white"
                : "text-[#002E5D] hover:text-[#FFB81C]"
            )}
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        )}

        <div>
          <h1 className="text-base font-bold text-slate-800 dark:text-white">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationPopover className="lg:hidden" />
      </div>
    </header>
  );
}
