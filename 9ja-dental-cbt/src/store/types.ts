// Global state types for the dental CBT application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription: "free" | "premium" | "enterprise";
  level: number;
  xp: number;
  joinedDate: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: {
    studyReminders: boolean;
    streakAlerts: boolean;
    progressReports: boolean;
    achievements: boolean;
  };
  quiz: {
    defaultMode: "study" | "exam";
    showExplanations: boolean;
    timePerQuestion: number;
    autoSubmit: boolean;
  };
  study: {
    defaultFocusTime: number;
    breakTime: number;
    soundEffects: boolean;
  };
}

export interface QuizSession {
  id: string;
  userId: string;
  mode: "study" | "exam";
  specialty: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  startTime: string;
  endTime?: string;
  timePerQuestion: Record<string, number>;
  isActive: boolean;
  isPaused: boolean;
  score?: {
    correct: number;
    incorrect: number;
    percentage: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  specialty: string;
  tags: string[];
  imageUrl?: string;
  references?: string[];
}

export interface StudySession {
  id: string;
  userId: string;
  materialId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  focusTime: number;
  breaks: number;
  notes: StudyNote[];
  isActive: boolean;
}

export interface StudyNote {
  id: string;
  content: string;
  timestamp: string;
  pageNumber?: number;
  highlight?: {
    text: string;
    color: string;
  };
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: "pdf" | "video" | "article" | "notebook";
  url: string;
  specialty: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  uploadDate: string;
  size: number;
  pages?: number;
  duration?: number;
  isBookmarked: boolean;
  progress: number; // 0-100
  lastAccessed?: string;
  notes: StudyNote[];
  tags: string[];
}

export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  streakHistory: Array<{
    date: string;
    active: boolean;
    activityTypes: ("quiz" | "study" | "review")[];
    activityCount: number;
  }>;
  weeklyGoal: number;
  monthlyGoal: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "quiz" | "study" | "streak" | "progress" | "social";
  criteria: {
    type: "count" | "percentage" | "streak" | "time";
    target: number;
    metric: string;
  };
  unlockedAt?: string;
  progress: number;
  isUnlocked: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: "achievement" | "reminder" | "streak" | "progress" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
}

export interface ProgressStats {
  quizzes: {
    total: number;
    completed: number;
    averageScore: number;
    bestScore: number;
    timeSpent: number;
    bySpecialty: Record<
      string,
      {
        attempted: number;
        accuracy: number;
        averageTime: number;
      }
    >;
  };
  study: {
    totalHours: number;
    materialsCompleted: number;
    notesCreated: number;
    focusSessions: number;
    averageFocusTime: number;
  };
  streaks: StreakData;
  level: {
    current: number;
    xp: number;
    xpToNext: number;
    totalXp: number;
  };
  achievements: Achievement[];
  recentActivity: Array<{
    id: string;
    type: "quiz" | "study" | "achievement" | "streak";
    description: string;
    timestamp: string;
    points?: number;
  }>;
}

// Store action types
export interface UserActions {
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  logout: () => void;
}

export interface QuizActions {
  startQuiz: (
    specialty: string,
    mode: "study" | "exam",
    questionCount: number
  ) => void;
  answerQuestion: (
    questionId: string,
    answer: string,
    timeSpent: number
  ) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  submitQuiz: () => QuizSession | undefined;
  resetQuiz: () => void;
  saveQuizSession: () => void;
  loadQuizHistory: () => void;
}

export interface StudyActions {
  startStudySession: (materialId: string) => void;
  pauseStudySession: () => void;
  resumeStudySession: () => void;
  endStudySession: () => StudySession | undefined;
  addNote: (note: Omit<StudyNote, "id" | "timestamp">) => void;
  updateNote: (noteId: string, updates: Partial<StudyNote>) => void;
  deleteNote: (noteId: string) => void;
  bookmarkMaterial: (materialId: string) => void;
  updateProgress: (materialId: string, progress: number) => void;
  uploadMaterial: (material: Omit<StudyMaterial, "id" | "uploadDate">) => void;
}

export interface ProgressActions {
  initializeStreakData: () => void;
  updateStats: () => void;
  updateStreak: (activityType: "quiz" | "study" | "review") => void;
  unlockAchievement: (achievementId: string) => void;
  addActivity: (activity: {
    type: "quiz" | "study" | "achievement" | "streak";
    description: string;
    points?: number;
  }) => void;
}

export interface NotificationActions {
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}
