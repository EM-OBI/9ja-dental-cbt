"use client";

import { BookOpen, Brain, Trophy, User, Album } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardIcon } from "@/components/dashboard/icons/DashboardIcon";

const links = [
  { name: "Home", icon: DashboardIcon, href: "/overview" },
  { name: "Quiz", icon: Brain, href: "/quiz" },
  { name: "Study", icon: BookOpen, href: "/study" },
  { name: "Flashcards", icon: Album, href: "/flashcards" },
  { name: "Leaderboard", icon: Trophy, href: "/leaderboard" },
  { name: "Profile", icon: User, href: "/profile" },
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
    <div className="flex flex-col gap-1.5">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            className={`
              group relative flex items-center gap-3 rounded-xl px-3.5 py-3
              transition-all duration-200 font-medium
              ${isActive
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              }
              ${isCollapsed ? "lg:justify-center px-2" : ""}
            `}
          >
            <Icon
              className={`h-[1.125rem] w-[1.125rem] flex-shrink-0 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                }`}
            />
            <span
              className={`text-sm ${isCollapsed ? "lg:hidden" : ""}`}
            >
              {link.name}
            </span>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="hidden lg:block absolute left-full ml-3 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-xl">
                {link.name}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
