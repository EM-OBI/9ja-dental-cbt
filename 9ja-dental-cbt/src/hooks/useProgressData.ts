import { useState, useEffect, useCallback } from "react";
import { ProgressData, QuizAttempt } from "@/types/progress";

// Mock API service - replace with real API calls
const mockProgressService = {
  async getUserProgress(userId: string): Promise<ProgressData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      userId,
      quizTracking: {
        totalQuizzesAttempted: 45,
        totalQuestionsAnswered: 450,
        correctAnswers: 383,
        incorrectAnswers: 67,
        accuracyPercentage: 85.1,
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
        ],
      },
      streakTracking: {
        currentStreak: 5,
        longestStreak: 12,
        lastActivityDate: "2025-09-08",
        streakHistory: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          active: Math.random() > 0.3,
        })),
      },
      specialtyCoverage: {
        "Oral Pathology": {
          questionsAttempted: 150,
          accuracy: "82%",
          mastery: "Advanced",
          lastAttempted: "2025-09-08",
        },
        Endodontics: {
          questionsAttempted: 120,
          accuracy: "78%",
          mastery: "Intermediate",
          lastAttempted: "2025-09-07",
        },
      },
      bookmarkedQuestions: [
        {
          id: "Q123",
          question:
            "Which lesion is considered premalignant in the oral cavity?",
          specialty: "Oral Pathology",
          dateBookmarked: "2025-09-08",
          difficulty: "Medium",
          isReviewed: false,
        },
      ],
      performanceCharts: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        accuracy: 70 + Math.random() * 20,
        questionsAnswered: 5 + Math.floor(Math.random() * 15),
        timeSpent: 10 + Math.floor(Math.random() * 30),
      })),
      userLeveling: {
        currentLevel: "Advanced",
        points: 2450,
        pointsToNextLevel: 550,
        rank: 127,
        totalUsers: 5420,
        badges: [
          {
            id: "b1",
            name: "First Quiz Completed",
            description: "Complete your first quiz",
            icon: "🎯",
            earnedOn: "2025-08-15",
            category: "Achievement",
          },
        ],
      },
    };
  },

  async updateQuizResult(
    userId: string,
    quizResult: QuizAttempt
  ): Promise<void> {
    // Update quiz tracking data
    console.log("Updating quiz result for user:", userId, quizResult);
  },

  async toggleBookmark(userId: string, questionId: string): Promise<void> {
    // Toggle bookmark status
    console.log("Toggling bookmark for user:", userId, "question:", questionId);
  },

  async exportProgress(userId: string, format: "pdf" | "csv"): Promise<Blob> {
    // Export progress data
    const data = await this.getUserProgress(userId);
    const content =
      format === "csv"
        ? "CSV data would be generated here"
        : "PDF data would be generated here";

    return new Blob([content], {
      type: format === "csv" ? "text/csv" : "application/pdf",
    });
  },
};

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
      const data = await mockProgressService.getUserProgress(userId);
      setProgressData(data);
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
      await mockProgressService.updateQuizResult(userId, quizResult);
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
      await mockProgressService.toggleBookmark(userId, questionId);
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
      return await mockProgressService.exportProgress(userId, format);
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
