import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/queries/useUserQuery";
import { useStudyHistory } from "@/hooks/queries/useStudyQueries";
import { useProgress, useStreaks } from "@/hooks/queries/useProgressQueries";
import { QUERY_KEYS } from "@/lib/queryKeys";

/**
 * Custom hook to load all user data from the database
 *
 * This hook centralizes data loading for:
 * - User profile
 * - User progress (streaks, achievements, level, XP)
 * - Study sessions and history
 *
 * Call this hook in the dashboard layout to ensure data is loaded
 * once when the user logs in.
 *
 * Features:
 * - Automatic loading on mount (via TanStack Query)
 * - Loading state management
 * - Error handling
 * - Caching handled by TanStack Query
 *
 * @returns Object with loading state and manual refresh function
 */
export function useLoadUserData() {
  const queryClient = useQueryClient();

  // We need the user ID to fetch data, but useUser handles fetching the user itself
  const { data: user, isLoading: isUserLoading, error: userError } = useUser();
  const userId = user?.id;

  // Fetch other data dependent on userId
  const { isLoading: isStudyLoading, error: studyError } = useStudyHistory(userId);
  const { isLoading: isProgressLoading, error: progressError } = useProgress(userId);
  const { isLoading: isStreaksLoading, error: streaksError } = useStreaks(userId);

  const isLoading = isUserLoading || isStudyLoading || isProgressLoading || isStreaksLoading;

  const error = userError?.message ||
    studyError?.message ||
    progressError?.message ||
    streaksError?.message ||
    null;

  /**
   * Manually refresh all data (invalidates queries)
   */
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.study.history(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.progress.stats(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.progress.streaks(userId) });
    }
  }, [queryClient, userId]);

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
 */
export function useRefreshUserData() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const userId = user?.id;

  const refreshUserData = async () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.study.history(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.progress.stats(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.progress.streaks(userId) });
    }
  };

  return { refreshUserData };
}

