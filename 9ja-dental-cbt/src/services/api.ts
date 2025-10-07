// API Client for Hono Backend
import {
  User,
  Quiz,
  DashboardStats,
  QuizAttempt,
  StudySession,
  UserStreak,
  RecentActivity,
} from "@/types/dashboard";
import { UserPreferences, Question } from "@/types/backendTypes";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface ApiError extends Error {
  status: number;
  code?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // If NEXT_PUBLIC_API_URL is empty/undefined, use empty string for same-origin requests
    // This allows Next.js API routes to work in development
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    this.baseUrl = apiUrl && apiUrl.trim() !== "" ? apiUrl : "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // For same-origin requests, endpoint should start with /
    const url = this.baseUrl
      ? `${this.baseUrl}${endpoint}`
      : endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: "include", // Include cookies for session authentication
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    // Handle network errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorCode: string | undefined;

      try {
        const errorData = (await response.json()) as {
          error?: string;
          message?: string;
          code?: string;
        };
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorCode = errorData.code;
      } catch {
        // fallback to default message
      }

      const error: ApiError = Object.assign(new Error(errorMessage), {
        status: response.status,
        code: errorCode,
      });

      throw error;
    }

    const data = (await response.json()) as ApiResponse<T>;
    if (!data.success) {
      throw new Error(data.error || "API request failed");
    }

    return data.data;
  }

  // ===============================
  // 🔐 Auth Endpoints
  // ===============================
  // Note: Authentication is handled by Better Auth via cookies
  // These endpoints are maintained for compatibility but may not be used

  async getCurrentUser(): Promise<User> {
    return this.request("/api/auth/me");
  }

  // ===============================
  // 👤 User Endpoints
  // ===============================
  async getUserById(id: string): Promise<User> {
    return this.request(`/api/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.request(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateUserPreferences(
    id: string,
    preferences: UserPreferences
  ): Promise<User> {
    return this.request(`/api/users/${id}/preferences`, {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  }

  // ===============================
  // 🧠 Quiz Endpoints
  // ===============================
  async getQuizzes(filters?: {
    specialty?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }): Promise<{ quizzes: Quiz[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined) queryParams.append(key, String(value));
      }
    }
    const endpoint = `/api/quizzes${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    return this.request(endpoint);
  }

  async getQuizById(id: string): Promise<Quiz> {
    return this.request(`/api/quizzes/${id}`);
  }

  async startQuizSession(
    quizId: string,
    mode: "practice" | "challenge" | "exam"
  ): Promise<{
    sessionId: string;
    questions: Question[];
    timeLimit?: number;
  }> {
    return this.request("/api/quiz-sessions", {
      method: "POST",
      body: JSON.stringify({ quizId, mode }),
    });
  }

  async submitQuizAnswer(
    sessionId: string,
    questionId: string,
    answer: string | number
  ): Promise<{ correct: boolean; explanation?: string }> {
    return this.request(`/api/quiz-sessions/${sessionId}/answers`, {
      method: "POST",
      body: JSON.stringify({ questionId, answer }),
    });
  }

  async completeQuizSession(sessionId: string): Promise<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    results: QuizAttempt[];
  }> {
    return this.request(`/api/quiz-sessions/${sessionId}/complete`, {
      method: "POST",
    });
  }

  // ===============================
  // 📊 Dashboard
  // ===============================
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request("/api/dashboard/stats");
  }

  async getUserProgress(userId: string): Promise<DashboardStats> {
    return this.request(`/api/users/${userId}/progress`);
  }

  async getLeaderboard(
    period: "daily" | "weekly" | "monthly" = "weekly"
  ): Promise<RecentActivity[]> {
    return this.request(`/api/leaderboard?period=${period}`);
  }

  async getUserStreaks(userId: string): Promise<UserStreak> {
    return this.request(`/api/users/${userId}/streaks`);
  }

  // ===============================
  // 🎯 Study Sessions
  // ===============================
  async createStudySession(data: {
    specialty: string;
    duration: number;
    topics: string[];
  }): Promise<DashboardStats> {
    return this.request("/api/study-sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getStudySessions(userId: string): Promise<StudySession[]> {
    return this.request(`/api/users/${userId}/study-sessions`);
  }

  // ===============================
  // 🔖 Bookmarks
  // ===============================
  async addBookmark(
    itemType: string,
    itemId: string,
    notes?: string
  ): Promise<StudySession> {
    return this.request("/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ itemType, itemId, notes }),
    });
  }

  async getBookmarks(
    userId: string
  ): Promise<{ id: string; questionId: string; createdAt: string }[]> {
    return this.request(`/api/users/${userId}/bookmarks`);
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    return this.request(`/api/bookmarks/${bookmarkId}`, {
      method: "DELETE",
    });
  }

  // ===============================
  // 🩺 Health Check
  // ===============================
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request("/api/health");
  }
}

// ✅ Singleton instance
export const apiClient = new ApiClient();
export default apiClient;
