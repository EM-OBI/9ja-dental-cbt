"use client";

import React from "react";
import { Brain, Clock, Target, Flame, RefreshCcw } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import QuizResults from "@/components/dashboard/QuizResults";
import StreakCalendar from "@/components/dashboard/StreakCalendar";
import { useDashboardData } from "@/hooks/useDashboardData";
import MobileTabs from "@/components/dashboard/MobileTabs";

export default function Dashboard() {
  // Mock user ID - replace with actual user ID from your auth system
  const userId = "user-123";
  const userName = "Godwin"; // Replace with actual user name from auth
  const { stats, streak, quizAttempts, isLoading, error, refetch } =
    useDashboardData(userId);

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-600 dark:text-red-400">
          Error loading dashboard: {error}
        </p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 dark:text-slate-400">
          No dashboard data available
        </p>
      </div>
    );
  }

  const completionRate = Math.round(
    (stats.completedQuizzes / stats.totalQuizzes) * 100
  );

  return (
    <div className="space-y-6 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Ready to continue your dental studies?
          </p>
        </div>
        <button
          title="Refresh Data"
          aria-label="Refresh Data"
          type="button"
          onClick={refetch}
          className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCcw className="w-4 h-4 inline-block" />
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Quizzes Completed"
          value={stats.completedQuizzes}
          subtitle={`${completionRate}% of ${stats.totalQuizzes} total`}
          icon={<Brain className="w-5 h-5 text-blue-500" />}
          trend={{
            value: 12,
            isPositive: true,
            period: "last week",
          }}
        />

        <DashboardCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          subtitle="Across all quizzes"
          icon={<Target className="w-5 h-5 text-green-500" />}
          trend={{
            value: 5.2,
            isPositive: true,
            period: "last month",
          }}
        />

        <DashboardCard
          title="Study Time"
          value={`${Math.round(stats.totalStudyTime / 60)}h`}
          subtitle={`${stats.totalStudyTime % 60}m total`}
          icon={<Clock className="w-5 h-5 text-purple-500" />}
          trend={{
            value: 8,
            isPositive: true,
            period: "last week",
          }}
        />

        <DashboardCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          subtitle={`Best: ${stats.longestStreak} days`}
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          trend={{
            value: stats.currentStreak > 0 ? 100 : -50,
            isPositive: stats.currentStreak > 0,
            period: "yesterday",
          }}
        />
      </div>

      {/* Main Content Desktop */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Quiz Results */}
        <div className="xl:col-span-2">
          <QuizResults quizAttempts={quizAttempts} maxItems={4} />
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <ActivityFeed
            activities={stats.recentActivity}
            maxItems={4}
            showTimestamp={true}
          />
          <div>
            <StreakCalendar />
          </div>
        </div>
      </div>

      {/* Mobile Tabs - Mobile Only */}
      <div className="lg:hidden">
        <MobileTabs
          quizAttempts={quizAttempts}
          activities={stats.recentActivity}
          maxItems={4}
        />

        {/* Streak Calendar for Mobile */}
        {/* <div className="mt-6">
          <StreakCalendar />
        </div> */}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quick Actions */}

        {/* Streak Calendar */}
      </div>
    </div>
  );
}
