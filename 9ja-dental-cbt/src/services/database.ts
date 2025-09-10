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

// Mock data service - replace with your actual database implementation
export class MockDatabaseService implements DatabaseAdapter {
  async getUserById(id: string): Promise<User | null> {
    // Mock implementation
    return {
      id,
      email: "user@example.com",
      name: "John Doe",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date(),
    };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) throw new Error("User not found");
    return { ...user, ...data, updatedAt: new Date() };
  }

  async getQuizzes(filters?: QuizFilters): Promise<PaginatedResponse<Quiz>> {
    const mockQuizzes: Quiz[] = [
      {
        id: "1",
        title: "Dental Anatomy Basics",
        description: "Test your knowledge of basic dental anatomy",
        totalQuestions: 20,
        timeLimit: 30,
        difficulty: "easy",
        category: "Anatomy",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: "2",
        title: "Advanced Periodontics",
        description: "Advanced concepts in periodontal treatment",
        totalQuestions: 25,
        timeLimit: 45,
        difficulty: "hard",
        category: "Periodontics",
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
      },
    ];

    return {
      data: mockQuizzes,
      pagination: {
        page: 1,
        limit: 10,
        total: mockQuizzes.length,
        totalPages: 1,
      },
    };
  }

  async getQuizAttempts(userId: string, limit = 10): Promise<QuizAttempt[]> {
    return [
      {
        id: "1",
        userId,
        quizId: "dental-anatomy-101",
        score: 18,
        totalQuestions: 20,
        timeSpent: 1200,
        completedAt: new Date(),
        answers: [],
      },
      {
        id: "2",
        userId,
        quizId: "periodontics-advanced",
        score: 22,
        totalQuestions: 25,
        timeSpent: 2100,
        completedAt: new Date(Date.now() - 86400000),
        answers: [],
      },
      {
        id: "3",
        userId,
        quizId: "oral-surgery-basics",
        score: 15,
        totalQuestions: 20,
        timeSpent: 1800,
        completedAt: new Date(Date.now() - 2 * 86400000),
        answers: [],
      },
      {
        id: "4",
        userId,
        quizId: "endodontics-fundamentals",
        score: 19,
        totalQuestions: 20,
        timeSpent: 1500,
        completedAt: new Date(Date.now() - 3 * 86400000),
        answers: [],
      },
      {
        id: "5",
        userId,
        quizId: "orthodontics-principles",
        score: 16,
        totalQuestions: 18,
        timeSpent: 1350,
        completedAt: new Date(Date.now() - 5 * 86400000),
        answers: [],
      },
    ];
  }

  async createQuizAttempt(
    attempt: Omit<QuizAttempt, "id" | "completedAt">
  ): Promise<QuizAttempt> {
    return {
      ...attempt,
      id: Math.random().toString(36).substr(2, 9),
      completedAt: new Date(),
    };
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    return {
      totalQuizzes: 45,
      completedQuizzes: 28,
      averageScore: 87.5,
      totalStudyTime: 1250,
      currentStreak: 7,
      longestStreak: 12,
      currentLevel: 5,
      pointsToNextLevel: 180,
      weeklyProgress: [
        {
          date: new Date("2024-01-01"),
          quizzesTaken: 3,
          studyMinutes: 120,
          averageScore: 85,
        },
        {
          date: new Date("2024-01-02"),
          quizzesTaken: 2,
          studyMinutes: 90,
          averageScore: 92,
        },
        {
          date: new Date("2024-01-03"),
          quizzesTaken: 4,
          studyMinutes: 150,
          averageScore: 88,
        },
        {
          date: new Date("2024-01-04"),
          quizzesTaken: 1,
          studyMinutes: 60,
          averageScore: 95,
        },
        {
          date: new Date("2024-01-05"),
          quizzesTaken: 3,
          studyMinutes: 110,
          averageScore: 82,
        },
        {
          date: new Date("2024-01-06"),
          quizzesTaken: 2,
          studyMinutes: 80,
          averageScore: 90,
        },
        {
          date: new Date("2024-01-07"),
          quizzesTaken: 5,
          studyMinutes: 180,
          averageScore: 89,
        },
      ],
      recentActivity: [
        {
          id: "1",
          type: "quiz_completed",
          title: "Dental Anatomy Quiz",
          description: "Scored 18/20 (90%)",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: "2",
          type: "achievement_unlocked",
          title: "Week Warrior",
          description: "Completed 7 days in a row!",
          timestamp: new Date(Date.now() - 7200000),
        },
        {
          id: "3",
          type: "study_session",
          title: "Periodontics Review",
          description: "Studied for 45 minutes",
          timestamp: new Date(Date.now() - 10800000),
        },
      ],
      upcomingGoals: [
        {
          id: "1",
          title: "Complete 10 Quizzes",
          description: "Take 10 quizzes this week",
          targetValue: 10,
          currentValue: 7,
          unit: "quizzes",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isCompleted: false,
        },
        {
          id: "2",
          title: "Study 300 Minutes",
          description: "Study for 5 hours this week",
          targetValue: 300,
          currentValue: 245,
          unit: "minutes",
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isCompleted: false,
        },
      ],
    };
  }

  async getUserStreak(userId: string): Promise<UserStreak> {
    return {
      id: "1",
      userId,
      currentStreak: 7,
      longestStreak: 12,
      lastActivityDate: new Date(),
      streakData: [
        {
          date: new Date(),
          completed: true,
          activityCount: 2,
          activityTypes: ["quiz", "study"],
        },
        {
          date: new Date(Date.now() - 86400000),
          completed: true,
          activityCount: 1,
          activityTypes: ["quiz"],
        },
        {
          date: new Date(Date.now() - 2 * 86400000),
          completed: true,
          activityCount: 3,
          activityTypes: ["quiz", "study", "review"],
        },
      ],
    };
  }

  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    return [
      {
        id: "1",
        userId: "1",
        userName: "Alice Johnson",
        userAvatar:
          "https://images.unsplash.com/photo-1494790108755-2616b9e2ce0c?auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        totalScore: 2450,
        quizzesCompleted: 32,
        averageScore: 94.2,
        rank: 1,
        level: 7,
      },
      {
        id: "2",
        userId: "2",
        userName: "Bob Smith",
        userAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        totalScore: 2180,
        quizzesCompleted: 28,
        averageScore: 89.8,
        rank: 2,
        level: 6,
      },
      {
        id: "3",
        userId: "3",
        userName: "Carol Davis",
        userAvatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80",
        totalScore: 1950,
        quizzesCompleted: 25,
        averageScore: 87.5,
        rank: 3,
        level: 5,
      },
    ];
  }

  async getStudySessions(userId: string, limit = 10): Promise<StudySession[]> {
    return [
      {
        id: "1",
        userId,
        topic: "Dental Anatomy",
        duration: 45,
        completedAt: new Date(),
        notes: "Focused on tooth structure and classification",
      },
      {
        id: "2",
        userId,
        topic: "Periodontics",
        duration: 60,
        completedAt: new Date(Date.now() - 86400000),
        notes: "Reviewed gum disease treatment protocols",
      },
    ];
  }

  async createStudySession(
    session: Omit<StudySession, "id" | "completedAt">
  ): Promise<StudySession> {
    return {
      ...session,
      id: Math.random().toString(36).substr(2, 9),
      completedAt: new Date(),
    };
  }
}

// Create a singleton instance
export const dbService = new MockDatabaseService();

// Database service factory for different implementations
export class DatabaseServiceFactory {
  static create(
    type: "mock" | "postgresql" | "mongodb" | "supabase" = "mock"
  ): DatabaseAdapter {
    switch (type) {
      case "mock":
        return new MockDatabaseService();
      // Add other database implementations here
      case "postgresql":
        // return new PostgreSQLService();
        throw new Error("PostgreSQL implementation not yet available");
      case "mongodb":
        // return new MongoDBService();
        throw new Error("MongoDB implementation not yet available");
      case "supabase":
        // return new SupabaseService();
        throw new Error("Supabase implementation not yet available");
      default:
        return new MockDatabaseService();
    }
  }
}
