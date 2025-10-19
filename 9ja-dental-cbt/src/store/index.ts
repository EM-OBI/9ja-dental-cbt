// Main store exports and initialization
import { useUserStore, initializeUser } from "./userStore";
import { useQuizStore } from "./quizStore";
import { useStudyStore, getStudyStats } from "./studyStore";
import { useProgressStore } from "./progressStore";
import { useThemeStore, initializeTheme } from "./themeStore";
import {
  useNotificationStore,
  requestNotificationPermission,
  showAchievementNotification,
} from "./notificationStore";

// Re-export everything
export {
  useUserStore,
  initializeUser,
  addXp,
  getCurrentUserId,
} from "./userStore";
export { useQuizStore } from "./quizStore";
export {
  useStudyStore,
  getStudyStats,
  getRecentMaterials,
  getBookmarkedMaterials,
  searchMaterials,
} from "./studyStore";
export {
  useProgressStore,
  getTodaysActivity,
  getWeeklyProgress,
  getMonthlyProgress,
  getUnlockedAchievements,
  getPendingAchievements,
} from "./progressStore";
export {
  useThemeStore,
  useThemeMode,
  useThemeConfig,
  useThemeColors,
  useThemeAccessibility,
  useThemeStyles,
  initializeTheme,
} from "./themeStore";
export {
  useNotificationStore,
  requestNotificationPermission,
  showAchievementNotification,
  showStreakNotification,
  showReminderNotification,
  getNotificationsByType,
  getRecentNotifications,
} from "./notificationStore";

// Export types
export type * from "./types";

// Store initialization
export const initializeStores = () => {
  // Initialize user store
  initializeUser();

  // Initialize theme system
  initializeTheme();

  // Update progress stats
  const { updateStats } = useProgressStore.getState();
  updateStats();

  // Request notification permission
  requestNotificationPermission();
};

// Global state selectors
export const useAppState = () => {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const currentQuiz = useQuizStore((state) => state.currentSession);
  const currentStudy = useStudyStore((state) => state.currentSession);
  const unreadNotifications = useNotificationStore(
    (state) => state.unreadCount
  );
  const streakData = useProgressStore((state) => state.streakData);
  const themeMode = useThemeStore((state) => state.mode);

  return {
    user,
    isAuthenticated,
    currentQuiz,
    currentStudy,
    unreadNotifications,
    streakData,
    themeMode,
    isInActiveSession: !!(currentQuiz?.isActive || currentStudy?.isActive),
  };
};

// Combined stats selector
export const useCombinedStats = () => {
  // getQuizStats removed - use useQuizHistory hook from API instead
  const studyStats = getStudyStats();
  const progressStats = useProgressStore((state) => state.progressStats);
  const achievements = useProgressStore((state) => state.achievements);

  return {
    quiz: null, // Deprecated - use useQuizHistory hook
    study: studyStats,
    progress: progressStats,
    achievements,
    unlockedAchievements: achievements.filter((a) => a.isUnlocked),
    pendingAchievements: achievements.filter(
      (a) => !a.isUnlocked && a.progress > 0
    ),
  };
};

// Activity tracking helpers
export const trackActivity = (type: "quiz" | "study" | "review") => {
  const { updateStreak } = useProgressStore.getState();
  updateStreak(type);
};

export const trackQuizCompletion = (score: number, specialty: string) => {
  const { addActivity } = useProgressStore.getState();

  addActivity({
    type: "quiz",
    description: `Completed ${specialty} quiz with ${score}% score`,
    points: Math.floor(score / 10) * 5, // 5 points per 10% score
  });

  trackActivity("quiz");

  // Show notifications for milestones
  if (score === 100) {
    showAchievementNotification(
      "Perfect Score!",
      "You answered all questions correctly!"
    );
  } else if (score >= 90) {
    showAchievementNotification("Excellent!", "Great job on that quiz!");
  }
};

export const trackStudyCompletion = (
  materialTitle: string,
  timeSpent: number
) => {
  const { addActivity } = useProgressStore.getState();

  addActivity({
    type: "study",
    description: `Studied "${materialTitle}" for ${Math.floor(
      timeSpent / 60
    )} minutes`,
    points: Math.min(Math.floor(timeSpent / 300) * 10, 50), // 10 points per 5 minutes, max 50
  });

  trackActivity("study");
};

// Theme management helper (now uses dedicated theme store)
export const useTheme = () => {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const config = useThemeStore((state) => state.config);
  const fontScale = useThemeStore((state) => state.fontScale);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);
  const setFontScale = useThemeStore((state) => state.setFontScale);
  const setReducedMotion = useThemeStore((state) => state.setReducedMotion);

  return {
    mode,
    setMode,
    config,
    fontScale,
    reducedMotion,
    setFontScale,
    setReducedMotion,
    // Legacy compatibility
    theme: mode,
    setTheme: setMode,
  };
};

// Subscription helpers
export const useSubscription = () => {
  const subscription = useUserStore(
    (state) => state.user?.subscription || "free"
  );
  const user = useUserStore((state) => state.user);

  const isPremium = subscription === "premium" || subscription === "enterprise";
  const isEnterprise = subscription === "enterprise";

  const features = {
    unlimitedQuizzes: isPremium,
    aiStudyAssistant: isPremium,
    advancedAnalytics: isPremium,
    offlineMode: isPremium,
    prioritySupport: isEnterprise,
    customBranding: isEnterprise,
    multiUser: isEnterprise,
  };

  return {
    subscription,
    isPremium,
    isEnterprise,
    features,
    user,
  };
};
