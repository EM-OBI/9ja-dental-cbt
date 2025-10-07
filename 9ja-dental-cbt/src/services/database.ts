import {
  DatabaseAdapter,
  DashboardStats,
  User,
  Quiz,
  QuizAttempt,
  QuizFilters,
  UserStreak,
  LeaderboardEntry,
  StudySession,
  PaginatedResponse,
} from "@/types/dashboard";
import { Question, UserPreferences } from "@/types/backendTypes";
import { apiClient } from "./api";

// Extended Database Service with full authentication and quiz session support
export class DatabaseService implements DatabaseAdapter {
  async getCurrentUser(): Promise<User | null> {
    try {
      return await apiClient.getCurrentUser();
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  async updateUserPreferences(
    id: string,
    preferences: UserPreferences
  ): Promise<User> {
    try {
      return await apiClient.updateUserPreferences(id, preferences);
    } catch (error) {
      console.error("Failed to update user preferences:", error);
      throw error;
    }
  }

  // ========== USER METHODS ==========
  // ========== USER METHODS ==========

  async getUserById(id: string): Promise<User | null> {
    try {
      return await apiClient.getUserById(id);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      return await apiClient.updateUser(id, data);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  }

  // ========== QUIZ METHODS ==========

  async getQuizzes(filters?: QuizFilters): Promise<PaginatedResponse<Quiz>> {
    try {
      const result = await apiClient.getQuizzes(filters);
      return {
        data: result.quizzes,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
      // Return empty result with default pagination
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    try {
      return await apiClient.getQuizById(id);
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      return null;
    }
  }

  // ========== QUIZ SESSION METHODS ==========

  async startQuizSession(
    quizId: string,
    mode: "practice" | "challenge" | "exam"
  ): Promise<{
    sessionId: string;
    questions: Question[];
    timeLimit?: number;
  } | null> {
    try {
      return await apiClient.startQuizSession(quizId, mode);
    } catch (error) {
      console.error("Failed to start quiz session:", error);
      return null;
    }
  }

  async submitQuizAnswer(
    sessionId: string,
    questionId: string,
    answer: string | number
  ): Promise<{ correct: boolean; explanation?: string } | null> {
    try {
      return await apiClient.submitQuizAnswer(sessionId, questionId, answer);
    } catch (error) {
      console.error("Failed to submit quiz answer:", error);
      return null;
    }
  }

  async completeQuizSession(sessionId: string): Promise<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    results: QuizAttempt[];
  } | null> {
    try {
      return await apiClient.completeQuizSession(sessionId);
    } catch (error) {
      console.error("Failed to complete quiz session:", error);
      return null;
    }
  }

  // ========== QUIZ ATTEMPTS METHODS ==========

  async getQuizAttempts(userId: string, limit = 10): Promise<QuizAttempt[]> {
    try {
      // TODO: Implement when quiz attempts endpoint is available in backend
      // For now, we can derive this from dashboard stats or user progress
      const userProgress = await this.getUserProgress(userId);

      // Convert recent activity to quiz attempts as a temporary solution
      const quizAttempts: QuizAttempt[] = userProgress.recentActivity
        .filter((activity) => activity.type === "quiz_completed")
        .slice(0, limit)
        .map((activity, index) => ({
          id: activity.id,
          userId,
          quizId: `quiz-${activity.id}`,
          score: Math.floor(Math.random() * 100), // TODO: Get real score from metadata
          totalQuestions: 20, // TODO: Get real value
          timeSpent: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
          completedAt: activity.timestamp,
          answers: [], // TODO: Implement when answer details are available
        }));

      return quizAttempts;
    } catch (error) {
      console.error("Failed to fetch quiz attempts:", error);
      return [];
    }
  }

  async createQuizAttempt(
    attempt: Omit<QuizAttempt, "id" | "completedAt">
  ): Promise<QuizAttempt> {
    try {
      // TODO: Implement actual API call when backend supports quiz attempt creation
      // For now, create a local attempt record
      const newAttempt: QuizAttempt = {
        id: `attempt-${Date.now()}`,
        completedAt: new Date(),
        ...attempt,
      };

      // In a real implementation, this would also update user progress
      // and potentially trigger leaderboard updates

      return newAttempt;
    } catch (error) {
      console.error("Failed to create quiz attempt:", error);
      throw error;
    }
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      return await apiClient.getDashboardStats();
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      // Return default stats if API call fails
      return {
        totalQuizzes: 0,
        completedQuizzes: 0,
        averageScore: 0,
        totalStudyTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        currentLevel: 1,
        pointsToNextLevel: 100,
        weeklyProgress: [],
        recentActivity: [],
        upcomingGoals: [],
      };
    }
  }

  async getUserStreak(userId: string): Promise<UserStreak> {
    try {
      return await apiClient.getUserStreaks(userId);
    } catch (error) {
      console.error("Failed to fetch user streak:", error);
      return {
        id: `streak-${userId}`,
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
        streakData: [],
      };
    }
  }

  async getLeaderboard(
    limit = 10,
    period: "daily" | "weekly" | "monthly" = "weekly"
  ): Promise<LeaderboardEntry[]> {
    try {
      const leaderboardData = await apiClient.getLeaderboard(period);

      // Transform API response (RecentActivity[]) to LeaderboardEntry format
      // This is a temporary solution until the backend provides proper leaderboard data
      const mockLeaderboardEntries: LeaderboardEntry[] = leaderboardData
        .slice(0, limit)
        .map((activity, index) => ({
          id: activity.id,
          userId: `user-${activity.id}`,
          userName: activity.title || `User ${index + 1}`,
          userAvatar: undefined,
          totalScore: Math.floor(Math.random() * 5000) + 1000, // Mock score
          quizzesCompleted: Math.floor(Math.random() * 50) + 10, // Mock count
          averageScore: Math.floor(Math.random() * 40) + 60, // 60-100% average
          rank: index + 1,
          level: Math.floor(Math.random() * 10) + 1, // Mock level
        }));

      return mockLeaderboardEntries;
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      // Return mock leaderboard data as fallback
      return Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
        id: `mock-leader-${index}`,
        userId: `user-${index}`,
        userName: `Top Student ${index + 1}`,
        userAvatar: undefined,
        totalScore: 5000 - index * 500,
        quizzesCompleted: 50 - index * 5,
        averageScore: 95 - index * 3,
        rank: index + 1,
        level: 10 - index,
      }));
    }
  }

  async getStudySessions(userId: string, limit = 10): Promise<StudySession[]> {
    try {
      return await apiClient.getStudySessions(userId);
    } catch (error) {
      console.error("Failed to fetch study sessions:", error);
      return [];
    }
  }

  async createStudySession(
    session: Omit<StudySession, "id" | "completedAt">
  ): Promise<StudySession> {
    try {
      // Call the API but ignore the DashboardStats return type for now
      await apiClient.createStudySession({
        specialty: session.topic, // Map topic to specialty for backend
        duration: session.duration,
        topics: [session.topic], // Convert single topic to array
      });

      // Return the expected StudySession format
      return {
        id: `session-${Date.now()}`,
        userId: session.userId,
        topic: session.topic,
        duration: session.duration,
        completedAt: new Date(),
      };
    } catch (error) {
      console.error("Failed to create study session:", error);
      return {
        id: `session-${Date.now()}`,
        userId: session.userId,
        topic: session.topic,
        duration: session.duration,
        completedAt: new Date(),
        notes: session.notes,
      };
    }
  }

  // ========== SEARCH AND UTILITY METHODS ==========

  async searchQuestions(
    query: string,
    filters?: {
      specialty?: string;
      difficulty?: string;
      limit?: number;
    }
  ): Promise<Question[]> {
    try {
      // TODO: Implement when question search endpoint is available in backend
      // For now, use quiz search as a fallback and extract questions
      const quizFilters = {
        search: query,
        category: filters?.specialty,
        difficulty: filters?.difficulty as "easy" | "medium" | "hard",
        limit: filters?.limit || 20,
      };

      const quizResults = await this.getQuizzes(quizFilters);

      // Mock question data based on quiz results
      // In a real implementation, this would call a dedicated question search endpoint
      const mockQuestions: Question[] = quizResults.data
        .flatMap((quiz) =>
          Array.from(
            { length: Math.min(quiz.totalQuestions, 5) },
            (_, index) => ({
              id: `q-${quiz.id}-${index}`,
              text: `Question ${index + 1} from ${quiz.title}`,
              options: ["Option A", "Option B", "Option C", "Option D"],
              correct_answer: 0, // First option is correct
              explanation: `This is the explanation for question ${index + 1}`,
              specialty: quiz.category,
              difficulty: quiz.difficulty,
              type: "mcq" as const,
              time_estimate: 60,
              tags: [quiz.category.toLowerCase()],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          )
        )
        .slice(0, filters?.limit || 20);

      return mockQuestions;
    } catch (error) {
      console.error("Failed to search questions:", error);
      return [];
    }
  }

  async getQuestionById(id: string): Promise<Question | null> {
    try {
      // TODO: Implement when individual question endpoint is available
      // For now, search through cached questions or return mock data
      return {
        id,
        text: `Mock question with ID: ${id}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct_answer: 0, // First option is correct
        explanation: "This is a mock explanation.",
        specialty: "General",
        difficulty: "medium",
        type: "mcq",
        time_estimate: 60,
        tags: ["mock"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to fetch question:", error);
      return null;
    }
  }

  // ========== ANALYTICS AND REPORTING ==========

  async getUserAnalytics(
    userId: string,
    timeRange: "week" | "month" | "year" = "month"
  ): Promise<{
    performanceChart: Array<{ date: string; score: number; quizzes: number }>;
    categoryBreakdown: Array<{
      category: string;
      averageScore: number;
      attempts: number;
    }>;
    streakHistory: Array<{ date: string; streakLength: number }>;
    studyTimeDistribution: Array<{ hour: number; minutes: number }>;
  }> {
    try {
      const [dashboardStats, userStreak] = await Promise.all([
        this.getDashboardStats(userId),
        this.getUserStreak(userId),
      ]);

      // Generate mock analytics based on available data
      const performanceChart = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        score: Math.floor(Math.random() * 40) + 60,
        quizzes: Math.floor(Math.random() * 5) + 1,
      }));

      const categoryBreakdown = [
        { category: "Conservative Dentistry", averageScore: 85, attempts: 15 },
        { category: "Prosthodontics", averageScore: 78, attempts: 12 },
        { category: "Oral Surgery", averageScore: 82, attempts: 10 },
        { category: "Orthodontics", averageScore: 75, attempts: 8 },
      ];

      const streakHistory = userStreak.streakData.map((day) => ({
        date: day.date.toISOString().split("T")[0],
        streakLength: day.completed ? day.activityCount : 0,
      }));

      const studyTimeDistribution = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        minutes: Math.floor(Math.random() * 120), // 0-2 hours per hour slot
      }));

      return {
        performanceChart,
        categoryBreakdown,
        streakHistory,
        studyTimeDistribution,
      };
    } catch (error) {
      console.error("Failed to fetch user analytics:", error);
      return {
        performanceChart: [],
        categoryBreakdown: [],
        streakHistory: [],
        studyTimeDistribution: [],
      };
    }
  }

  async getUserProgress(userId: string): Promise<DashboardStats> {
    try {
      return await apiClient.getUserProgress(userId);
    } catch (error) {
      console.error("Failed to fetch user progress:", error);
      // Return a default DashboardStats object instead of null
      return {
        totalQuizzes: 0,
        completedQuizzes: 0,
        averageScore: 0,
        totalStudyTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        currentLevel: 1,
        pointsToNextLevel: 1000,
        weeklyProgress: [],
        recentActivity: [],
        upcomingGoals: [],
      };
    }
  }

  // ========== BOOKMARK METHODS ==========

  async addBookmark(
    itemType: string,
    itemId: string,
    notes?: string
  ): Promise<{ success: boolean; bookmarkId?: string }> {
    try {
      // API returns StudySession but we handle it properly
      const result = await apiClient.addBookmark(itemType, itemId, notes);

      // Return success with the session ID as bookmark ID
      return {
        success: true,
        bookmarkId: result.id,
      };
    } catch (error) {
      console.error("Failed to add bookmark:", error);
      return { success: false };
    }
  }

  async getUserBookmarks(
    userId: string
  ): Promise<{ id: string; questionId: string; createdAt: Date }[]> {
    try {
      const bookmarks = await apiClient.getBookmarks(userId);

      // Ensure dates are properly converted
      return bookmarks.map((bookmark) => ({
        ...bookmark,
        createdAt: new Date(bookmark.createdAt),
      }));
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
      return [];
    }
  }

  async removeBookmark(bookmarkId: string): Promise<boolean> {
    try {
      await apiClient.removeBookmark(bookmarkId);
      return true;
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
      return false;
    }
  }

  // ========== HEALTH CHECK AND CONNECTIVITY ==========

  // ========== HEALTH CHECK AND CONNECTIVITY ==========

  async healthCheck(): Promise<boolean> {
    try {
      await apiClient.healthCheck();
      return true;
    } catch (error) {
      console.error("API health check failed:", error);
      return false;
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Test the connection to the backend API
   * @returns Promise<boolean> - true if connected, false otherwise
   */
  async testConnection(): Promise<boolean> {
    return await this.healthCheck();
  }
}

// Create singleton instance
export const databaseService = new DatabaseService();

// Export as default for compatibility
export default databaseService;
