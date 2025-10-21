"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/(dashboard)/components/Sidebar";
import BottomNav from "./components/bottom-nav";
import DesktopHeader from "./components/header/DesktopHeader";
import MobileHeader from "./components/header/MobileHeader";
import { StreakCalendarDrawer } from "@/components/StreakCalendarDrawer";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { authClient } from "@/modules/auth/utils/auth-client";
import { useLoadUserData } from "@/hooks/useLoadUserData";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isStreakCalendarOpen, setIsStreakCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
    <div className="flex h-screen flex-col lg:flex-row bg-slate-50 dark:bg-background min-h-0">
      {/* Sidebar - Drawer on mobile, fixed sidebar on desktop */}
      <Sidebar
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={setIsDesktopCollapsed}
        isMobileMenuOpen={isMobileSidebarOpen}
        setIsMobileMenuOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header - Hidden on mobile */}
        <header className="hidden lg:block bg-white dark:bg-card shadow-sm border-b border-slate-200 dark:border-border z-10">
          <DesktopHeader isDesktopCollapsed={isDesktopCollapsed} />
        </header>

        {/* Mobile Header - Hidden on desktop */}
        <header className="lg:hidden bg-white dark:bg-card shadow-sm border-b border-slate-200 dark:border-border z-10">
          <MobileHeader
            isSidebarOpen={isMobileSidebarOpen}
            onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
            // onStreakCalendarOpen={() => setIsStreakCalendarOpen(true)}
          />
        </header>

        {/* Page Content - Scrollable Area */}
        <main
          id="dashboard-main"
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden min-h-0",
            "px-4 lg:px-6",
            "pb-24 lg:pb-6",
            "pt-[5.5rem] supports-[padding:env(safe-area-inset-top)]:pt-[calc(env(safe-area-inset-top)+5rem)]",
            "lg:pt-6",
            null
          )}
        >
          {/* Show loading indicator for data (optional, non-blocking) */}
          {isLoadingData && (
            <div className="bg-blue-50 dark:bg-card border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
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
