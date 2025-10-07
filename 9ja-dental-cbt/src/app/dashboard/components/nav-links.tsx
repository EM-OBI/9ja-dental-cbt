"use client";

import { LayoutDashboard, BookOpen, Brain, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Home", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Quiz", icon: Brain, href: "/dashboard/quiz" },
  { name: "Study", icon: BookOpen, href: "/dashboard/study" },
  { name: "Leaderboard", icon: Trophy, href: "/dashboard/leaderboard" },
  { name: "Profile", icon: User, href: "/dashboard/profile" },
];

interface NavLinksProps {
  isCollapsed?: boolean;
  onLinkClick?: () => void;
}

export default function NavLinks({
  isCollapsed = false,
  onLinkClick,
}: NavLinksProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            className={`
              group relative flex items-center gap-3 rounded-lg px-3 py-2.5
              transition-all duration-200
              ${
                isActive
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
              }
              ${isCollapsed ? "lg:justify-center" : ""}
            `}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span
              className={`text-sm font-medium ${
                isCollapsed ? "lg:hidden" : ""
              }`}
            >
              {link.name}
            </span>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                {link.name}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
