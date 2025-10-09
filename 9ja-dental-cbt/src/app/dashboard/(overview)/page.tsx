"use client";

import React, { useState } from "react";
import { RefreshCcw, Plus, BookOpen, ClipboardCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/dashboard/DashboardCard";
import StreakCalendar from "@/components/dashboard/StreakCalendar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useUnifiedProgressData } from "@/hooks/useUnifiedProgressData";
import { useRefreshUserData } from "@/hooks/useLoadUserData";
import { useUserStore } from "@/store";
import { useProgressStore } from "@/store/progressStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorAlert";

export default function Dashboard() {
  const router = useRouter();
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const { user, isLoading: isUserLoading } = useUserStore();
  const userId = user?.id ?? "";
  const userName = user?.name?.trim() || user?.email?.split("@")[0] || "there";
  const hasUser = Boolean(userId);

  // Get data from Zustand stores (loaded by layout via useLoadUserData)
  const progressStats = useProgressStore((state) => state.progressStats);
  const streakData = useProgressStore((state) => state.streakData);
  const { refreshUserData } = useRefreshUserData();

  // Use unified progress data for consistent field names
  const { progressData, isLoading, error, refresh } = useUnifiedProgressData(
    userId,
    true
  );

  // Legacy dashboard data for components that haven't been updated yet
  const { refetch } = useDashboardData(userId);

  // Refresh both data sources (existing hooks + new stores)
  const handleRefresh = async () => {
    if (!hasUser) return;
    await Promise.all([
      refresh(),
      refetch(),
      refreshUserData(), // Also refresh store data
    ]);
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background py-4 md:py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-background rounded-xl border border-slate-200 dark:border-border">
            <LoadingSpinner
              size="xl"
              className="mb-4 text-slate-900 dark:text-slate-400"
            />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background py-4 md:py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <ErrorState
            title="Unable to load data"
            message={error}
            onRetry={handleRefresh}
          />
        </div>
      </div>
    );
  }

  if (!hasUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background py-4 md:py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-background rounded-xl p-8 border border-slate-200 dark:border-border">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
              Authentication required
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center mt-2">
              Please sign in to view your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background py-4 md:py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-background rounded-xl p-8 border border-slate-200 dark:border-border">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
              No data yet
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center mt-2">
              Complete your first quiz to see your progress
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercentage = (value: number) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: value % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    }).format(value);

  const formatStudyTime = (minutes: number) => {
    if (!minutes || minutes <= 0) {
      return "0m";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    const parts = [] as string[];

    if (hours > 0) {
      parts.push(`${hours}h`);
    }

    if (remainingMinutes > 0 || parts.length === 0) {
      parts.push(`${remainingMinutes}m`);
    }

    return parts.join(" ");
  };

  const completionRate =
    progressData.totalQuizzes > 0
      ? Math.round(
          (progressData.completedQuizzes / progressData.totalQuizzes) * 100
        )
      : 0;

  const totalStudyMinutes =
    progressData.totalStudyTime ??
    Math.round((progressStats?.study?.totalHours ?? 0) * 60);

  const studyTimeDisplay = formatStudyTime(totalStudyMinutes);

  const levelSubtitle = progressStats?.level?.current
    ? `Level ${progressStats.level.current}`
    : `${progressData.currentLevel} level`;

  const studySubtitle =
    totalStudyMinutes > 0
      ? `${levelSubtitle} • ${formatNumber(totalStudyMinutes)} minutes tracked`
      : `${levelSubtitle} • No study time logged yet`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background py-4 md:py-6">
      <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-card rounded-xl p-5 md:p-6 border border-slate-200 dark:border-border">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-foreground mb-1">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Track your progress and keep learning
            </p>
          </div>
          <button
            title="Refresh Data"
            aria-label="Refresh Data"
            type="button"
            onClick={handleRefresh}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area with Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Stats Cards (2x2 Grid) */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashboardCard
                title="Quizzes Completed"
                value={formatNumber(progressData.completedQuizzes)}
                subtitle={
                  progressData.totalQuizzes > 0
                    ? `${completionRate}% of ${formatNumber(
                        progressData.totalQuizzes
                      )} total`
                    : "Start your first quiz to see progress"
                }
                trend={{
                  value: 12,
                  isPositive: true,
                  period: "last week",
                }}
              />

              <DashboardCard
                title="Average Score"
                value={`${formatPercentage(progressData.averageScore)}%`}
                subtitle={
                  progressData.totalQuizzes > 0
                    ? "Accuracy across completed quizzes"
                    : "Complete a quiz to unlock insights"
                }
                trend={{
                  value: 5.2,
                  isPositive: true,
                  period: "last month",
                }}
              />

              <DashboardCard
                title="Study Time"
                value={studyTimeDisplay}
                subtitle={studySubtitle}
                trend={{
                  value: 8,
                  isPositive: true,
                  period: "last week",
                }}
              />

              <DashboardCard
                title="Current Streak"
                value={`${
                  streakData?.currentStreak ?? progressData.currentStreak
                }`}
                subtitle={`Best: ${
                  streakData?.longestStreak ?? progressData.longestStreak
                } days`}
                trend={{
                  value:
                    (streakData?.currentStreak ?? progressData.currentStreak) >
                    0
                      ? 100
                      : -50,
                  isPositive:
                    (streakData?.currentStreak ?? progressData.currentStreak) >
                    0,
                  period: "yesterday",
                }}
              />
            </div>

            {/* Streak Calendar - Mobile Only (below cards) */}
            <div className="lg:hidden mt-6">
              <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border">
                <StreakCalendar />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Streak Calendar (Desktop Only) */}
          <div className="hidden lg:block lg:w-80 xl:w-96">
            <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border sticky top-6">
              <StreakCalendar />
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
          className={`fixed bottom-20 right-6 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group ${
            isQuickActionOpen ? "z-[70]" : "z-50"
          }`}
          aria-label="Quick Actions"
        >
          <Plus
            className={`w-6 h-6 transition-transform duration-200 ${
              isQuickActionOpen ? "rotate-45" : "group-hover:rotate-90"
            }`}
          />
        </button>

        {/* Quick Action Popup - Positioned near FAB */}
        {isQuickActionOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[65] bg-black/20"
              onClick={() => setIsQuickActionOpen(false)}
            />

            {/* Minimal Colorful Modal */}
            <div className="fixed bottom-36 right-6 z-[68] w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Take a Test */}
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  router.push("/dashboard/quiz");
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all group border-b border-slate-100 dark:border-slate-800"
              >
                <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    Take a Test
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Start quiz
                  </p>
                </div>
              </button>

              {/* Study Materials */}
              <button
                onClick={() => {
                  setIsQuickActionOpen(false);
                  router.push("/dashboard/study");
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all group"
              >
                <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    Study
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review topics
                  </p>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
