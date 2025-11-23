"use client";
import { LayoutDashboard, Brain, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";
import { cn } from "@/lib/utils";

const links = [
  {
    name: "Home",
    href: "/overview",
    icon: LayoutDashboard,
  },
  {
    name: "Quiz",
    href: "/quiz",
    icon: Brain,
  },
  {
    name: "Study",
    href: "/study",
    icon: BookOpen,
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { mode } = useThemeStore();

  // Check if we're in dark mode
  const isDarkMode =
    mode === "dark" ||
    (mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Function to check if a link is active
  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  return (
    <div
      className={cn("fixed bottom-4 left-1/2 -translate-x-1/2 z-50 sm:hidden")}
    >
      <div className="bg-white/90 dark:bg-card/80 border border-slate-300 dark:border-border shadow-lg rounded-full px-3 py-2 transition-shadow hover:shadow-xl">
        <div className="flex items-center justify-center space-x-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveLink(link.href);

            return (
              <div key={link.name} className="relative">
                <Link
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-full relative overflow-hidden group min-w-[48px]",
                    "transition-transform duration-200 active:scale-95",
                    isActive && "scale-110"
                  )}
                  aria-label={link.name}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Icon */}
                  <div className="relative z-10">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors duration-200",
                        isActive
                          ? isDarkMode
                            ? "text-gray-200"
                            : "text-slate-800"
                          : isDarkMode
                          ? "text-gray-400"
                          : "text-slate-600"
                      )}
                    />
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute inset-0 bg-slate-200 dark:bg-blue-900/30 rounded-full animate-in fade-in zoom-in-95 duration-200" />
                  )}

                  {/* Hover effect */}
                  <span className="absolute inset-0 bg-slate-100 dark:bg-card/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
