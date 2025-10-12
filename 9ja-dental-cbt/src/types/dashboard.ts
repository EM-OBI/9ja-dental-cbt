// Base types for database entities
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz related types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  totalQuestions: number;
  timeLimit?: number; // in minutes
  difficulty: "easy" | "medium" | "hard";
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  completedAt: Date;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

// Study session types
export interface StudySession {
  id: string;
  userId: string;
  topic: string;
  duration: number; // in minutes
  completedAt: Date;
  notes?: string;
}

// Streak and progress types
export interface UserStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakData: StreakDay[];
}

export interface StreakDay {
  date: Date;
  completed: boolean;
  activityCount: number;
  activityTypes: ("quiz" | "study" | "review")[];
}

// Leaderboard types
export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  totalScore: number;
  quizzesCompleted: number;
  averageScore: number;
  rank: number;
  level: number;
}

// Dashboard analytics types
export interface DashboardStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  totalStudyTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  currentLevel: number;
  pointsToNextLevel: number;
  weeklyProgress: WeeklyProgress[];
  recentActivity: RecentActivity[];
  upcomingGoals: Goal[];
}

export interface WeeklyProgress {
  date: Date;
  quizzesTaken: number;
  studyMinutes: number;
  averageScore: number;
}

export interface RecentActivity {
  id: string;
  type:
    | "quiz_completed"
    | "study_session"
    | "achievement_unlocked"
    | "streak_milestone";
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  isCompleted: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Database adapter interface (for different databases)
export interface DatabaseAdapter {
  // User operations
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;

  // Quiz operations
  getQuizzes(filters?: QuizFilters): Promise<PaginatedResponse<Quiz>>;
  getQuizAttempts(userId: string, limit?: number): Promise<QuizAttempt[]>;

  // Dashboard data
  getDashboardStats(userId: string): Promise<DashboardStats>;
  getUserStreak(userId: string): Promise<UserStreak>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;

  // Study sessions
  getStudySessions(userId: string, limit?: number): Promise<StudySession[]>;
  createStudySession(
    session: Omit<StudySession, "id" | "completedAt">
  ): Promise<StudySession>;
}

export interface QuizFilters {
  category?: string;
  difficulty?: Quiz["difficulty"];
  search?: string;
  limit?: number;
  offset?: number;
}

// Component props types
export interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  className?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ActivityFeedProps {
  activities: RecentActivity[];
  maxItems?: number;
  showTimestamp?: boolean;
}
