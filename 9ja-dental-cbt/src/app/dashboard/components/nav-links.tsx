"use client";
import { LayoutDashboard, BookOpen, Brain, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Home",
    icon: <LayoutDashboard className="h-4 w-4" />,
    href: "/dashboard",
  },
  {
    name: "Quiz Mode",
    icon: <Brain className="h-4 w-4" />,
    href: "/dashboard/quiz",
  },
  {
    name: "Study Mode",
    icon: <BookOpen className="h-4 w-4" />,
    href: "/dashboard/study",
  },
  {
    name: "Leaderboard",
    icon: <Trophy className="h-4 w-4" />,
    href: "/dashboard/leaderboard",
  },
  {
    name: "Account Settings",
    icon: <User className="h-4 w-4" />,
    href: "/dashboard/profile",
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  // Function to check if a link is active
  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="flex flex-col gap-2 text-sm">
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
            isActiveLink(link.href)
              ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
          }`}
        >
          {link.icon}
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
