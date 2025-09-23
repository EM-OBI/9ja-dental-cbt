// API Client for Hono Backend
import { User, Quiz, QuizAttempt, DashboardStats } from "@/types/dashboard";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://dental-cbt-backend-staging.aokhitoya.workers.dev";
  }

  setAuthToken(token: string) {
    this.authToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-token", token);
    }
  }

  getAuthToken(): string | null {
    if (this.authToken) return this.authToken;
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth-token");
    }
    return null;
  }

  clearAuthToken() {
    this.authToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };

        try {
          const errorData = await response.json();
          error.message = errorData.error || errorData.message || error.message;
          error.code = errorData.code;
        } catch {
          // Use default error message if JSON parsing fails
        }

        throw error;
      }

      const data: ApiResponse<T> = await response.json();

      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // Authentication endpoints
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    subscription?: string;
  }): Promise<{ user: User; token: string }> {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    await this.request("/api/auth/logout", { method: "POST" });
    this.clearAuthToken();
  }

  async getCurrentUser(): Promise<User> {
    return this.request("/api/auth/me");
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.request("/api/auth/refresh", { method: "POST" });
  }

  // User endpoints
  async getUserById(id: string): Promise<User> {
    return this.request(`/api/users/${id}`);
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return this.request(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateUserPreferences(id: string, preferences: any): Promise<User> {
    return this.request(`/api/users/${id}/preferences`, {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  }

  // Quiz endpoints
  async getQuizzes(filters?: {
    specialty?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }): Promise<{ quizzes: Quiz[]; total: number; page: number; limit: number }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
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
    questions: any[];
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
    answer: any
  ): Promise<{
    correct: boolean;
    explanation?: string;
  }> {
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
    results: any[];
  }> {
    return this.request(`/api/quiz-sessions/${sessionId}/complete`, {
      method: "POST",
    });
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request("/api/dashboard/stats");
  }

  async getUserProgress(userId: string): Promise<any> {
    return this.request(`/api/users/${userId}/progress`);
  }

  async getLeaderboard(
    period: "daily" | "weekly" | "monthly" = "weekly"
  ): Promise<any[]> {
    return this.request(`/api/leaderboard?period=${period}`);
  }

  async getUserStreaks(userId: string): Promise<any> {
    return this.request(`/api/users/${userId}/streaks`);
  }

  // Study sessions
  async createStudySession(data: {
    specialty: string;
    duration: number;
    topics: string[];
  }): Promise<any> {
    return this.request("/api/study-sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getStudySessions(userId: string): Promise<any[]> {
    return this.request(`/api/users/${userId}/study-sessions`);
  }

  // Bookmarks
  async addBookmark(
    itemType: string,
    itemId: string,
    notes?: string
  ): Promise<any> {
    return this.request("/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ itemType, itemId, notes }),
    });
  }

  async getBookmarks(userId: string): Promise<any[]> {
    return this.request(`/api/users/${userId}/bookmarks`);
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    return this.request(`/api/bookmarks/${bookmarkId}`, {
      method: "DELETE",
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request("/api/health");
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
