import { useState, useEffect, useCallback } from "react";
import { ProgressData, QuizAttempt } from "@/types/progress";
import { databaseService } from "@/services/database";

// Hook return type interface
interface UseProgressDataReturn {
  progressData: ProgressData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateQuizResult: (quizResult: QuizAttempt) => Promise<void>;
  toggleBookmark: (questionId: string) => Promise<void>;
  exportProgress: (format: "pdf" | "csv") => Promise<Blob>;
}

export function useProgressData(userId: string): UseProgressDataReturn {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user progress from the database service
      const userProgress = await databaseService.getUserProgress(userId);
      const dashboardStats = await databaseService.getDashboardStats(userId);
      const quizAttempts = await databaseService.getQuizAttempts(userId, 10);
      const userStreak = await databaseService.getUserStreak(userId);

      // Transform the data to match the ProgressData interface
      const progressData: ProgressData = {
        userId,
        quizTracking: {
          totalQuizzesAttempted: dashboardStats.completedQuizzes || 0,
          totalQuestionsAnswered: quizAttempts.reduce(
            (total, attempt) => total + attempt.totalQuestions,
            0
          ),
          correctAnswers: quizAttempts.reduce(
            (total, attempt) =>
              total +
              Math.round((attempt.score / 100) * attempt.totalQuestions),
            0
          ),
          incorrectAnswers: quizAttempts.reduce(
            (total, attempt) =>
              total +
              (attempt.totalQuestions -
                Math.round((attempt.score / 100) * attempt.totalQuestions)),
            0
          ),
          accuracyPercentage: dashboardStats.averageScore || 0,
          recentQuizzes: quizAttempts.slice(0, 5).map((attempt) => ({
            id: attempt.id,
            date: attempt.completedAt.toISOString().split("T")[0],
            mode: "Study Mode", // Default mode
            specialty: "General Dentistry", // Could be enhanced with quiz metadata
            questionsAttempted: attempt.totalQuestions,
            correct: Math.round((attempt.score / 100) * attempt.totalQuestions),
            incorrect:
              attempt.totalQuestions -
              Math.round((attempt.score / 100) * attempt.totalQuestions),
            score: `${Math.round(attempt.score)}%`,
            timeSpent: Math.round(attempt.timeSpent / 60), // Convert to minutes
          })),
        },
        streakTracking: {
          currentStreak: userStreak.currentStreak,
          longestStreak: userStreak.longestStreak,
          lastActivityDate: userStreak.lastActivityDate?.toISOString() || null,
          streakHistory: (userStreak.streakData || []).map((day) => ({
            date: day.date.toISOString().split("T")[0],
            active: day.completed,
          })),
        },
        specialtyCoverage: {}, // Will be enhanced when specialty tracking is implemented
        bookmarkedQuestions: [], // Will be loaded separately if needed
        performanceCharts: [], // Will be implemented when chart data is available
        userLeveling: {
          currentLevel: "Beginner" as const, // Will be calculated based on stats
          points: 0, // Will be enhanced
          pointsToNextLevel: dashboardStats.pointsToNextLevel || 100,
          badges: [], // Will be implemented when badges are added
          rank: 1, // Will be calculated
          totalUsers: 1, // Will be fetched
        },
      };

      setProgressData(progressData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch progress data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchProgressData();
    }
  }, [userId, fetchProgressData]);

  const updateQuizResult = async (quizResult: QuizAttempt) => {
    try {
      // Create a quiz attempt record using the database service
      const quizAttempt = await databaseService.createQuizAttempt({
        userId,
        quizId: quizResult.id,
        score: parseInt(quizResult.score.replace("%", "")),
        totalQuestions: quizResult.questionsAttempted,
        timeSpent: quizResult.timeSpent * 60, // Convert to seconds
        answers: [], // Would be populated with actual answer data
      });
      // Refetch data to update the UI
      await fetchProgressData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update quiz result"
      );
    }
  };

  const toggleBookmark = async (questionId: string) => {
    try {
      // Toggle bookmark using the database service
      await databaseService.addBookmark("question", questionId);
      // Optimistically update the UI
      if (progressData) {
        const updatedBookmarks = progressData.bookmarkedQuestions.map((q) =>
          q.id === questionId ? { ...q, isReviewed: !q.isReviewed } : q
        );
        setProgressData({
          ...progressData,
          bookmarkedQuestions: updatedBookmarks,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle bookmark"
      );
    }
  };

  const exportProgress = async (format: "pdf" | "csv"): Promise<Blob> => {
    try {
      // For now, create a simple export since the backend doesn't have export functionality
      const data = progressData
        ? JSON.stringify(progressData, null, 2)
        : "No data available";

      if (format === "csv") {
        // Convert to CSV format
        const csvData = `User ID,Total Quizzes,Total Questions,Accuracy,Current Streak\n${userId},${
          progressData?.quizTracking.totalQuizzesAttempted || 0
        },${progressData?.quizTracking.totalQuestionsAnswered || 0},${
          progressData?.quizTracking.accuracyPercentage || 0
        }%,${progressData?.streakTracking.currentStreak || 0}`;
        return new Blob([csvData], { type: "text/csv" });
      } else {
        // Return as JSON for PDF processing
        return new Blob([data], { type: "application/json" });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to export progress"
      );
      throw err;
    }
  };

  return {
    progressData,
    isLoading,
    error,
    refetch: fetchProgressData,
    updateQuizResult,
    toggleBookmark,
    exportProgress,
  };
}
