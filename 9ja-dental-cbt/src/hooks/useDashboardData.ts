"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DashboardStats,
  UserStreak,
  LeaderboardEntry,
  QuizAttempt,
} from "@/types/dashboard";
import { databaseService } from "@/services/database";
import { useQuizHistory } from "./useQuizHistory";

interface UseDashboardDataResult {
  stats: DashboardStats | null;
  streak: UserStreak | null;
  leaderboard: LeaderboardEntry[];
  quizAttempts: QuizAttempt[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardData(userId: string): UseDashboardDataResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use new useQuizHistory hook instead of direct database call
  const {
    history: quizHistory,
    isLoading: quizLoading,
    error: quizError,
    refetch: refetchQuizzes,
  } = useQuizHistory({
    limit: 5,
    enabled: Boolean(userId),
  });

  // Convert quiz history format to QuizAttempt format for backward compatibility
  const quizAttempts: QuizAttempt[] = quizHistory.map((item) => ({
    id: item.id,
    userId,
    quizId: item.specialty || "general", // Use specialty or fallback to "general"
    score: item.score,
    totalQuestions: item.totalQuestions,
    completedAt: new Date(item.completedAt),
    timeSpent: item.timeSpent,
    answers: [], // Not needed for dashboard display
  }));

  const fetchData = useCallback(async () => {
    if (!userId) {
      setStats(null);
      setStreak(null);
      setLeaderboard([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Only fetch stats, streak, and leaderboard - quiz attempts now come from useQuizHistory
      const [statsData, streakData, leaderboardData] = await Promise.all([
        databaseService.getDashboardStats(userId),
        databaseService.getUserStreak(userId),
        databaseService.getLeaderboard(10),
      ]);

      setStats(statsData);
      setStreak(streakData);
      setLeaderboard(leaderboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchData(), refetchQuizzes()]);
  }, [fetchData, refetchQuizzes]);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [userId, fetchData]);

  // Combine loading states
  const combinedLoading = isLoading || quizLoading;

  // Combine errors
  const combinedError = error || quizError || null;

  return {
    stats,
    streak,
    leaderboard,
    quizAttempts,
    isLoading: combinedLoading,
    error: combinedError,
    refetch,
  };
}
