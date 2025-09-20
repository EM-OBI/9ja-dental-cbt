"use client";

import React from "react";
import { Brain, Clock, Target, Flame, RefreshCcw } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuizResults from "@/components/dashboard/QuizResults";
import StreakCalendar from "@/components/dashboard/StreakCalendar";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useUnifiedProgressData } from "@/hooks/useUnifiedProgressData";
import MobileTabs from "@/components/dashboard/MobileTabs";

export default function Dashboard() {
  // Mock user ID - replace with actual user ID from your auth system
  const userId = "user-123";
  const userName = "Godwin"; // Replace with actual user name from auth

  // Use unified progress data for consistent field names
  const { progressData, isLoading, error, refresh } = useUnifiedProgressData(
    userId,
    true
  );

  // Legacy dashboard data for components that haven't been updated yet
  const { stats, streak, quizAttempts, refetch } = useDashboardData(userId);

  // Refresh both data sources
  const handleRefresh = async () => {
    await Promise.all([refresh(), refetch()]);
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl m-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Loading your learning dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl m-4 p-8">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Oops! Learning hiccup
        </h3>
        <p className="text-red-600 dark:text-red-400 text-center max-w-md">
          We encountered an issue loading your progress: {error}
        </p>
        <button
          onClick={handleRefresh}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!progressData || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl m-4 p-8">
        <div className="text-6xl mb-4">🎓</div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Ready to start learning?
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-center">
          Your learning journey begins here. Take your first quiz to see your
          progress!
        </p>
      </div>
    );
  }

  const completionRate = Math.round(
    (progressData.completedQuizzes / progressData.totalQuizzes) * 100
  );

  return (
    <div className="space-y-8 p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-orange-100 dark:border-slate-700">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {getGreeting()}, {userName}! 📚
          </h1>
          <p className="text-base text-amber-700 dark:text-amber-300 font-medium">
            Let's continue your journey to dental mastery
          </p>
        </div>
        <button
          title="Refresh Data"
          aria-label="Refresh Data"
          type="button"
          onClick={handleRefresh}
          className="px-4 py-3 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <RefreshCcw className="w-4 h-4 inline-block" />
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <DashboardCard
          title="Knowledge Progress"
          value={progressData.completedQuizzes}
          subtitle={`${completionRate}% of ${progressData.totalQuizzes} quizzes mastered`}
          icon={<Brain className="w-5 h-5 text-emerald-600" />}
          trend={{
            value: 12,
            isPositive: true,
            period: "last week",
          }}
        />

        <DashboardCard
          title="Mastery Level"
          value={`${progressData.averageScore}%`}
          subtitle="Average accuracy rate"
          icon={<Target className="w-5 h-5 text-blue-600" />}
          trend={{
            value: 5.2,
            isPositive: true,
            period: "last month",
          }}
        />

        <DashboardCard
          title="Learning Hours"
          value={`${Math.round(progressData.totalStudyTime / 60)}h`}
          subtitle={`${progressData.totalStudyTime % 60}m dedicated study time`}
          icon={<Clock className="w-5 h-5 text-purple-600" />}
          trend={{
            value: 8,
            isPositive: true,
            period: "last week",
          }}
        />

        <DashboardCard
          title="Study Streak"
          value={`${progressData.currentStreak} days`}
          subtitle={`Personal best: ${progressData.longestStreak} days`}
          icon={<Flame className="w-5 h-5 text-orange-600" />}
          trend={{
            value: progressData.currentStreak > 0 ? 100 : -50,
            isPositive: progressData.currentStreak > 0,
            period: "yesterday",
          }}
        />
      </div>

      {/* Main Content Desktop */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Quiz Results */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-orange-100 dark:border-slate-700">
          <QuizResults quizAttempts={quizAttempts} maxItems={4} />
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-orange-100 dark:border-slate-700">
            <ActivityFeed
              activities={stats.recentActivity}
              maxItems={4}
              showTimestamp={true}
            />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-orange-100 dark:border-slate-700">
            <StreakCalendar />
          </div>
        </div>
      </div>

      {/* Mobile Tabs - Mobile Only */}
      <div className="lg:hidden">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-orange-100 dark:border-slate-700">
          <MobileTabs
            quizAttempts={quizAttempts}
            activities={stats.recentActivity}
            maxItems={3}
          />
        </div>

        {/* Streak Calendar for Mobile */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-orange-100 dark:border-slate-700">
          <StreakCalendar />
        </div>
      </div>
    </div>
  );
}
