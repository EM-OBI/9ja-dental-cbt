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
