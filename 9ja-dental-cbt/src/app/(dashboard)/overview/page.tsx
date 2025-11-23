"use client";

import React, { Suspense } from "react";
import { RefreshCcw } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import StreakCalendar from "@/components/dashboard/StreakCalendar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useUnifiedProgressData } from "@/hooks/useUnifiedProgressData";
import { useRefreshUserData } from "@/hooks/useLoadUserData";
import { useUserStore } from "@/store";
import { useProgressStore } from "@/store/progressStore";
import { ErrorState } from "@/components/ui/ErrorAlert";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import type { WeeklyProgressSummary } from "@/types/progress";

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
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
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="py-6 md:py-8">
        <div className="mx-auto max-w-7xl space-y-8">
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
      <div className="py-6 md:py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Authentication required
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mt-2">
              Please sign in to view your dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="py-6 md:py-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              No data yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mt-2">
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

  const toNumber = (value: unknown, fallback = 0) => {
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : fallback;
    }
    const parsed = Number(value ?? fallback);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const resolvedTotalQuizzes = toNumber(
    progressData.totalQuizzes ?? progressStats?.quizzes?.total,
    0
  );

  const resolvedCompletedQuizzes = toNumber(
    progressData.completedQuizzes ?? progressStats?.quizzes?.completed,
    resolvedTotalQuizzes
  );

  const resolvedAverageScore = toNumber(
    progressData.averageScore ?? progressStats?.quizzes?.averageScore,
    0
  );

  const resolvedStudyMinutes = toNumber(
    progressData.totalStudyTime ??
    progressStats?.study?.totalMinutes ??
    Math.round((progressStats?.study?.totalHours ?? 0) * 60),
    0
  );

  const resolvedCurrentStreak = toNumber(
    streakData?.currentStreak ??
    progressData.currentStreak ??
    progressStats?.streaks?.currentStreak,
    0
  );

  const resolvedLongestStreak = toNumber(
    streakData?.longestStreak ??
    progressData.longestStreak ??
    progressStats?.streaks?.longestStreak,
    0
  );

  const completionRate =
    resolvedTotalQuizzes > 0
      ? Math.round((resolvedCompletedQuizzes / resolvedTotalQuizzes) * 100)
      : 0;

  const studyTimeDisplay = formatStudyTime(resolvedStudyMinutes);

  const levelSubtitle = progressStats?.level?.current
    ? `Level ${progressStats.level.current}`
    : `${progressData.currentLevel} level`;

  const studySubtitle =
    resolvedStudyMinutes > 0
      ? `${levelSubtitle} • ${formatNumber(
        resolvedStudyMinutes
      )} minutes tracked`
      : `${levelSubtitle} • No study time logged yet`;

  const weeklyProgressEntries: WeeklyProgressSummary[] =
    progressData.weeklyProgress ?? [];

  const calculateTrendFromWeekly = (
    selector: (entry: WeeklyProgressSummary) => number,
    options: {
      segmentSize?: number;
      mode?: "sum" | "average";
      asAbsolute?: boolean;
    } = {}
  ) => {
    const { segmentSize = 3, mode = "sum", asAbsolute = false } = options;

    if (!weeklyProgressEntries.length) {
      return { value: 0, isPositive: false } as const;
    }

    const sortedEntries = [...weeklyProgressEntries].sort((a, b) => {
      const left = new Date(a.date).getTime();
      const right = new Date(b.date).getTime();
      return left - right;
    });

    const safeSegmentSize = Math.min(
      segmentSize,
      Math.floor(sortedEntries.length / 2)
    );

    if (safeSegmentSize <= 0) {
      return { value: 0, isPositive: false } as const;
    }

    const currentSegment = sortedEntries.slice(-safeSegmentSize);
    const previousSegment = sortedEntries.slice(
      -safeSegmentSize * 2,
      -safeSegmentSize
    );

    if (!previousSegment.length) {
      return { value: 0, isPositive: false } as const;
    }

    const aggregate = (segment: typeof currentSegment) => {
      const values = segment.map((entry) => {
        const rawValue = Number(selector(entry));
        return Number.isFinite(rawValue) ? rawValue : 0;
      });
      const total = values.reduce((sum, value) => sum + value, 0);

      if (mode === "average") {
        return values.length > 0 ? total / values.length : 0;
      }

      return total;
    };

    const currentValue = aggregate(currentSegment);
    const previousValue = aggregate(previousSegment);
    const delta = currentValue - previousValue;
    const isPositive = delta >= 0;

    if (asAbsolute) {
      return {
        value: Math.round(delta),
        isPositive,
      } as const;
    }

    if (previousValue === 0) {
      if (currentValue === 0) {
        return { value: 0, isPositive: false } as const;
      }
      return {
        value: currentValue > 0 ? 100 : -100,
        isPositive: currentValue > 0,
      } as const;
    }

    const percentChange = (delta / Math.abs(previousValue)) * 100;
    return {
      value: Math.round(percentChange),
      isPositive,
    } as const;
  };

  const quizzesTrend = calculateTrendFromWeekly((entry) => entry.quizzesTaken, {
    mode: "sum",
  });
  const averageScoreTrend = calculateTrendFromWeekly(
    (entry) => entry.averageScore,
    { mode: "average", asAbsolute: true }
  );
  const studyTimeTrend = calculateTrendFromWeekly(
    (entry) => entry.studyMinutes,
    { mode: "sum" }
  );

  return (
    <div className="py-6 md:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Track your progress and keep learning
            </p>
          </div>
          <button
            title="Refresh Data"
            aria-label="Refresh Data"
            type="button"
            onClick={handleRefresh}
            className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 rounded-xl transition-all duration-200"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area with Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Stats Cards (2x2 Grid) */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DashboardCard
                title="Quizzes Completed"
                value={formatNumber(resolvedCompletedQuizzes)}
                subtitle={
                  resolvedTotalQuizzes > 0
                    ? `${completionRate}% of ${formatNumber(
                      resolvedTotalQuizzes
                    )} total`
                    : "Start your first quiz to see progress"
                }
                trend={{
                  value: quizzesTrend.value,
                  isPositive: quizzesTrend.isPositive,
                  period: "since last update",
                }}
              />

              <DashboardCard
                title="Average Score"
                value={`${formatPercentage(resolvedAverageScore)}%`}
                subtitle={
                  resolvedTotalQuizzes > 0
                    ? "Accuracy across completed quizzes"
                    : "Complete a quiz to unlock insights"
                }
                trend={{
                  value: averageScoreTrend.value,
                  isPositive: averageScoreTrend.isPositive,
                  period: "since last update",
                }}
              />

              <DashboardCard
                title="Study Time"
                value={studyTimeDisplay}
                subtitle={studySubtitle}
                trend={{
                  value: studyTimeTrend.value,
                  isPositive: studyTimeTrend.isPositive,
                  period: "since last update",
                }}
              />

              <DashboardCard
                title="Current Streak"
                value={`${resolvedCurrentStreak}`}
                subtitle={`Best: ${resolvedLongestStreak} days`}
                trend={{
                  value: resolvedCurrentStreak > 0 ? 100 : -50,
                  isPositive: resolvedCurrentStreak > 0,
                  period: "yesterday",
                }}
              />
            </div>

            {/* Streak Calendar - Mobile Only (below cards) */}
            <div className="lg:hidden mt-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <StreakCalendar />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Streak Calendar (Desktop Only) */}
          <div className="hidden lg:block lg:w-80 xl:w-96">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24 overflow-hidden">
              <StreakCalendar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
