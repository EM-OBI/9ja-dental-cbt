"use client";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Trophy,
  User,
  BarChart3,
} from "lucide-react";
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
    name: "My Progress",
    icon: <BarChart3 className="h-4 w-4" />,
    href: "/dashboard/progress",
  },
  {
    name: "Leaderboard",
    icon: <Trophy className="h-4 w-4" />,
    href: "/dashboard/leaderboard",
  },
  {
    name: "Profile",
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
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
            isActiveLink(link.href)
              ? "dark:bg-blue-600/30 bg-blue-600 text-white"
              : "hover:bg-white/10"
          }`}
        >
          {link.icon}
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
