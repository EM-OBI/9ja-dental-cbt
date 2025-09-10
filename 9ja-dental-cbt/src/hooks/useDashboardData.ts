"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DashboardStats,
  UserStreak,
  LeaderboardEntry,
  QuizAttempt,
} from "@/types/dashboard";
import { dbService } from "@/services/database";

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
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsData, streakData, leaderboardData, quizAttemptsData] =
        await Promise.all([
          dbService.getDashboardStats(userId),
          dbService.getUserStreak(userId),
          dbService.getLeaderboard(10),
          dbService.getQuizAttempts(userId, 5),
        ]);

      setStats(statsData);
      setStreak(streakData);
      setLeaderboard(leaderboardData);
      setQuizAttempts(quizAttemptsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  return {
    stats,
    streak,
    leaderboard,
    quizAttempts,
    isLoading,
    error,
    refetch: fetchData,
  };
}
