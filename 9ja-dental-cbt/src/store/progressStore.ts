import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  StreakData,
  Achievement,
  ProgressStats,
  ProgressActions,
} from "./types";
import { useUserStore, addXp, getCurrentUserId } from "./userStore";
import { getUserStorageKey } from "./storeUtils";

interface ProgressState {
  streakData: StreakData;
  achievements: Achievement[];
  progressStats: ProgressStats;
  recentActivity: Array<{
    id: string;
    type: "quiz" | "study" | "achievement" | "streak";
    description: string;
    timestamp: string;
    points?: number;
  }>;
  isLoading: boolean;
  lastFetched: number | null;
}

type ProgressStore = ProgressState & ProgressActions;

const memoryStorage = (() => {
  const store = new Map<string, string>();
  return {
    getItem: (name: string) => store.get(name) ?? null,
    setItem: (name: string, value: string) => {
      store.set(name, value);
    },
    removeItem: (name: string) => {
      store.delete(name);
    },
  };
})();

const getScopedStorage = () => {
  if (typeof window === "undefined") {
    return memoryStorage;
  }

  return {
    getItem: (name: string) => {
      const key = getUserStorageKey(name);
      return window.localStorage.getItem(key);
    },
    setItem: (name: string, value: string) => {
      const key = getUserStorageKey(name);
      window.localStorage.setItem(key, value);
    },
    removeItem: (name: string) => {
      const key = getUserStorageKey(name);
      window.localStorage.removeItem(key);
    },
  };
};

// Default achievements
const defaultAchievementsTemplate: Achievement[] = [
  {
    id: "first-quiz",
    title: "First Steps",
    description: "Complete your first quiz",
    icon: "🎯",
    category: "quiz",
    criteria: { type: "count", target: 1, metric: "quizzes_completed" },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: "quiz-master",
    title: "Quiz Master",
    description: "Complete 50 quizzes",
    icon: "🏆",
    category: "quiz",
    criteria: { type: "count", target: 50, metric: "quizzes_completed" },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Score 100% on a quiz",
    icon: "⭐",
    category: "quiz",
    criteria: { type: "percentage", target: 100, metric: "quiz_score" },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: "consistent-learner",
    title: "Consistent Learner",
    description: "Maintain a 7-day study streak",
    icon: "🔥",
    category: "streak",
    criteria: { type: "streak", target: 7, metric: "study_streak" },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: "study-marathon",
    title: "Study Marathon",
    description: "Study for 10 hours total",
    icon: "📚",
    category: "study",
    criteria: { type: "time", target: 36000, metric: "study_time_seconds" }, // 10 hours
    progress: 0,
    isUnlocked: false,
  },
  {
    id: "knowledge-seeker",
    title: "Knowledge Seeker",
    description: "Complete 10 study materials",
    icon: "🎓",
    category: "study",
    criteria: { type: "count", target: 10, metric: "materials_completed" },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: "specialist",
    title: "Specialist",
    description: "Achieve 90% accuracy in any specialty",
    icon: "🥇",
    category: "quiz",
    criteria: { type: "percentage", target: 90, metric: "specialty_accuracy" },
    progress: 0,
    isUnlocked: false,
  },
  {
    id: "level-up",
    title: "Level Up",
    description: "Reach level 10",
    icon: "⬆️",
    category: "progress",
    criteria: { type: "count", target: 10, metric: "user_level" },
    progress: 0,
    isUnlocked: false,
  },
];

const createDefaultAchievements = (): Achievement[] =>
  defaultAchievementsTemplate.map((achievement) => ({ ...achievement }));

// Generate empty streak history for the last 30 days
const generateEmptyStreakHistory = () => {
  const history = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    history.push({
      date: date.toISOString().split("T")[0],
      active: false,
      activityTypes: [],
      activityCount: 0,
    });
  }

  return history;
};

// Calculate current streak from history
const calculateCurrentStreak = (history: StreakData["streakHistory"]) => {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].active) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// Calculate longest streak from history
const calculateLongestStreak = (history: StreakData["streakHistory"]) => {
  let longest = 0;
  let current = 0;

  for (const day of history) {
    if (day.active) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
};

const createInitialStreakData = (): StreakData => ({
  userId: getCurrentUserId() ?? "",
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: new Date().toISOString().split("T")[0],
  streakHistory: generateEmptyStreakHistory(),
  weeklyGoal: 5,
  monthlyGoal: 20,
});

const createInitialProgressStats = (streakData: StreakData): ProgressStats => ({
  quizzes: {
    total: 0,
    completed: 0,
    averageScore: 0,
    bestScore: 0,
    timeSpent: 0,
    bySpecialty: {},
  },
  study: {
    totalHours: 0,
    totalMinutes: 0,
    materialsCompleted: 0,
    notesCreated: 0,
    focusSessions: 0,
    averageFocusTime: 0,
  },
  streaks: streakData,
  level: {
    current: 1,
    xp: 0,
    xpToNext: 100,
    totalXp: 0,
  },
  achievements: createDefaultAchievements(),
  recentActivity: [],
});

const createInitialProgressState = () => {
  const streakData = createInitialStreakData();
  return {
    streakData,
    achievements: createDefaultAchievements(),
    progressStats: createInitialProgressStats(streakData),
    recentActivity: [],
    isLoading: false,
    lastFetched: null,
  } satisfies Pick<
    ProgressStore,
    | "streakData"
    | "achievements"
    | "progressStats"
    | "recentActivity"
    | "isLoading"
    | "lastFetched"
  >;
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...createInitialProgressState(),

      resetProgress: () => {
        const initialState = createInitialProgressState();
        set({
          ...initialState,
        });
      },
      // Database integration actions


      // Actions
      initializeStreakData: () => {
        set((state) => {
          const resolvedUserId = getCurrentUserId() ?? state.streakData.userId;

          return {
            streakData: {
              ...state.streakData,
              userId: resolvedUserId,
              currentStreak: calculateCurrentStreak(
                state.streakData.streakHistory
              ),
              longestStreak: calculateLongestStreak(
                state.streakData.streakHistory
              ),
            },
          };
        });
      },



      updateStreak: (
        activityType: "quiz" | "study" | "review" | "login" | "streak"
      ) => {
        const currentStreakData = get().streakData;
        const today = new Date().toISOString().split("T")[0];
        const resolvedUserId = getCurrentUserId() ?? currentStreakData.userId;

        // Update streak history
        const updatedHistory = [...currentStreakData.streakHistory];
        const todayIndex = updatedHistory.findIndex(
          (day) => day.date === today
        );

        if (todayIndex !== -1) {
          // Update today's activity
          const todayData = updatedHistory[todayIndex];
          if (!todayData.activityTypes.includes(activityType)) {
            todayData.activityTypes.push(activityType);
            todayData.activityCount++;
          }
          todayData.active = true;
        } else {
          // Add today's activity
          updatedHistory.push({
            date: today,
            active: true,
            activityTypes: [activityType],
            activityCount: 1,
          });
        }

        const trimmedHistory = updatedHistory.slice(-30);

        // Recalculate streaks
        const derivedCurrentStreak = calculateCurrentStreak(trimmedHistory);
        const nextCurrentStreak = Math.max(
          currentStreakData.currentStreak,
          derivedCurrentStreak
        );
        const longestStreak = Math.max(
          calculateLongestStreak(trimmedHistory),
          currentStreakData.longestStreak,
          nextCurrentStreak
        );

        const updatedStreakData: StreakData = {
          ...currentStreakData,
          userId: resolvedUserId,
          currentStreak: nextCurrentStreak,
          longestStreak,
          lastActivityDate: today,
          streakHistory: trimmedHistory,
        };

        set({ streakData: updatedStreakData });

        // Add activity to recent activity
        get().addActivity({
          type: "streak",
          description: `Maintained ${nextCurrentStreak}-day streak with ${activityType}`,
          points: nextCurrentStreak * 5,
        });

        // Check for streak achievements
        if (nextCurrentStreak === 7) {
          get().unlockAchievement("consistent-learner");
        }
      },

      unlockAchievement: (achievementId: string) => {
        const achievements = get().achievements;
        const achievement = achievements.find((a) => a.id === achievementId);

        if (achievement && !achievement.isUnlocked) {
          const updatedAchievements = achievements.map((a) =>
            a.id === achievementId
              ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() }
              : a
          );

          set({ achievements: updatedAchievements });

          // Add XP reward for achievement
          const xpReward = 100;
          addXp(xpReward);

          // Add to recent activity
          get().addActivity({
            type: "achievement",
            description: `Unlocked achievement: ${achievement.title}`,
            points: xpReward,
          });
        }
      },

      addActivity: (activity) => {
        set((state) => ({
          recentActivity: [
            {
              id: `activity-${Date.now()}`,
              type: activity.type,
              description: activity.description,
              timestamp: new Date().toISOString(),
              points: activity.points,
            },
            ...state.recentActivity,
          ].slice(0, 50), // Keep last 50 activities
        }));
      },

      clearRecentActivity: () => {
        set({ recentActivity: [] });
      },

      updateAchievementProgress: () => {
        const { progressStats, achievements } = get();

        const updatedAchievements = achievements.map((achievement) => {
          let progress = 0;

          switch (achievement.id) {
            case "first-quiz":
            case "quiz-master":
              progress = Math.min(
                progressStats.quizzes.completed,
                achievement.criteria.target
              );
              break;
            case "perfectionist":
              progress =
                progressStats.quizzes.bestScore >= 100
                  ? 100
                  : progressStats.quizzes.bestScore;
              break;
            case "consistent-learner":
              progress = Math.min(
                progressStats.streaks.currentStreak,
                achievement.criteria.target
              );
              break;
            case "study-marathon":
              progress = Math.min(
                progressStats.study.totalHours * 3600,
                achievement.criteria.target
              );
              break;
            case "knowledge-seeker":
              progress = Math.min(
                progressStats.study.materialsCompleted,
                achievement.criteria.target
              );
              break;
            case "specialist":
              const maxAccuracy = Math.max(
                ...Object.values(progressStats.quizzes.bySpecialty).map(
                  (s) => s.accuracy
                )
              );
              progress = Math.min(maxAccuracy, 90);
              break;
            case "level-up":
              progress = Math.min(
                progressStats.level.current,
                achievement.criteria.target
              );
              break;
          }

          // Auto-unlock if criteria met
          const shouldUnlock =
            progress >= achievement.criteria.target && !achievement.isUnlocked;

          return {
            ...achievement,
            progress,
            ...(shouldUnlock && {
              isUnlocked: true,
              unlockedAt: new Date().toISOString(),
            }),
          };
        });

        set({ achievements: updatedAchievements });
      },
    }),
    {
      name: "progress-storage",
      storage: createJSONStorage(() => getScopedStorage()),
      partialize: (state) => ({
        streakData: state.streakData,
        achievements: state.achievements,
        recentActivity: state.recentActivity,
        // Don't persist progressStats as it's derived/fetched
      }),
    }
  )
);

// Helper functions
export const getTodaysActivity = () => {
  const { streakData } = useProgressStore.getState();
  const today = new Date().toISOString().split("T")[0];

  return (
    streakData.streakHistory.find((day) => day.date === today) || {
      date: today,
      active: false,
      activityTypes: [],
      activityCount: 0,
    }
  );
};

export const getWeeklyProgress = () => {
  const { streakData } = useProgressStore.getState();
  const lastWeek = streakData.streakHistory.slice(-7);
  const activeDays = lastWeek.filter((day) => day.active).length;

  return {
    activeDays,
    totalDays: 7,
    percentage: Math.round((activeDays / 7) * 100),
    goal: streakData.weeklyGoal,
    goalMet: activeDays >= streakData.weeklyGoal,
  };
};

export const getMonthlyProgress = () => {
  const { streakData } = useProgressStore.getState();
  const lastMonth = streakData.streakHistory.slice(-30);
  const activeDays = lastMonth.filter((day) => day.active).length;

  return {
    activeDays,
    totalDays: 30,
    percentage: Math.round((activeDays / 30) * 100),
    goal: streakData.monthlyGoal,
    goalMet: activeDays >= streakData.monthlyGoal,
  };
};

export const getUnlockedAchievements = () => {
  const { achievements } = useProgressStore.getState();
  return achievements.filter((a) => a.isUnlocked);
};

export const getPendingAchievements = () => {
  const { achievements } = useProgressStore.getState();
  return achievements
    .filter((a) => !a.isUnlocked && a.progress > 0)
    .sort(
      (a, b) => b.progress / b.criteria.target - a.progress / a.criteria.target
    );
};
