/**
 * useUserStats Hook
 * Fetches comprehensive user statistics with caching
 */

import { useState, useEffect, useCallback } from "react";

export interface UserStats {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  totalTimeSpent: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  specialtyBreakdown: Array<{
    specialty: string;
    quizCount: number;
    averageScore: number;
    lastAttempt: string;
  }>;
  recentPerformance: Array<{
    date: string;
    score: number;
    quizCount: number;
  }>;
  weakestTopics: Array<{
    topic: string;
    score: number;
    attempts: number;
  }>;
  strongestTopics: Array<{
    topic: string;
    score: number;
    attempts: number;
  }>;
}

interface UseUserStatsReturn {
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isCached: boolean;
}

export function useUserStats(): UseUserStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch user stats");
      }

      const data = (await response.json()) as {
        success: boolean;
        data: UserStats;
        cached: boolean;
      };

      if (data.success) {
        setStats(data.data);
        setIsCached(data.cached);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load stats";
      setError(errorMessage);
      console.error("[useUserStats] Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
    isCached,
  };
}
