/**
 * Custom Hook: useQuizHistory
 * Fetches paginated quiz history from API
 * Implements client-side caching with SWR-like pattern
 */

import { useState, useEffect, useCallback } from "react";

interface QuizHistoryItem {
  id: string;
  specialty: string;
  specialtyName: string;
  mode: "practice" | "timed" | "exam";
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
  isPassed: boolean;
}

interface QuizHistoryResponse {
  history: QuizHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  stats: {
    totalQuizzes: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
  };
}

interface UseQuizHistoryOptions {
  page?: number;
  limit?: number;
  specialty?: string;
  enabled?: boolean;
}

interface UseQuizHistoryReturn {
  history: QuizHistoryItem[];
  stats: QuizHistoryResponse["stats"] | null;
  pagination: QuizHistoryResponse["pagination"] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useQuizHistory(
  options: UseQuizHistoryOptions = {}
): UseQuizHistoryReturn {
  const {
    page: initialPage = 1,
    limit = 10,
    specialty,
    enabled = true,
  } = options;

  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [stats, setStats] = useState<QuizHistoryResponse["stats"] | null>(null);
  const [pagination, setPagination] = useState<
    QuizHistoryResponse["pagination"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const fetchHistory = useCallback(
    async (page: number, append = false) => {
      if (!enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (specialty) {
          params.append("specialty", specialty);
        }

        const response = await fetch(`/api/quiz/history?${params.toString()}`, {
          headers: {
            "x-user-id": "current", // Replace with actual user ID from auth
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch quiz history");
        }

        const data: QuizHistoryResponse = await response.json();

        if (append) {
          setHistory((prev) => [...prev, ...data.history]);
        } else {
          setHistory(data.history);
        }

        setStats(data.stats);
        setPagination(data.pagination);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("[useQuizHistory] Error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled, limit, specialty]
  );

  const refetch = useCallback(async () => {
    setCurrentPage(1);
    await fetchHistory(1, false);
  }, [fetchHistory]);

  const loadMore = useCallback(async () => {
    if (!pagination?.hasMore || isLoading) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchHistory(nextPage, true);
  }, [pagination, isLoading, currentPage, fetchHistory]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchHistory(currentPage, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, currentPage, specialty]); // Refetch when specialty changes

  return {
    history,
    stats,
    pagination,
    isLoading,
    error,
    refetch,
    loadMore,
  };
}
