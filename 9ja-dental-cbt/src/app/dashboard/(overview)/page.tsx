"use client";

import React from "react";
import { RefreshCcw } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuizResults from "@/components/dashboard/QuizResults";
import StreakCalendar from "@/components/dashboard/StreakCalendar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useUnifiedProgressData } from "@/hooks/useUnifiedProgressData";
import { useRefreshUserData } from "@/hooks/useLoadUserData";
import MobileTabs from "@/components/dashboard/MobileTabs";
import { useUserStore } from "@/store";
import { useProgressStore } from "@/store/progressStore";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorState } from "@/components/ui/ErrorAlert";

export default function Dashboard() {
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
  const { stats, quizAttempts, refetch } = useDashboardData(userId);

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

  if (!progressData || !stats) {
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

  const completionRate =
    progressData.totalQuizzes > 0
      ? Math.round(
          (progressData.completedQuizzes / progressData.totalQuizzes) * 100
        )
      : 0;

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

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Quizzes Completed"
            value={
              progressStats?.quizzes?.completed ?? progressData.completedQuizzes
            }
            subtitle={`${completionRate}% of ${progressData.totalQuizzes} total`}
            trend={{
              value: 12,
              isPositive: true,
              period: "last week",
            }}
          />

          <DashboardCard
            title="Average Score"
            value={`${
              progressStats?.quizzes?.averageScore ?? progressData.averageScore
            }%`}
            subtitle="Accuracy rate"
            trend={{
              value: 5.2,
              isPositive: true,
              period: "last month",
            }}
          />

          <DashboardCard
            title="Study Time"
            value={`${Math.round(
              progressStats?.study?.totalHours ??
                progressData.totalStudyTime / 60
            )}h`}
            subtitle={`Level ${progressStats?.level?.current ?? 1}`}
            trend={{
              value: 8,
              isPositive: true,
              period: "last week",
            }}
          />

          <DashboardCard
            title="Current Streak"
            value={`${streakData?.currentStreak ?? progressData.currentStreak}`}
            subtitle={`Best: ${
              streakData?.longestStreak ?? progressData.longestStreak
            } days`}
            trend={{
              value:
                (streakData?.currentStreak ?? progressData.currentStreak) > 0
                  ? 100
                  : -50,
              isPositive:
                (streakData?.currentStreak ?? progressData.currentStreak) > 0,
              period: "yesterday",
            }}
          />
        </div>

        {/* Main Content Desktop */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Quiz Results */}
          <div className="xl:col-span-2 bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border">
            <QuizResults quizAttempts={quizAttempts} maxItems={4} />
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border">
              <ActivityFeed
                activities={stats.recentActivity}
                maxItems={4}
                showTimestamp={true}
              />
            </div>
            <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border">
              <StreakCalendar />
            </div>
          </div>
        </div>

        {/* Mobile Tabs - Mobile Only */}
        <div className="lg:hidden">
          <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border">
            <MobileTabs
              quizAttempts={quizAttempts}
              activities={stats.recentActivity}
              maxItems={3}
            />
          </div>

          {/* Streak Calendar for Mobile */}
          <div className="mt-4 bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border">
            <StreakCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}
