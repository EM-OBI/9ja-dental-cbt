// Updated type definitions to match the Hono backend schema

// Base types for database entities (aligned with backend schema)
export interface User {
  id: string;
  name: string; // Changed from displayName to match backend
  email: string;
  bio?: string;
  avatar?: string;
  subscription: "free" | "basic" | "premium";
  level: number;
  xp: number;
  points: number;
  streak_count: number;
  preferences?: UserPreferences;
  created_at: string; // ISO string from backend
  updated_at: string; // ISO string from backend
  // Computed properties for frontend compatibility
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  notifications?: boolean;
  difficulty?: "easy" | "medium" | "hard";
  study_reminders?: boolean;
  language?: string;
}

// Quiz related types (aligned with backend schema)
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  totalQuestions: number;
  timeLimit?: number; // in minutes
  difficulty: "easy" | "medium" | "hard";
  category: string;
  specialty: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: string[]; // JSON array from backend
  correct_answer: number;
  explanation?: string;
  specialty: string;
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "true-false" | "image-based";
  time_estimate: number; // seconds
  tags?: string[]; // JSON array from backend
  created_at: string;
  updated_at: string;
}

export interface QuizSession {
  id: string;
  user_id: string;
  quiz_type: "practice" | "challenge" | "exam";
  subject?: string;
  current_question: number;
  total_questions: number;
  start_time: string; // ISO string
  end_time?: string; // ISO string
  time_limit?: number; // seconds
  is_completed: boolean;
  questions_data?: any; // JSON data
  created_at: string;
  updated_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_type: "practice" | "challenge" | "exam";
  subject?: string;
  score: number;
  total_questions: number;
  time_taken: number; // seconds
  answers: any; // JSON data
  completed_at: string; // ISO string
  created_at: string;
}

// Legacy QuizAttempt type for compatibility
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

// Progress tracking (aligned with backend schema)
export interface Progress {
  id: string;
  user_id: string;
  total_questions_answered: number;
  correct_answers: number;
  accuracy_rate: number;
  subjects_progress?: any; // JSON data
  weekly_goals?: any; // JSON data
  monthly_goals?: any; // JSON data
  created_at: string;
  updated_at: string;
}

// Study session types (aligned with backend schema)
export interface StudySession {
  id: string;
  user_id: string;
  session_type: "focused" | "review" | "practice";
  subject?: string;
  duration: number; // minutes
  topics_covered?: any; // JSON data
  notes?: string;
  completed_at: string;
  created_at: string;
}

// Streak and achievement types (aligned with backend schema)
export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: "daily_quiz" | "study_session" | "login";
  current_count: number;
  best_count: number;
  last_activity_date: string;
  streak_start_date?: string;
  streak_data?: any; // JSON data
  created_at: string;
  updated_at: string;
  // Legacy properties for compatibility
  userId?: string;
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: Date;
  streakData?: StreakDay[];
}

export interface StreakDay {
  date: Date;
  completed: boolean;
  activityCount: number;
  activityTypes: ("quiz" | "study" | "review")[];
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type:
    | "streak"
    | "score"
    | "milestone"
    | "specialty"
    | "participation";
  title: string;
  description?: string;
  icon?: string;
  earned_at: string;
  created_at: string;
}

// Leaderboard types (aligned with backend schema)
export interface LeaderboardEntry {
  id: string;
  user_id: string;
  timeframe: "daily" | "weekly" | "monthly";
  score: number;
  rank: number;
  entry_date: string;
  created_at: string;
  updated_at: string;
  // User data (joined)
  userName?: string;
  userAvatar?: string;
  totalScore?: number;
  quizzesCompleted?: number;
  averageScore?: number;
  level?: number;
}

// Notification types (aligned with backend schema)
export interface Notification {
  id: string;
  user_id: string;
  type: "achievement" | "reminder" | "progress_report" | "system";
  title: string;
  message: string;
  is_read: boolean;
  data?: any; // JSON data
  created_at: string;
  updated_at: string;
}

// Bookmark types (aligned with backend schema)
export interface Bookmark {
  id: string;
  user_id: string;
  item_type: "question" | "quiz" | "topic";
  item_id: string;
  specialty?: string;
  notes?: string;
  created_at: string;
}

// Dashboard analytics types (updated for backend compatibility)
export interface DashboardStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  totalStudyTime: number; // in minutes
  currentStreak: number;
  longestStreak: number;
  currentLevel: number;
  totalXP: number;
  points: number;
  rank: number;
  weeklyGoal?: {
    target: number;
    current: number;
    completed: boolean;
  };
  recentActivity: RecentActivity[];
  topCategories: CategoryProgress[];
  performanceChart: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
}

export interface CategoryProgress {
  category: string;
  progress: number;
  totalQuestions: number;
  correctAnswers: number;
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

// API Response types (aligned with backend responses)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Updated Database adapter interface
export interface DatabaseAdapter {
  // User operations
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;

  // Quiz operations
  getQuizzes(filters?: QuizFilters): Promise<PaginatedResponse<Quiz>>;
  getQuizAttempts(userId: string, limit?: number): Promise<QuizAttempt[]>;
  createQuizAttempt(
    attempt: Omit<QuizAttempt, "id" | "completedAt">
  ): Promise<QuizAttempt>;

  // Dashboard data
  getDashboardStats(userId: string): Promise<DashboardStats>;
  getUserStreak(userId: string): Promise<UserStreak>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;

  // Study sessions
  getStudySessions(userId: string, limit?: number): Promise<StudySession[]>;
  createStudySession(
    session: Omit<StudySession, "id" | "created_at">
  ): Promise<StudySession>;
}

export interface QuizFilters {
  category?: string;
  difficulty?: Quiz["difficulty"];
  specialty?: string;
  search?: string;
  limit?: number;
  offset?: number;
  page?: number;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  subscription?: "free" | "basic" | "premium";
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
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

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Utility type for converting backend timestamps to frontend dates
export type BackendEntity<T> = T & {
  created_at: string;
  updated_at: string;
};

export type FrontendEntity<T> = Omit<T, "created_at" | "updated_at"> & {
  createdAt: Date;
  updatedAt: Date;
};
