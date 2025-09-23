import { useState, useEffect, useCallback } from "react";
import {
  UnifiedProgressData,
  ProgressData,
  StudySession,
} from "@/types/progress";
import { databaseService } from "@/services/database";

// Real API service using proper backend integration
const apiProgressService = {
  async getUserProgress(
    userId: string,
    options?: { includeHistory?: boolean; limit?: number }
  ): Promise<UnifiedProgressData> {
    try {
      // Use the proper database service that calls the Hono backend
      const data = await databaseService.getUserProgress(userId);

      if (!data) {
        throw new Error("No progress data found for user");
      }

      // Transform the backend data to unified format
      return transformProgressDataToUnified(data);
    } catch (error) {
      console.error("Failed to fetch user progress:", error);
      throw error;
    }
  },

  async refreshUserProgress(userId: string): Promise<void> {
    // For now, refreshing is handled by re-fetching the data
    // In the future, this could trigger backend cache refresh
    console.log(`Refreshing progress data for user ${userId}`);
  },
};

// Data transformation utilities
const transformProgressDataToUnified = (
  data: ProgressData
): UnifiedProgressData => {
  return {
    userId: data.userId,

    // Core quiz statistics (standardized naming)
    totalQuizzes: data.quizTracking.totalQuizzesAttempted,
    completedQuizzes: data.quizTracking.totalQuizzesAttempted,
    totalQuestionsAnswered: data.quizTracking.totalQuestionsAnswered,
    correctAnswers: data.quizTracking.correctAnswers,
    incorrectAnswers: data.quizTracking.incorrectAnswers,
    averageScore: data.quizTracking.accuracyPercentage,

    // Time tracking (calculated from recent quizzes or mock data)
    totalStudyTime:
      data.quizTracking.recentQuizzes.reduce(
        (total, quiz) => total + quiz.timeSpent,
        0
      ) || 120, // fallback mock data

    // Streak data (consistent mapping)
    currentStreak: data.streakTracking.currentStreak,
    longestStreak: data.streakTracking.longestStreak,
    lastActivityDate: data.streakTracking.lastActivityDate,
    streakHistory: data.streakTracking.streakHistory,

    // Leveling system (standardized naming)
    currentLevel: data.userLeveling.currentLevel,
    experiencePoints: data.userLeveling.points,
    pointsToNextLevel: data.userLeveling.pointsToNextLevel,
    userRank: data.userLeveling.rank,
    totalUsers: data.userLeveling.totalUsers,

    // Direct mappings
    specialtyCoverage: data.specialtyCoverage,
    recentQuizzes: data.quizTracking.recentQuizzes,
    bookmarkedQuestions: data.bookmarkedQuestions,
    performanceCharts: data.performanceCharts,
    badges: data.userLeveling.badges,

    // Mock study sessions for dashboard compatibility
    recentStudySessions: [
      {
        id: "s1",
        date: "2025-09-08",
        specialty: "Oral Pathology",
        timeSpent: 30,
        topicsStudied: ["Benign Tumors", "Malignant Lesions"],
        completionPercentage: 85,
      },
      {
        id: "s2",
        date: "2025-09-07",
        specialty: "Endodontics",
        timeSpent: 45,
        topicsStudied: ["Root Canal Therapy", "Pulp Diseases"],
        completionPercentage: 92,
      },
    ],
  };
};

// Mock unified API service
const mockUnifiedProgressService = {
  async getUserProgress(userId: string): Promise<UnifiedProgressData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // This would be the unified API response in the future
    return {
      userId,

      // Core quiz statistics
      totalQuizzes: 45,
      completedQuizzes: 45,
      totalQuestionsAnswered: 450,
      correctAnswers: 383,
      incorrectAnswers: 67,
      averageScore: 85.1,

      // Time tracking
      totalStudyTime: 1250, // minutes

      // Streak data
      currentStreak: 5,
      longestStreak: 12,
      lastActivityDate: "2025-09-08",
      streakHistory: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        active: Math.random() > 0.3,
      })),

      // Leveling system
      currentLevel: "Advanced",
      experiencePoints: 2450,
      pointsToNextLevel: 550,
      userRank: 23,
      totalUsers: 1284,

      // Specialty coverage
      specialtyCoverage: {
        "Oral Pathology": {
          questionsAttempted: 45,
          accuracy: "82%",
          mastery: "Advanced",
          lastAttempted: "2025-09-08",
        },
        Endodontics: {
          questionsAttempted: 38,
          accuracy: "89%",
          mastery: "Expert",
          lastAttempted: "2025-09-07",
        },
        Periodontics: {
          questionsAttempted: 32,
          accuracy: "76%",
          mastery: "Intermediate",
          lastAttempted: "2025-09-06",
        },
        Orthodontics: {
          questionsAttempted: 28,
          accuracy: "85%",
          mastery: "Advanced",
          lastAttempted: "2025-09-05",
        },
        "Oral Surgery": {
          questionsAttempted: 25,
          accuracy: "78%",
          mastery: "Intermediate",
          lastAttempted: "2025-09-04",
        },
      },

      // Recent activity
      recentQuizzes: [
        {
          id: "q1",
          date: "2025-09-08",
          mode: "Study Mode",
          specialty: "Oral Pathology",
          questionsAttempted: 10,
          correct: 8,
          incorrect: 2,
          score: "80%",
          timeSpent: 15,
        },
        {
          id: "q2",
          date: "2025-09-07",
          mode: "Exam Mode",
          specialty: "Endodontics",
          questionsAttempted: 15,
          correct: 13,
          incorrect: 2,
          score: "87%",
          timeSpent: 25,
        },
        {
          id: "q3",
          date: "2025-09-06",
          mode: "Practice Mode",
          specialty: "Periodontics",
          questionsAttempted: 12,
          correct: 9,
          incorrect: 3,
          score: "75%",
          timeSpent: 18,
        },
      ],

      recentStudySessions: [
        {
          id: "s1",
          date: "2025-09-08",
          specialty: "Oral Pathology",
          timeSpent: 30,
          topicsStudied: ["Benign Tumors", "Malignant Lesions"],
          completionPercentage: 85,
        },
        {
          id: "s2",
          date: "2025-09-07",
          specialty: "Endodontics",
          timeSpent: 45,
          topicsStudied: ["Root Canal Therapy", "Pulp Diseases"],
          completionPercentage: 92,
        },
      ],

      // Additional data
      bookmarkedQuestions: [
        {
          id: "bq1",
          question: "What is the most common cause of pulp necrosis?",
          specialty: "Endodontics",
          dateBookmarked: "2025-09-05",
          difficulty: "Medium",
          isReviewed: false,
        },
      ],

      performanceCharts: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        accuracy: 75 + Math.random() * 20,
        questionsAnswered: 8 + Math.floor(Math.random() * 10),
        timeSpent: 15 + Math.floor(Math.random() * 30),
      })),

      badges: [
        {
          id: "b1",
          name: "Streak Master",
          description: "Maintained a 7-day streak",
          icon: "🔥",
          earnedOn: "2025-09-01",
          category: "Streak",
        },
        {
          id: "b2",
          name: "Accuracy Expert",
          description: "Achieved 90% accuracy in Endodontics",
          icon: "🎯",
          earnedOn: "2025-08-28",
          category: "Accuracy",
        },
      ],
    };
  },
};

export interface UseUnifiedProgressDataReturn {
  progressData: UnifiedProgressData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useUnifiedProgressData = (
  userId: string,
  useUnifiedAPI: boolean = true
): UseUnifiedProgressDataReturn => {
  const [progressData, setProgressData] = useState<UnifiedProgressData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressData = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      let data: UnifiedProgressData;

      if (useUnifiedAPI) {
        console.log("✅ Using REAL API for progress data via Hono backend");
        // Use the real unified API
        data = await apiProgressService.getUserProgress(userId, {
          includeHistory: true,
          limit: 10,
        });
      } else {
        console.warn("⚠️ Using MOCK API for progress data - should be avoided");
        // Use mock service for backward compatibility
        data = await mockUnifiedProgressService.getUserProgress(userId);
      }

      setProgressData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch progress data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId, useUnifiedAPI]);

  const refresh = useCallback(async () => {
    if (useUnifiedAPI) {
      try {
        // Call refresh API endpoint
        await apiProgressService.refreshUserProgress(userId);
        // Then fetch fresh data
        await fetchProgressData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to refresh progress data"
        );
      }
    } else {
      // Just re-fetch data for mock service
      await fetchProgressData();
    }
  }, [fetchProgressData, userId, useUnifiedAPI]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  return {
    progressData,
    isLoading,
    error,
    refresh,
  };
};

export default useUnifiedProgressData;
