import { useEffect, useState, useCallback } from "react";
import { useUserStore } from "@/store/userStore";
import { useProgressStore } from "@/store/progressStore";
import { useStudyStore } from "@/store/studyStore";
import { useQuizStore } from "@/store/quizStore";

/**
 * Custom hook to load all user data from the database
 *
 * This hook centralizes data loading for:
 * - User progress (streaks, achievements, level, XP)
 * - Study sessions and history
 * - Quiz history and statistics
 *
 * Call this hook in the dashboard layout to ensure data is loaded
 * once when the user logs in.
 *
 * Features:
 * - Automatic loading on mount
 * - Loading state management
 * - Error handling
 * - Prevents redundant loads with 5-minute cache
 *
 * @returns Object with loading state and manual refresh function
 */
export function useLoadUserData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user ID from user store
  const userId = useUserStore((state) => state.user?.id);

  // Get store methods
  const loadProgressFromDatabase = useProgressStore(
    (state) => state.loadProgressFromDatabase
  );
  const loadStudySessionsFromDatabase = useStudyStore(
    (state) => state.loadStudySessionsFromDatabase
  );
  const loadQuizHistory = useQuizStore((state) => state.loadQuizHistory);
  const loadQuestions = useQuizStore(
    (state) => state.loadQuestionsFromDatabase
  );

  // Get last fetched timestamp to implement caching
  const lastFetched = useProgressStore((state) => state.lastFetched);

  /**
   * Load all user data from the database
   * Implements 5-minute cache to avoid redundant API calls
   */
  const loadAllData = useCallback(
    async (force = false) => {
      if (!userId) {
        console.log("[useLoadUserData] No user ID, skipping data load");
        return;
      }

      // Check cache (5 minutes)
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
      const now = Date.now();

      if (!force && lastFetched && now - lastFetched < CACHE_DURATION) {
        console.log(
          "[useLoadUserData] Using cached data (last fetched:",
          new Date(lastFetched).toLocaleTimeString(),
          ")"
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log(
          "[useLoadUserData] Loading all user data for user:",
          userId
        );

        // Load all data in parallel for better performance
        await Promise.all([
          // Load progress data (streaks, achievements, level, XP)
          loadProgressFromDatabase(userId)
            .then(() =>
              console.log("[useLoadUserData] ✅ Progress data loaded")
            )
            .catch((err: Error) =>
              console.error(
                "[useLoadUserData] ❌ Failed to load progress:",
                err
              )
            ),

          // Load study sessions
          loadStudySessionsFromDatabase(userId)
            .then(() =>
              console.log("[useLoadUserData] ✅ Study sessions loaded")
            )
            .catch((err: Error) =>
              console.error(
                "[useLoadUserData] ❌ Failed to load study sessions:",
                err
              )
            ),

          // Load quiz history (simple void function)
          Promise.resolve(loadQuizHistory())
            .then(() => console.log("[useLoadUserData] ✅ Quiz history loaded"))
            .catch((err: Error) =>
              console.error(
                "[useLoadUserData] ❌ Failed to load quiz history:",
                err
              )
            ),

          // Load available quizzes
          loadQuestions()
            .then(() =>
              console.log("[useLoadUserData] ✅ Quiz questions loaded")
            )
            .catch((err: Error) =>
              console.error(
                "[useLoadUserData] ❌ Failed to load questions:",
                err
              )
            ),
        ]);

        console.log("[useLoadUserData] ✅ All data loaded successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load user data";
        console.error("[useLoadUserData] Error loading data:", err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [
      userId,
      lastFetched,
      loadProgressFromDatabase,
      loadStudySessionsFromDatabase,
      loadQuizHistory,
      loadQuestions,
    ]
  );

  /**
   * Manually refresh all data (bypasses cache)
   */
  const refresh = useCallback(() => {
    console.log("[useLoadUserData] Manual refresh triggered");
    loadAllData(true);
  }, [loadAllData]);

  // Load data on mount or when user ID changes
  useEffect(() => {
    if (userId) {
      console.log("[useLoadUserData] User ID changed, loading data...");
      loadAllData();
    }
  }, [userId, loadAllData]);

  return {
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook to trigger data refresh after user actions
 *
 * Use this in components that modify user data:
 * - After completing a quiz
 * - After finishing a study session
 * - After earning an achievement
 *
 * @example
 * ```tsx
 * const { refreshUserData } = useRefreshUserData();
 *
 * const handleQuizComplete = async () => {
 *   await saveQuizResults();
 *   refreshUserData(); // Refresh to show new stats
 * };
 * ```
 */
export function useRefreshUserData() {
  const userId = useUserStore((state) => state.user?.id);
  const loadProgressFromDatabase = useProgressStore(
    (state) => state.loadProgressFromDatabase
  );
  const loadStudySessionsFromDatabase = useStudyStore(
    (state) => state.loadStudySessionsFromDatabase
  );

  const refreshUserData = async () => {
    if (!userId) return;

    console.log("[useRefreshUserData] Refreshing user data after action...");

    try {
      await Promise.all([
        loadProgressFromDatabase(userId),
        loadStudySessionsFromDatabase(userId),
      ]);
      console.log("[useRefreshUserData] ✅ Data refreshed");
    } catch (error) {
      console.error("[useRefreshUserData] ❌ Failed to refresh data:", error);
    }
  };

  return { refreshUserData };
}
