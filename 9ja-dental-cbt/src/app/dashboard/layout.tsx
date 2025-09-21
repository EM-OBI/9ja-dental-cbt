"use client";

import { useState } from "react";
import Sidebar from "@/app/dashboard/components/Sidebar";
import BottomNav from "./components/bottom-nav";
import DesktopHeader from "./components/header/DesktopHeader";
import MobileHeader from "./components/header/MobileHeader";
import { StreakCalendarDrawer } from "@/components/StreakCalendarDrawer";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isStreakCalendarOpen, setIsStreakCalendarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col lg:flex-row bg-slate-50 dark:bg-gray-950">
      {/* Sidebar - Hidden on mobile and tablet, visible on large screens and up */}
      <div
        className={`w-full flex-none transition-all duration-300 ${
          isDesktopCollapsed ? "lg:w-0" : "md:w-64"
        }`}
      >
        <Sidebar
          isDesktopCollapsed={isDesktopCollapsed}
          setIsDesktopCollapsed={setIsDesktopCollapsed}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 z-10">
          {/* For Desktop Screen Only */}
          <div className="hidden lg:block">
            <DesktopHeader isDesktopCollapsed={isDesktopCollapsed} />
          </div>
          {/* For Mobile Screen Only */}
          <div className="block lg:hidden">
            <MobileHeader
              onStreakCalendarOpen={() => setIsStreakCalendarOpen(true)}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scrollbar-hide pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0">
        <BottomNav />
      </div>

      {/* Streak Calendar Drawer */}
      <StreakCalendarDrawer
        isOpen={isStreakCalendarOpen}
        onOpenChange={setIsStreakCalendarOpen}
      />
    </div>
  );
}
