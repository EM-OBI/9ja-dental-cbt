"use client";
import {
  LayoutDashboard,
  Brain,
  Trophy,
  Bookmark,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Home",
    href: "/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    name: "Quiz",
    href: "/dashboard/quiz",
    icon: <Brain />,
  },
  {
    name: "Specialities",
    href: "/dashboard/specialities",
    icon: <Bookmark />,
  },
  {
    name: "Leaderboard",
    href: "/dashboard/leaderboard",
    icon: <Trophy />,
  },
  {
    name: "My Progress",
    href: "/dashboard/progress",
    icon: <BarChart3 />,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  //Function to check if a link is active
  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="fixed bottom-0 w-full py-2 z-10 bg-zinc-100 dark:bg-zinc-950 border-t dark:border-zinc-800 border-zinc-200 shadow-lg sm:hidden">
      <div className="flex flex-row justify-around items-center bg-transparent w-full">
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`flex flex-col items-center text-sm ${
              isActiveLink(link.href)
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <div className="h-6 w-6 mb-1">{link.icon}</div>
            <span>{link.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
