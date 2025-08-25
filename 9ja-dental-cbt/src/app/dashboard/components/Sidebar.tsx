"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  TowerControl,
  Plus,
  LayoutDashboard,
  BookOpen,
  Brain,
  Trophy,
  CreditCard,
  User,
  Settings,
  BarChart3,
  Crown,
  Bookmark,
} from "lucide-react";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function to check if a link is active
  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        title="Mobile menu Button"
        aria-label="Toggle mobile menu"
        type="button"
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/80 backdrop-blur-lg rounded-lg border border-white/10"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out flex flex-col gap-6 border-r border-white/10 bg-slate-900/50 backdrop-blur-lg p-6 h-full ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg grid place-content-center">
            <TowerControl className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            9JA DENTAL QUIZ
          </span>
        </div>

        <button className="flex items-center justify-between gap-3 text-sm font-medium bg-blue-600/20 hover:bg-blue-600/30 transition p-3 rounded-lg">
          <span className="flex items-center gap-3">
            <Plus className="h-4 w-4" />
            New Quiz Session
          </span>
          <kbd className="text-xs text-white/60 hidden sm:block">⌘N</kbd>
        </button>

        <nav className="flex flex-col gap-2 text-sm">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActiveLink("/dashboard")
                ? "bg-blue-600/30 text-white"
                : "hover:bg-white/10"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/quiz"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActiveLink("/quiz")
                ? "bg-blue-600/30 text-white"
                : "hover:bg-white/10"
            }`}
          >
            <Brain className="h-4 w-4" />
            Quiz Mode
          </Link>

          <Link
            href="/study"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActiveLink("/study")
                ? "bg-blue-600/30 text-white"
                : "hover:bg-white/10"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span className="flex-1">Study Mode</span>
            <Crown className="h-4 w-4 text-yellow-400" />
          </Link>

          <Link
            href="/specialties"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActiveLink("/specialties")
                ? "bg-blue-600/30 text-white"
                : "hover:bg-white/10"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            Specialties
          </Link>

          <Link
            href="/progress"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActiveLink("/progress")
                ? "bg-blue-600/30 text-white"
                : "hover:bg-white/10"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            My Progress
          </Link>

          <Link
            href="/leaderboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActiveLink("/leaderboard")
                ? "bg-blue-600/30 text-white"
                : "hover:bg-white/10"
            }`}
          >
            <Trophy className="h-4 w-4" />
            Leaderboard
          </Link>

          <Link
            href="/subscription"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActiveLink("/subscription")
                ? "bg-blue-600/30 text-white"
                : "hover:bg-white/10"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Subscription
          </Link>

          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActiveLink("/profile")
                ? "bg-blue-600/30 text-white"
                : "hover:bg-white/10"
            }`}
          >
            <User className="h-4 w-4" />
            Profile
          </Link>

          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActiveLink("/settings")
                ? "bg-blue-600/30 text-white"
                : "hover:bg-white/10"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        <div className="mt-auto bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-4 rounded-xl">
          <p className="text-sm leading-snug">
            Upgrade to Premium for{" "}
            <span className="font-semibold text-cyan-400">AI Insights</span> and
            full question bank access!
          </p>
          <div className="flex items-center justify-between mt-4 text-sm">
            <button className="hover:underline text-white/70">
              Maybe Later
            </button>
            <button className="bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-md font-medium">
              Go Premium
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={toggleMobileMenu}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        ></div>
      )}
    </>
  );
}
