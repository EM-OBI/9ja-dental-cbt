import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Points configuration and constants
export const POINTS_CONFIG = {
  // Quiz completion points
  QUIZ_COMPLETION_BASE: 100,
  QUIZ_PERFECT_SCORE_BONUS: 50, // 100% accuracy
  QUIZ_HIGH_SCORE_BONUS: 25, // 90-99% accuracy
  QUIZ_SPEED_BONUS: 20, // Completed quickly
  QUIZ_FIRST_ATTEMPT_BONUS: 15, // First attempt at quiz

  // Study session points
  STUDY_SESSION_BASE: 20,
  STUDY_FOCUS_BONUS: 10, // Completed without breaks
  STUDY_LONG_SESSION_BONUS: 15, // >30 minutes

  // Streak points
  DAILY_STREAK_BASE: 10,
  WEEKLY_STREAK_BONUS: 50, // 7 days
  MONTHLY_STREAK_BONUS: 200, // 30 days

  // Achievement points
  ACHIEVEMENT_BRONZE: 25,
  ACHIEVEMENT_SILVER: 50,
  ACHIEVEMENT_GOLD: 100,
  ACHIEVEMENT_PLATINUM: 200,

  // Social points
  LEADERBOARD_TOP_10: 30,
  LEADERBOARD_TOP_3: 50,
  LEADERBOARD_FIRST_PLACE: 100,

  // Level progression
  XP_PER_LEVEL: 1000,
  LEVEL_UP_BONUS: 100,

  // Special activities
  PROFILE_COMPLETION: 50,
  FIRST_LOGIN: 20,
  DAILY_LOGIN: 5,
  REFERRAL_BONUS: 150,
  FEEDBACK_SUBMISSION: 15,
};

export type PointsEventType =
  | "quiz_completion"
  | "quiz_perfect_score"
  | "quiz_high_score"
  | "quiz_speed_bonus"
  | "quiz_first_attempt"
  | "study_session"
  | "study_focus_bonus"
  | "study_long_session"
  | "daily_streak"
  | "weekly_streak"
  | "monthly_streak"
  | "achievement_earned"
  | "leaderboard_position"
  | "level_up"
  | "daily_login"
  | "profile_completion"
  | "first_login"
  | "referral"
  | "feedback_submission";

export interface PointsTransaction {
  id: string;
  userId: string;
  type: PointsEventType;
  points: number;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  multiplier?: number;
}

export interface PointsMultiplier {
  id: string;
  name: string;
  multiplier: number; // 1.5 = 50% bonus, 2.0 = 100% bonus
  description: string;
  validUntil?: string;
  conditions?: string[];
}

export interface UserPointsData {
  totalPoints: number;
  todayPoints: number;
  weekPoints: number;
  monthPoints: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  transactions: PointsTransaction[];
  activeMultipliers: PointsMultiplier[];
  pointsHistory: {
    date: string;
    points: number;
  }[];
}

interface PointsState {
  userPoints: UserPointsData;
  isLoading: boolean;
}

interface PointsActions {
  // Core actions
  awardPoints: (
    type: PointsEventType,
    metadata?: Record<string, unknown>
  ) => void;
  deductPoints: (points: number, reason: string) => void;

  // Specific point awarding methods
  awardQuizPoints: (
    score: number,
    totalQuestions: number,
    timeSpent: number,
    isFirstAttempt?: boolean
  ) => void;
  awardStudyPoints: (sessionDuration: number, focusTime: number) => void;
  awardStreakPoints: (streakDays: number) => void;
  awardAchievementPoints: (
    achievementTier: "bronze" | "silver" | "gold" | "platinum"
  ) => void;
  awardLeaderboardPoints: (position: number) => void;
  awardDailyLoginPoints: () => void;

  // Multipliers
  addMultiplier: (multiplier: PointsMultiplier) => void;
  removeMultiplier: (multiplierId: string) => void;

  // Level management
  checkLevelUp: () => boolean;
  calculateLevel: (xp: number) => number;

  // Utilities
  getPointsForEvent: (
    type: PointsEventType,
    metadata?: Record<string, unknown>
  ) => number;
  getDescriptionForEvent: (
    type: PointsEventType,
    metadata?: Record<string, unknown>
  ) => string;
  getTodayTransactions: () => PointsTransaction[];
  getTransactionsByType: (type: PointsEventType) => PointsTransaction[];

  // Reset/maintenance
  resetDailyPoints: () => void;
  resetWeeklyPoints: () => void;
  resetAllPoints: () => void;
  initializeUser: (userId: string) => void;
}

type PointsStore = PointsState & PointsActions;

// Default user points data
const defaultUserPoints: UserPointsData = {
  totalPoints: 0,
  todayPoints: 0,
  weekPoints: 0,
  monthPoints: 0,
  level: 1,
  xp: 0,
  xpToNextLevel: POINTS_CONFIG.XP_PER_LEVEL,
  transactions: [],
  activeMultipliers: [],
  pointsHistory: [],
};

export const usePointsStore = create<PointsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      userPoints: defaultUserPoints,
      isLoading: false,

      // Core actions
      awardPoints: (type: PointsEventType, metadata = {}) => {
        const state = get();
        const basePoints = get().getPointsForEvent(type, metadata);

        // Apply multipliers
        let finalPoints = basePoints;
        state.userPoints.activeMultipliers.forEach((multiplier) => {
          finalPoints *= multiplier.multiplier;
        });

        finalPoints = Math.round(finalPoints);

        // Create transaction
        const transaction: PointsTransaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: (metadata.userId as string) || "current-user",
          type,
          points: finalPoints,
          description: get().getDescriptionForEvent(type, metadata),
          metadata,
          timestamp: new Date().toISOString(),
          multiplier:
            state.userPoints.activeMultipliers.length > 0
              ? state.userPoints.activeMultipliers.reduce(
                  (acc, m) => acc * m.multiplier,
                  1
                )
              : undefined,
        };

        // Update state
        set((state) => ({
          userPoints: {
            ...state.userPoints,
            totalPoints: state.userPoints.totalPoints + finalPoints,
            todayPoints: state.userPoints.todayPoints + finalPoints,
            weekPoints: state.userPoints.weekPoints + finalPoints,
            monthPoints: state.userPoints.monthPoints + finalPoints,
            xp: state.userPoints.xp + finalPoints,
            transactions: [transaction, ...state.userPoints.transactions].slice(
              0,
              100
            ), // Keep last 100 transactions
            pointsHistory: [
              ...state.userPoints.pointsHistory.filter(
                (h) => h.date !== new Date().toISOString().split("T")[0]
              ),
              {
                date: new Date().toISOString().split("T")[0],
                points: state.userPoints.todayPoints + finalPoints,
              },
            ].slice(-30), // Keep last 30 days
          },
        }));

        // Check for level up
        get().checkLevelUp();
      },

      deductPoints: (points: number, reason: string) => {
        const transaction: PointsTransaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: "current-user",
          type: "quiz_completion", // Generic type for deductions
          points: -points,
          description: `Points deducted: ${reason}`,
          metadata: { reason },
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          userPoints: {
            ...state.userPoints,
            totalPoints: Math.max(0, state.userPoints.totalPoints - points),
            transactions: [transaction, ...state.userPoints.transactions].slice(
              0,
              100
            ),
          },
        }));
      },

      // Specific point awarding methods
      awardQuizPoints: (
        score: number,
        totalQuestions: number,
        timeSpent: number,
        isFirstAttempt = false
      ) => {
        const accuracy = (score / totalQuestions) * 100;
        const metadata = {
          score,
          totalQuestions,
          timeSpent,
          accuracy,
          isFirstAttempt,
        };

        // Base completion points
        get().awardPoints("quiz_completion", metadata);

        // Accuracy bonuses
        if (accuracy === 100) {
          get().awardPoints("quiz_perfect_score", metadata);
        } else if (accuracy >= 90) {
          get().awardPoints("quiz_high_score", metadata);
        }

        // Speed bonus (if completed in less than 50% of allocated time)
        const averageTimePerQuestion = timeSpent / totalQuestions;
        if (averageTimePerQuestion < 30) {
          // Less than 30 seconds per question
          get().awardPoints("quiz_speed_bonus", metadata);
        }

        // First attempt bonus
        if (isFirstAttempt) {
          get().awardPoints("quiz_first_attempt", metadata);
        }
      },

      awardStudyPoints: (sessionDuration: number, focusTime: number) => {
        const metadata = { sessionDuration, focusTime };

        // Base study points
        get().awardPoints("study_session", metadata);

        // Focus bonus (if focusTime is 90% or more of sessionDuration)
        if (focusTime >= sessionDuration * 0.9) {
          get().awardPoints("study_focus_bonus", metadata);
        }

        // Long session bonus
        if (sessionDuration >= 30) {
          get().awardPoints("study_long_session", metadata);
        }
      },

      awardStreakPoints: (streakDays: number) => {
        const metadata = { streakDays };

        // Daily streak points
        get().awardPoints("daily_streak", metadata);

        // Milestone bonuses
        if (streakDays % 30 === 0) {
          get().awardPoints("monthly_streak", metadata);
        } else if (streakDays % 7 === 0) {
          get().awardPoints("weekly_streak", metadata);
        }
      },

      awardAchievementPoints: (
        achievementTier: "bronze" | "silver" | "gold" | "platinum"
      ) => {
        get().awardPoints("achievement_earned", { tier: achievementTier });
      },

      awardLeaderboardPoints: (position: number) => {
        get().awardPoints("leaderboard_position", { position });
      },

      awardDailyLoginPoints: () => {
        const lastLogin = localStorage.getItem("lastDailyLogin");
        const today = new Date().toISOString().split("T")[0];

        if (lastLogin !== today) {
          get().awardPoints("daily_login");
          localStorage.setItem("lastDailyLogin", today);
        }
      },

      // Multipliers
      addMultiplier: (multiplier: PointsMultiplier) => {
        set((state) => ({
          userPoints: {
            ...state.userPoints,
            activeMultipliers: [
              ...state.userPoints.activeMultipliers.filter(
                (m) => m.id !== multiplier.id
              ),
              multiplier,
            ],
          },
        }));
      },

      removeMultiplier: (multiplierId: string) => {
        set((state) => ({
          userPoints: {
            ...state.userPoints,
            activeMultipliers: state.userPoints.activeMultipliers.filter(
              (m) => m.id !== multiplierId
            ),
          },
        }));
      },

      // Level management
      checkLevelUp: () => {
        const state = get();
        const currentLevel = state.userPoints.level;
        const newLevel = get().calculateLevel(state.userPoints.xp);

        if (newLevel > currentLevel) {
          // Level up!
          set((prevState) => ({
            userPoints: {
              ...prevState.userPoints,
              level: newLevel,
              xpToNextLevel:
                POINTS_CONFIG.XP_PER_LEVEL -
                (prevState.userPoints.xp % POINTS_CONFIG.XP_PER_LEVEL),
            },
          }));

          // Award level up bonus (without triggering another level check)
          const transaction: PointsTransaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: "current-user",
            type: "level_up",
            points: POINTS_CONFIG.LEVEL_UP_BONUS,
            description: `Level ${newLevel} reached! Bonus points awarded.`,
            metadata: { oldLevel: currentLevel, newLevel },
            timestamp: new Date().toISOString(),
          };

          set((state) => ({
            userPoints: {
              ...state.userPoints,
              totalPoints:
                state.userPoints.totalPoints + POINTS_CONFIG.LEVEL_UP_BONUS,
              transactions: [
                transaction,
                ...state.userPoints.transactions,
              ].slice(0, 100),
            },
          }));

          return true;
        }

        // Update XP to next level
        set((state) => ({
          userPoints: {
            ...state.userPoints,
            xpToNextLevel:
              POINTS_CONFIG.XP_PER_LEVEL -
              (state.userPoints.xp % POINTS_CONFIG.XP_PER_LEVEL),
          },
        }));

        return false;
      },

      calculateLevel: (xp: number) => {
        return Math.floor(xp / POINTS_CONFIG.XP_PER_LEVEL) + 1;
      },

      // Utilities
      getPointsForEvent: (type: PointsEventType, metadata = {}) => {
        switch (type) {
          case "quiz_completion":
            return POINTS_CONFIG.QUIZ_COMPLETION_BASE;
          case "quiz_perfect_score":
            return POINTS_CONFIG.QUIZ_PERFECT_SCORE_BONUS;
          case "quiz_high_score":
            return POINTS_CONFIG.QUIZ_HIGH_SCORE_BONUS;
          case "quiz_speed_bonus":
            return POINTS_CONFIG.QUIZ_SPEED_BONUS;
          case "quiz_first_attempt":
            return POINTS_CONFIG.QUIZ_FIRST_ATTEMPT_BONUS;
          case "study_session":
            return POINTS_CONFIG.STUDY_SESSION_BASE;
          case "study_focus_bonus":
            return POINTS_CONFIG.STUDY_FOCUS_BONUS;
          case "study_long_session":
            return POINTS_CONFIG.STUDY_LONG_SESSION_BONUS;
          case "daily_streak":
            return POINTS_CONFIG.DAILY_STREAK_BASE;
          case "weekly_streak":
            return POINTS_CONFIG.WEEKLY_STREAK_BONUS;
          case "monthly_streak":
            return POINTS_CONFIG.MONTHLY_STREAK_BONUS;
          case "achievement_earned":
            const tier = metadata.tier as
              | "bronze"
              | "silver"
              | "gold"
              | "platinum";
            return POINTS_CONFIG[
              `ACHIEVEMENT_${
                tier.toUpperCase() as "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
              }`
            ];
          case "leaderboard_position":
            const position = metadata.position as number;
            if (position === 1) return POINTS_CONFIG.LEADERBOARD_FIRST_PLACE;
            if (position <= 3) return POINTS_CONFIG.LEADERBOARD_TOP_3;
            if (position <= 10) return POINTS_CONFIG.LEADERBOARD_TOP_10;
            return 0;
          case "level_up":
            return POINTS_CONFIG.LEVEL_UP_BONUS;
          case "daily_login":
            return POINTS_CONFIG.DAILY_LOGIN;
          case "profile_completion":
            return POINTS_CONFIG.PROFILE_COMPLETION;
          case "first_login":
            return POINTS_CONFIG.FIRST_LOGIN;
          case "referral":
            return POINTS_CONFIG.REFERRAL_BONUS;
          case "feedback_submission":
            return POINTS_CONFIG.FEEDBACK_SUBMISSION;
          default:
            return 0;
        }
      },

      getDescriptionForEvent: (type: PointsEventType, metadata = {}) => {
        switch (type) {
          case "quiz_completion":
            return `Quiz completed with ${(
              metadata.accuracy as number
            )?.toFixed(1)}% accuracy`;
          case "quiz_perfect_score":
            return `Perfect score! 100% accuracy achieved`;
          case "quiz_high_score":
            return `High score! ${(metadata.accuracy as number)?.toFixed(
              1
            )}% accuracy`;
          case "quiz_speed_bonus":
            return `Speed bonus for quick completion`;
          case "quiz_first_attempt":
            return `First attempt bonus`;
          case "study_session":
            return `Study session completed (${metadata.sessionDuration} minutes)`;
          case "study_focus_bonus":
            return `Focus bonus for uninterrupted study`;
          case "study_long_session":
            return `Long study session bonus (30+ minutes)`;
          case "daily_streak":
            return `Daily streak maintained (${metadata.streakDays} days)`;
          case "weekly_streak":
            return `Weekly streak milestone reached!`;
          case "monthly_streak":
            return `Monthly streak milestone reached!`;
          case "achievement_earned":
            return `Achievement unlocked: ${metadata.tier} tier`;
          case "leaderboard_position":
            return `Leaderboard position #${metadata.position}`;
          case "level_up":
            return `Level ${metadata.newLevel} reached!`;
          case "daily_login":
            return `Daily login bonus`;
          case "profile_completion":
            return `Profile completion bonus`;
          case "first_login":
            return `Welcome bonus for first login`;
          case "referral":
            return `Referral bonus`;
          case "feedback_submission":
            return `Feedback submission bonus`;
          default:
            return `Points awarded`;
        }
      },

      getTodayTransactions: () => {
        const today = new Date().toISOString().split("T")[0];
        return get().userPoints.transactions.filter((t) =>
          t.timestamp.startsWith(today)
        );
      },

      getTransactionsByType: (type: PointsEventType) => {
        return get().userPoints.transactions.filter((t) => t.type === type);
      },

      // Reset/maintenance
      resetDailyPoints: () => {
        set((state) => ({
          userPoints: {
            ...state.userPoints,
            todayPoints: 0,
          },
        }));
      },

      resetWeeklyPoints: () => {
        set((state) => ({
          userPoints: {
            ...state.userPoints,
            weekPoints: 0,
          },
        }));
      },

      resetAllPoints: () => {
        set((state) => ({
          ...state,
          userPoints: defaultUserPoints,
        }));
      },

      initializeUser: (userId: string) => {
        // Initialize with default data if needed
        const state = get();
        if (state.userPoints.totalPoints === 0) {
          get().awardPoints("first_login", { userId });
        }
      },
    }),
    {
      name: "points-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userPoints: state.userPoints,
      }),
    }
  )
);

// Utility functions for external use
export const formatPoints = (points: number): string => {
  if (points >= 1000000) {
    return `${(points / 1000000).toFixed(1)}M`;
  }
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points.toString();
};

export const getPointsColor = (points: number): string => {
  if (points >= 100) return "text-yellow-500"; // Gold
  if (points >= 50) return "text-blue-500"; // Blue
  if (points >= 25) return "text-green-500"; // Green
  return "text-gray-500"; // Default
};

export const getLevelProgress = (xp: number): number => {
  const xpInCurrentLevel = xp % POINTS_CONFIG.XP_PER_LEVEL;
  return (xpInCurrentLevel / POINTS_CONFIG.XP_PER_LEVEL) * 100;
};
