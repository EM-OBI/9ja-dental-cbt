// Progress Page Types
export interface QuizAttempt {
  id: string;
  date: string;
  mode: "Study Mode" | "Exam Mode" | "Practice Mode" | "Challenge Mode";
  specialty: string;
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  score: string;
  timeSpent: number; // in minutes
}

export interface QuizTracking {
  totalQuizzesAttempted: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  recentQuizzes: QuizAttempt[];
}

export interface SpecialtyCoverage {
  [specialty: string]: {
    questionsAttempted: number;
    accuracy: string;
    mastery: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    lastAttempted: string;
  };
}

export interface BookmarkedQuestion {
  id: string;
  question: string;
  specialty: string;
  dateBookmarked: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isReviewed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedOn: string;
  category: "Achievement" | "Streak" | "Accuracy" | "Specialty";
}

export interface UserLeveling {
  currentLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  points: number;
  pointsToNextLevel: number;
  badges: Badge[];
  rank: number;
  totalUsers: number;
}

export interface PerformanceChart {
  date: string;
  accuracy: number;
  questionsAnswered: number;
  timeSpent: number;
}

export interface WeeklyProgressSummary {
  date: string;
  quizzesTaken: number;
  studyMinutes: number;
  averageScore: number;
}

// Legacy interface for backward compatibility
export interface ProgressData {
  userId: string;
  quizTracking: QuizTracking;
  streakTracking: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: string | null;
    streakHistory: { date: string; active: boolean }[];
  };
  specialtyCoverage: SpecialtyCoverage;
  bookmarkedQuestions: BookmarkedQuestion[];
  performanceCharts: PerformanceChart[];
  userLeveling: UserLeveling;
}

// Unified Progress Data Interface - standardized field names
export interface UnifiedProgressData {
  userId: string;

  // Core quiz statistics (standardized naming)
  totalQuizzes: number; // was: totalQuizzesAttempted
  completedQuizzes: number; // was: totalQuizzesAttempted (same value)
  totalQuestionsAnswered: number; // consistent
  correctAnswers: number; // consistent
  incorrectAnswers: number; // consistent
  averageScore: number; // was: accuracyPercentage (decimal format 0-100)

  // Time tracking
  totalStudyTime: number; // minutes - NEW field for dashboard compatibility

  // Streak data (consistent)
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakHistory: { date: string; active: boolean }[];

  // Leveling system
  currentLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  experiencePoints: number; // was: points
  pointsToNextLevel: number; // consistent
  userRank: number; // was: rank
  totalUsers: number; // consistent

  // Specialty coverage
  specialtyCoverage: SpecialtyCoverage;

  // Recent activity
  recentQuizzes: QuizAttempt[];
  recentStudySessions?: StudySession[]; // NEW for dashboard compatibility

  // Additional data
  bookmarkedQuestions: BookmarkedQuestion[];
  performanceCharts: PerformanceChart[];
  badges: Badge[];

  weeklyProgress: WeeklyProgressSummary[];
}

// Study session interface for unified data
export interface StudySession {
  id: string;
  date: string;
  specialty: string;
  timeSpent: number; // minutes
  topicsStudied: string[];
  completionPercentage: number;
}
