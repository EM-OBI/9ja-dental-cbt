import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  StreakData,
  Achievement,
  ProgressStats,
  ProgressActions,
} from "./types";
import { useUserStore, addXp, getCurrentUserId } from "./userStore";
import { getQuizStats, getSpecialtyStats } from "./quizStore";
import { getStudyStats } from "./studyStore";

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

// Default achievements
const defaultAchievements: Achievement[] = [
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

// Generate mock streak history for the last 30 days
const generateStreakHistory = () => {
  const history = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const isActive = Math.random() > 0.3; // 70% chance of activity
    const activityTypes: ("quiz" | "study" | "review")[] = [];

    if (isActive) {
      if (Math.random() > 0.5) activityTypes.push("quiz");
      if (Math.random() > 0.5) activityTypes.push("study");
      if (Math.random() > 0.7) activityTypes.push("review");
    }

    history.push({
      date: date.toISOString().split("T")[0],
      active: isActive,
      activityTypes,
      activityCount: activityTypes.length,
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

const initialStreakHistory = generateStreakHistory();
const initialStreakData: StreakData = {
  userId: getCurrentUserId() ?? "",
  currentStreak: 0, // Start with 0 to avoid hydration mismatch
  longestStreak: 0, // Start with 0 to avoid hydration mismatch
  lastActivityDate: new Date().toISOString().split("T")[0],
  streakHistory: initialStreakHistory,
  weeklyGoal: 5,
  monthlyGoal: 20,
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      // Initial state
      streakData: initialStreakData,
      achievements: defaultAchievements,
      progressStats: {
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
          materialsCompleted: 0,
          notesCreated: 0,
          focusSessions: 0,
          averageFocusTime: 0,
        },
        streaks: initialStreakData,
        level: {
          current: 1,
          xp: 0,
          xpToNext: 100,
          totalXp: 0,
        },
        achievements: defaultAchievements,
        recentActivity: [],
      },
      recentActivity: [],
      isLoading: false,
      lastFetched: null,

      // Database integration actions
      loadProgressFromDatabase: async (userId: string) => {
        set({ isLoading: true });
        try {
          // Fetch progress, streaks data from API
          const [progressRes, streaksRes] = await Promise.all([
            fetch(`/api/users/${userId}/progress`),
            fetch(`/api/users/${userId}/streaks`),
          ]);

          const progressData = (await progressRes.json()) as {
            success: boolean;
            data?: Record<string, unknown>;
          };
          const streaksData = (await streaksRes.json()) as {
            success: boolean;
            data?: Array<Record<string, unknown>>;
          };

          if (progressData.success && streaksData.success) {
            // Transform API data to store format
            const apiProgress = progressData.data || {};
            const apiStreaks = streaksData.data || [];

            // Find specific streak types
            const dailyQuizStreak = apiStreaks.find(
              (s) => s.streakType === "daily_quiz"
            );

            // Update streak data with real data from database
            const updatedStreakData: StreakData = {
              userId,
              currentStreak: (dailyQuizStreak?.currentCount as number) || 0,
              longestStreak: (dailyQuizStreak?.bestCount as number) || 0,
              lastActivityDate:
                (dailyQuizStreak?.lastActivityDate as string) ||
                new Date().toISOString().split("T")[0],
              streakHistory: get().streakData.streakHistory, // Keep local history for now
              weeklyGoal: 5,
              monthlyGoal: 20,
            };

            // Update progress stats with real data
            const updatedProgressStats: ProgressStats = {
              quizzes: {
                total: (apiProgress.totalQuizzes as number) || 0,
                completed: (apiProgress.completedQuizzes as number) || 0,
                averageScore: (apiProgress.averageScore as number) || 0,
                bestScore: (apiProgress.bestScore as number) || 0,
                timeSpent: (apiProgress.totalTimeSpent as number) || 0,
                bySpecialty:
                  (apiProgress.specialtyStats as Record<
                    string,
                    { attempted: number; accuracy: number; averageTime: number }
                  >) || {},
              },
              study: {
                totalHours: (apiProgress.totalStudyHours as number) || 0,
                materialsCompleted:
                  (apiProgress.materialsCompleted as number) || 0,
                notesCreated: (apiProgress.notesCreated as number) || 0,
                focusSessions: (apiProgress.focusSessions as number) || 0,
                averageFocusTime: (apiProgress.averageFocusTime as number) || 0,
              },
              streaks: updatedStreakData,
              level: {
                current: (apiProgress.level as number) || 1,
                xp: (apiProgress.xp as number) || 0,
                xpToNext: (apiProgress.xpToNextLevel as number) || 100,
                totalXp: (apiProgress.totalXp as number) || 0,
              },
              achievements: get().achievements, // Keep existing achievements
              recentActivity:
                (apiProgress.recentActivity as Array<{
                  id: string;
                  type: "quiz" | "study" | "achievement" | "streak";
                  description: string;
                  timestamp: string;
                  points?: number;
                }>) || [],
            };

            set({
              streakData: updatedStreakData,
              progressStats: updatedProgressStats,
              recentActivity: updatedProgressStats.recentActivity,
              isLoading: false,
              lastFetched: Date.now(),
            });
          } else {
            console.error("Failed to load progress from database");
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error loading progress from database:", error);
          set({ isLoading: false });
        }
      },

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

      updateStats: () => {
        const user = useUserStore.getState().user;
        const quizStats = getQuizStats();
        const studyStats = getStudyStats();
        const specialtyStats = getSpecialtyStats();
        const streakData = get().streakData;
        const resolvedStreakData: StreakData = {
          ...streakData,
          userId: user?.id ?? streakData.userId,
        };

        const updatedStats: ProgressStats = {
          quizzes: {
            total: quizStats.totalQuizzes,
            completed: quizStats.totalQuizzes,
            averageScore: quizStats.averageScore,
            bestScore: quizStats.bestScore,
            timeSpent: quizStats.totalTimeSpent,
            bySpecialty: specialtyStats,
          },
          study: {
            totalHours: studyStats.totalHours,
            materialsCompleted: studyStats.materialsCompleted,
            notesCreated: studyStats.totalNotes,
            focusSessions: 0, // Would be calculated from study sessions
            averageFocusTime: 0, // Would be calculated from study sessions
          },
          streaks: resolvedStreakData,
          level: {
            current: user?.level || 1,
            xp: user?.xp || 0,
            xpToNext: Math.pow(user?.level || 1, 2) * 25,
            totalXp: user?.xp || 0,
          },
          achievements: get().achievements,
          recentActivity: get().recentActivity,
        };

        set({ progressStats: updatedStats, streakData: resolvedStreakData });
      },

      updateStreak: (activityType: "quiz" | "study" | "review") => {
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

        // Recalculate streaks
        const currentStreak = calculateCurrentStreak(updatedHistory);
        const longestStreak = Math.max(
          calculateLongestStreak(updatedHistory),
          currentStreakData.longestStreak
        );

        const updatedStreakData: StreakData = {
          ...currentStreakData,
          userId: resolvedUserId,
          currentStreak,
          longestStreak,
          lastActivityDate: today,
          streakHistory: updatedHistory,
        };

        set({ streakData: updatedStreakData });

        // Add activity to recent activity
        get().addActivity({
          type: "streak",
          description: `Maintained ${currentStreak}-day streak with ${activityType}`,
          points: currentStreak * 5,
        });

        // Check for streak achievements
        if (currentStreak === 7) {
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

      addActivity: (activity: {
        type: "quiz" | "study" | "achievement" | "streak";
        description: string;
        points?: number;
      }) => {
        const newActivity = {
          ...activity,
          id: `activity-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

        const recentActivity = [newActivity, ...get().recentActivity].slice(
          0,
          20
        );

        set({ recentActivity });
      },

      // Helper method to update achievement progress
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        streakData: state.streakData,
        achievements: state.achievements,
        recentActivity: state.recentActivity,
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
