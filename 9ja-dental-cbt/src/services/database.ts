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
import { Question } from "@/types/backendTypes";
import { apiClient } from "./api";

// Real Database Service using the Hono backend API
export class DatabaseService implements DatabaseAdapter {
  async getUserById(id: string): Promise<User | null> {
    try {
      return await apiClient.getUserById(id);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await apiClient.updateUser(id, data);
  }

  async getQuizzes(filters?: QuizFilters): Promise<PaginatedResponse<Quiz>> {
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
  }

  async getQuizAttempts(userId: string, limit = 10): Promise<QuizAttempt[]> {
    try {
      // This would be implemented when quiz attempts are added to the backend
      // For now, return empty array or call a backend endpoint when available
      return [];
    } catch (error) {
      console.error("Failed to fetch quiz attempts:", error);
      return [];
    }
  }

  async createQuizAttempt(
    attempt: Omit<QuizAttempt, "id" | "completedAt">
  ): Promise<QuizAttempt> {
    try {
      // This would call the backend to create a quiz attempt
      // For now, return a mock implementation
      return {
        id: `attempt-${Date.now()}`,
        completedAt: new Date(),
        ...attempt,
      };
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

  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    try {
      // For now, return empty array since the API doesn't have proper leaderboard data structure
      // TODO: Implement proper leaderboard API endpoint that returns LeaderboardEntry[]
      return [];
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      return [];
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

  // Additional methods for backend integration
  async searchQuestions(
    query: string,
    filters?: {
      specialty?: string;
      difficulty?: string;
      limit?: number;
    }
  ): Promise<Question[]> {
    try {
      // This would be implemented when question search is added to backend
      return [];
    } catch (error) {
      console.error("Failed to search questions:", error);
      return [];
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

  async addBookmark(
    itemType: string,
    itemId: string,
    notes?: string
  ): Promise<DashboardStats | null> {
    try {
      // API returns StudySession but we need DashboardStats
      // For now, just call the API and return null
      await apiClient.addBookmark(itemType, itemId, notes);
      return null;
    } catch (error) {
      console.error("Failed to add bookmark:", error);
      throw error;
    }
  }

  async getUserBookmarks(
    userId: string
  ): Promise<{ id: string; questionId: string; createdAt: Date }[]> {
    try {
      return await apiClient.getBookmarks(userId);
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
      return [];
    }
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    try {
      await apiClient.removeBookmark(bookmarkId);
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
      throw error;
    }
  }

  // Health check for API connectivity
  async healthCheck(): Promise<boolean> {
    try {
      await apiClient.healthCheck();
      return true;
    } catch (error) {
      console.error("API health check failed:", error);
      return false;
    }
  }
}

// Create singleton instance
export const databaseService = new DatabaseService();

// Export as default for compatibility
export default databaseService;
