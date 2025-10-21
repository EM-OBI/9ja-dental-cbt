import {
  DashboardStats,
  LeaderboardEntry,
  Quiz,
  QuizFilters,
  User,
  UserStreak,
  PaginatedResponse,
  WeeklyProgress,
  RecentActivity,
  Goal,
} from "@/types/dashboard";

import type { UserPreferences } from "@/store/types";

const jsonFetch = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> => {
  const response = await fetch(input, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as {
        error?: string;
        message?: string;
      };
      message = body.error ?? body.message ?? message;
    } catch {
      // ignore JSON parse errors and fall back to default message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
};

type ApiSuccess<T> = { success: true; data: T };

const parseISODate = (value: string | null | undefined): Date => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const ensureNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapUser = (user: Partial<User>): User => ({
  id: user.id ?? "",
  email: user.email ?? "",
  name: user.name ?? "",
  avatar: user.avatar ?? undefined,
  createdAt: parseISODate(
    typeof user.createdAt === "string"
      ? user.createdAt
      : user.createdAt?.toISOString()
  ),
  updatedAt: parseISODate(
    typeof user.updatedAt === "string"
      ? user.updatedAt
      : user.updatedAt?.toISOString()
  ),
});

const mapQuiz = (
  quiz: Partial<Quiz> & {
    specialty?: string | null;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    timeLimit?: number | string | null;
  }
): Quiz => ({
  id: quiz.id ?? "",
  title: quiz.title ?? "Untitled Quiz",
  description: quiz.description ?? undefined,
  totalQuestions: ensureNumber(quiz.totalQuestions, 0),
  timeLimit:
    quiz.timeLimit === null || quiz.timeLimit === undefined
      ? undefined
      : ensureNumber(quiz.timeLimit),
  difficulty: (quiz.difficulty ?? "medium") as Quiz["difficulty"],
  category: quiz.category ?? quiz.specialty ?? "General",
  createdAt: parseISODate(
    typeof quiz.createdAt === "string"
      ? quiz.createdAt
      : quiz.createdAt?.toISOString()
  ),
  updatedAt: parseISODate(
    typeof quiz.updatedAt === "string"
      ? quiz.updatedAt
      : quiz.updatedAt?.toISOString()
  ),
});

const mapLeaderboardEntry = (
  entry: Partial<LeaderboardEntry> & {
    userAvatar?: string | null;
    totalScore?: number | string | null;
    averageScore?: number | string | null;
    quizzesCompleted?: number | string | null;
    level?: number | string | null;
    rank?: number | string | null;
    totalXp?: number | string | null;
  }
): LeaderboardEntry => {
  const id = entry.id ?? entry.userId ?? `leaderboard-${Date.now()}`;
  const rank = Math.max(1, ensureNumber(entry.rank, 1));

  return {
    id,
    userId: entry.userId ?? id,
    userName: entry.userName ?? "Anonymous",
    userAvatar: entry.userAvatar ?? undefined,
    totalScore: ensureNumber(entry.totalScore),
    quizzesCompleted: ensureNumber(entry.quizzesCompleted),
    averageScore: ensureNumber(entry.averageScore),
    rank,
    level: Math.max(1, ensureNumber(entry.level, 1)),
    totalXp:
      entry.totalXp === null || entry.totalXp === undefined
        ? undefined
        : ensureNumber(entry.totalXp),
  } satisfies LeaderboardEntry;
};

const mapWeeklyProgress = (
  items: Array<{
    day?: string;
    score?: number;
    time?: number;
    quizzesCompleted?: number;
    quizzes?: number;
  }> = []
): WeeklyProgress[] => {
  const today = new Date();
  return items.map((item, index) => {
    const progressDate = new Date(today);
    progressDate.setDate(today.getDate() - (items.length - 1 - index));
    return {
      date: progressDate,
      quizzesTaken: ensureNumber(item.quizzesCompleted ?? item.quizzes ?? 0),
      studyMinutes: ensureNumber(item.time),
      averageScore: ensureNumber(item.score),
    } satisfies WeeklyProgress;
  });
};

const mapRecentActivity = (
  items: Array<{
    id?: string;
    title?: string;
    description?: string;
    timestamp?: string | Date;
    type?: string;
    metadata?: Record<string, unknown>;
  }> = []
): RecentActivity[] =>
  items.map((item, index) => ({
    id: item.id ?? `activity-${index}`,
    type:
      (item.type as RecentActivity["type"]) ??
      (item.description?.toLowerCase().includes("quiz")
        ? "quiz_completed"
        : "study_session"),
    title: item.title ?? "Activity",
    description: item.description ?? "",
    timestamp: parseISODate(
      typeof item.timestamp === "string"
        ? item.timestamp
        : item.timestamp?.toISOString()
    ),
    metadata: item.metadata ?? {},
  }));

const mapGoals = (
  items: Array<{
    id?: string;
    title?: string;
    description?: string;
    progress?: number;
    target?: number;
    deadline?: string | Date;
  }> = []
): Goal[] =>
  items.map((item, index) => ({
    id: item.id ?? `goal-${index}`,
    title: item.title ?? "Goal",
    description: item.description ?? "",
    targetValue: ensureNumber(item.target, 0),
    currentValue: ensureNumber(item.progress, 0),
    unit: "points",
    deadline: parseISODate(
      typeof item.deadline === "string"
        ? item.deadline
        : item.deadline?.toISOString()
    ),
    isCompleted: ensureNumber(item.progress, 0) >= ensureNumber(item.target, 0),
  }));

const unwrap = <T>(payload: ApiSuccess<T>): T => payload.data;

export class DatabaseService {
  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await jsonFetch<ApiSuccess<User>>(`/api/users/${id}`);
      return mapUser(unwrap(response));
    } catch (error) {
      console.error("Failed to fetch user:", error);
      return null;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await jsonFetch<ApiSuccess<User>>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return mapUser(unwrap(response));
  }

  async updateUserPreferences(
    id: string,
    preferences: UserPreferences
  ): Promise<UserPreferences> {
    const response = await jsonFetch<ApiSuccess<UserPreferences>>(
      `/api/users/${id}/preferences`,
      {
        method: "PUT",
        body: JSON.stringify(preferences),
      }
    );

    return unwrap(response);
  }

  async getQuizzes(filters?: QuizFilters): Promise<PaginatedResponse<Quiz>> {
    const query = new URLSearchParams();
    if (filters) {
      const specialty = filters.specialty ?? filters.category;
      if (specialty) query.set("specialty", specialty);
      if (filters.difficulty) query.set("difficulty", filters.difficulty);
      if (filters.limit) query.set("limit", String(filters.limit));
      if (filters.offset) query.set("offset", String(filters.offset));
      if (filters.page) query.set("page", String(filters.page));
      if (filters.search) query.set("search", filters.search);
    }

    const response = await jsonFetch<
      ApiSuccess<{
        quizzes: Array<
          Quiz & {
            specialty?: string | null;
            createdAt?: string | Date;
            updatedAt?: string | Date;
            timeLimit?: number | string | null;
          }
        >;
        total: number;
        page: number;
        limit: number;
      }>
    >(`/api/quizzes${query.size ? `?${query.toString()}` : ""}`);

    const data = unwrap(response);
    return {
      data: data.quizzes.map(mapQuiz),
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.limit > 0 ? Math.ceil(data.total / data.limit) : 0,
      },
    };
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    void userId;
    if (userId === "platform") {
      const response = await jsonFetch<
        ApiSuccess<{
          users: { total: number; active: number };
          quizzes: { total: number; averageScore: number };
          studySessions: { total: number; totalMinutes: number };
          content: { questions: number; specialties: number };
        }>
      >("/api/dashboard/stats");

      const data = unwrap(response);
      const now = new Date();
      return {
        totalQuizzes: ensureNumber(data.quizzes.total),
        completedQuizzes: ensureNumber(data.quizzes.total),
        averageScore: ensureNumber(data.quizzes.averageScore),
        totalStudyTime: ensureNumber(data.studySessions.totalMinutes),
        currentStreak: 0,
        longestStreak: 0,
        currentLevel: 1,
        pointsToNextLevel: 100,
        weeklyProgress: [],
        recentActivity: [
          {
            id: "platform-summary",
            type: "achievement_unlocked",
            title: "Platform Stats",
            description: `${data.users.total} learners • ${data.content.questions} questions`,
            timestamp: now,
            metadata: {},
          },
        ],
        upcomingGoals: [],
      } satisfies DashboardStats;
    }

    return await this.getUserProgress(userId);
  }

  async getUserStreak(userId: string): Promise<UserStreak> {
    const response = await jsonFetch<
      ApiSuccess<{
        currentStreak: number;
        longestStreak: number;
        lastActivityDate: string | null;
        streakCalendar?: Array<{
          date: string;
          active: boolean;
          activityCount: number;
          activityTypes: string[];
        }>;
      }>
    >(`/api/users/${userId}/streaks`);

    const data = unwrap(response);
    const streakHistory = (data.streakCalendar ?? []).map((entry) => ({
      date: parseISODate(entry.date),
      completed: entry.active,
      activityCount: entry.activityCount,
      activityTypes:
        entry.activityTypes as UserStreak["streakData"][number]["activityTypes"],
    }));

    return {
      id: `streak-${userId}`,
      userId,
      currentStreak: ensureNumber(data.currentStreak),
      longestStreak: ensureNumber(data.longestStreak),
      lastActivityDate: parseISODate(data.lastActivityDate),
      streakData: streakHistory,
    };
  }

  async getLeaderboard(
    limit = 10,
    period: "daily" | "weekly" | "monthly" | "all-time" = "weekly"
  ): Promise<LeaderboardEntry[]> {
    const response = await jsonFetch<
      ApiSuccess<{
        entries: Array<
          LeaderboardEntry & {
            rank?: number;
          }
        >;
      }>
    >(`/api/leaderboard?period=${period}`);

    return unwrap(response)
      .entries.slice(0, limit)
      .map((entry, index) =>
        mapLeaderboardEntry({
          ...entry,
          id: entry.id ?? entry.userId ?? `leaderboard-${index}`,
          rank: entry.rank ?? index + 1,
        })
      );
  }

  async getUserProgress(userId: string): Promise<DashboardStats> {
    const response = await jsonFetch<
      ApiSuccess<{
        totalQuizzes: number;
        completedQuizzes: number;
        averageScore: number;
        totalStudyTime: number;
        currentStreak: number;
        longestStreak: number;
        currentLevel: number;
        pointsToNextLevel: number;
        weeklyProgress: Array<{ day?: string; score?: number; time?: number }>;
        recentActivity: Array<{
          id?: string;
          title?: string;
          description?: string;
          timestamp?: string | Date;
          type?: string;
          metadata?: Record<string, unknown>;
        }>;
        upcomingGoals: Array<{
          id?: string;
          title?: string;
          description?: string;
          progress?: number;
          target?: number;
          deadline?: string | Date;
        }>;
      }>
    >(`/api/users/${userId}/progress`);
    const data = unwrap(response);

    return {
      totalQuizzes: ensureNumber(data.totalQuizzes),
      completedQuizzes: ensureNumber(data.completedQuizzes),
      averageScore: ensureNumber(data.averageScore),
      totalStudyTime: ensureNumber(data.totalStudyTime),
      currentStreak: ensureNumber(data.currentStreak),
      longestStreak: ensureNumber(data.longestStreak),
      currentLevel: ensureNumber(data.currentLevel, 1),
      pointsToNextLevel: ensureNumber(data.pointsToNextLevel, 100),
      weeklyProgress: mapWeeklyProgress(data.weeklyProgress),
      recentActivity: mapRecentActivity(data.recentActivity),
      upcomingGoals: mapGoals(data.upcomingGoals),
    } satisfies DashboardStats;
  }
}

export const databaseService = new DatabaseService();

export default databaseService;
