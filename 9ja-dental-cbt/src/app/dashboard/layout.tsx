"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/dashboard/components/Sidebar";
import BottomNav from "./components/bottom-nav";
import DesktopHeader from "./components/header/DesktopHeader";
import MobileHeader from "./components/header/MobileHeader";
import { StreakCalendarDrawer } from "@/components/StreakCalendarDrawer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { authClient } from "@/modules/auth/utils/auth-client";
import { useLoadUserData } from "@/hooks/useLoadUserData";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isStreakCalendarOpen, setIsStreakCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Load user data from database
  const { isLoading: isLoadingData, error: dataError } = useLoadUserData();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setIsAuthenticated(true);
        } else {
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Will redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show data error if present (non-blocking)
  if (dataError) {
    console.error("Data loading error:", dataError);
    // You could show a toast notification here instead
  }

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
          {/* Show loading indicator for data (optional, non-blocking) */}
          {isLoadingData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" className="text-blue-600" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Loading your data...
                </p>
              </div>
            </div>
          )}
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
