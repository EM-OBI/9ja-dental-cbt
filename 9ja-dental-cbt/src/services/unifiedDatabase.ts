import {
  UnifiedProgressData,
  SpecialtyCoverage,
  QuizAttempt,
  StudySession,
  Badge,
  PerformanceChart,
  BookmarkedQuestion,
} from "@/types/progress";

export interface UnifiedDatabaseService {
  getUserProgress(
    userId: string,
    options?: ProgressQueryOptions
  ): Promise<UnifiedProgressData>;
  getUserProgressSummary(userId: string): Promise<ProgressSummary>;
  refreshUserProgress(userId: string): Promise<void>;
  getUserProgressHistory(
    userId: string,
    limit?: number
  ): Promise<PerformanceChart[]>;
  userExists(userId: string): Promise<boolean>;
}

export interface ProgressQueryOptions {
  includeHistory?: boolean;
  limit?: number;
}

export interface ProgressSummary {
  userId: string;
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  currentStreak: number;
  totalStudyTime: number;
  currentLevel: string;
}

// Mock Unified Database Service Implementation
class MockUnifiedDatabaseService implements UnifiedDatabaseService {
  private users: Map<string, UnifiedProgressData> = new Map();

  constructor() {
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockProgressData: UnifiedProgressData = {
      userId: "user-123",

      // Core quiz statistics
      totalQuizzes: 50,
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
      lastActivityDate: "2025-09-08T10:30:00Z",
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
          lastAttempted: "2025-09-08T10:30:00Z",
        },
        Endodontics: {
          questionsAttempted: 38,
          accuracy: "89%",
          mastery: "Expert",
          lastAttempted: "2025-09-07T09:15:00Z",
        },
        Periodontics: {
          questionsAttempted: 32,
          accuracy: "76%",
          mastery: "Intermediate",
          lastAttempted: "2025-09-06T14:20:00Z",
        },
        Orthodontics: {
          questionsAttempted: 28,
          accuracy: "85%",
          mastery: "Advanced",
          lastAttempted: "2025-09-05T11:45:00Z",
        },
        "Oral Surgery": {
          questionsAttempted: 25,
          accuracy: "78%",
          mastery: "Intermediate",
          lastAttempted: "2025-09-04T16:30:00Z",
        },
      },

      // Recent activity
      recentQuizzes: [
        {
          id: "q1",
          date: "2025-09-08T10:30:00Z",
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
          date: "2025-09-07T09:15:00Z",
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
          date: "2025-09-06T14:20:00Z",
          mode: "Practice Mode",
          specialty: "Periodontics",
          questionsAttempted: 12,
          correct: 9,
          incorrect: 3,
          score: "75%",
          timeSpent: 18,
        },
        {
          id: "q4",
          date: "2025-09-05T11:45:00Z",
          mode: "Challenge Mode",
          specialty: "Orthodontics",
          questionsAttempted: 20,
          correct: 17,
          incorrect: 3,
          score: "85%",
          timeSpent: 35,
        },
        {
          id: "q5",
          date: "2025-09-04T16:30:00Z",
          mode: "Study Mode",
          specialty: "Oral Surgery",
          questionsAttempted: 8,
          correct: 6,
          incorrect: 2,
          score: "75%",
          timeSpent: 12,
        },
      ],

      recentStudySessions: [
        {
          id: "s1",
          date: "2025-09-08T08:00:00Z",
          specialty: "Oral Pathology",
          timeSpent: 30,
          topicsStudied: ["Benign Tumors", "Malignant Lesions"],
          completionPercentage: 85,
        },
        {
          id: "s2",
          date: "2025-09-07T07:30:00Z",
          specialty: "Endodontics",
          timeSpent: 45,
          topicsStudied: ["Root Canal Therapy", "Pulp Diseases"],
          completionPercentage: 92,
        },
        {
          id: "s3",
          date: "2025-09-06T19:00:00Z",
          specialty: "Periodontics",
          timeSpent: 25,
          topicsStudied: ["Gingival Diseases", "Periodontal Surgery"],
          completionPercentage: 78,
        },
      ],

      // Additional data
      bookmarkedQuestions: [
        {
          id: "bq1",
          question: "What is the most common cause of pulp necrosis?",
          specialty: "Endodontics",
          dateBookmarked: "2025-09-05T10:00:00Z",
          difficulty: "Medium",
          isReviewed: false,
        },
        {
          id: "bq2",
          question:
            "Which radiographic finding is pathognomonic for cherubism?",
          specialty: "Oral Pathology",
          dateBookmarked: "2025-09-03T15:30:00Z",
          difficulty: "Hard",
          isReviewed: true,
        },
        {
          id: "bq3",
          question:
            "What is the recommended frequency for periodontal maintenance?",
          specialty: "Periodontics",
          dateBookmarked: "2025-09-01T12:45:00Z",
          difficulty: "Easy",
          isReviewed: false,
        },
      ],

      performanceCharts: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        accuracy: 70 + Math.random() * 25, // 70-95% accuracy range
        questionsAnswered: 5 + Math.floor(Math.random() * 15), // 5-20 questions per day
        timeSpent: 10 + Math.floor(Math.random() * 40), // 10-50 minutes per day
      })),

      badges: [
        {
          id: "b1",
          name: "Streak Master",
          description: "Maintained a 7-day streak",
          icon: "🔥",
          earnedOn: "2025-09-01T00:00:00Z",
          category: "Streak",
        },
        {
          id: "b2",
          name: "Accuracy Expert",
          description: "Achieved 90% accuracy in Endodontics",
          icon: "🎯",
          earnedOn: "2025-08-28T00:00:00Z",
          category: "Accuracy",
        },
        {
          id: "b3",
          name: "Specialty Master",
          description: "Completed all Oral Pathology topics",
          icon: "👨‍⚕️",
          earnedOn: "2025-08-25T00:00:00Z",
          category: "Specialty",
        },
        {
          id: "b4",
          name: "Study Champion",
          description: "Completed 100 quiz attempts",
          icon: "🏆",
          earnedOn: "2025-08-20T00:00:00Z",
          category: "Achievement",
        },
      ],
    };

    // Add mock users
    this.users.set("user-123", mockProgressData);

    // Add a second user for testing
    const user2Data = { ...mockProgressData };
    user2Data.userId = "user-456";
    user2Data.completedQuizzes = 32;
    user2Data.averageScore = 78.5;
    user2Data.currentStreak = 3;
    user2Data.currentLevel = "Intermediate";
    user2Data.userRank = 45;
    this.users.set("user-456", user2Data);
  }

  async getUserProgress(
    userId: string,
    options?: ProgressQueryOptions
  ): Promise<UnifiedProgressData> {
    // Simulate database delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const userData = this.users.get(userId);
    if (!userData) {
      throw new Error(`User with ID ${userId} not found`);
    }

    let result = { ...userData };

    // Apply options
    if (options?.includeHistory === false) {
      result = {
        ...result,
        performanceCharts: [],
        streakHistory: [],
      };
    }

    if (options?.limit) {
      result.recentQuizzes = result.recentQuizzes.slice(0, options.limit);
      if (result.recentStudySessions) {
        result.recentStudySessions = result.recentStudySessions.slice(
          0,
          options.limit
        );
      }
    }

    return result;
  }

  async getUserProgressSummary(userId: string): Promise<ProgressSummary> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const userData = this.users.get(userId);
    if (!userData) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return {
      userId: userData.userId,
      totalQuizzes: userData.totalQuizzes,
      completedQuizzes: userData.completedQuizzes,
      averageScore: userData.averageScore,
      currentStreak: userData.currentStreak,
      totalStudyTime: userData.totalStudyTime,
      currentLevel: userData.currentLevel,
    };
  }

  async refreshUserProgress(userId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!this.users.has(userId)) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // In a real implementation, this would trigger a cache invalidation
    // and potentially recompute aggregated statistics
    console.log(`Refreshing progress data for user ${userId}`);
  }

  async getUserProgressHistory(
    userId: string,
    limit = 30
  ): Promise<PerformanceChart[]> {
    await new Promise((resolve) => setTimeout(resolve, 75));

    const userData = this.users.get(userId);
    if (!userData) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return userData.performanceCharts?.slice(-limit) || [];
  }

  async userExists(userId: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 25));
    return this.users.has(userId);
  }
}

// Export singleton instance
export const unifiedDatabaseService: UnifiedDatabaseService =
  new MockUnifiedDatabaseService();
