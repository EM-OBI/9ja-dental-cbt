// Global state types for the dental CBT application
import type { JobStatus } from "@/types/studyJob";
export type { JobStatus } from "@/types/studyJob";

export type UserRole = "user" | "admin" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: UserRole; // User role for authorization
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
    activityTypes: ("quiz" | "study" | "review" | "login")[];
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
    totalMinutes: number;
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
  // Data fetching
  fetchSpecialties: () => Promise<void>;
  // loadQuestionsFromDatabase removed - questions fetched when quiz starts via API
  // loadQuizQuestionsById removed - use API instead
  // Quiz management
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
  // loadQuizHistory removed - use API hook instead
}

// AI-generated study materials
export interface AIStudyPackage {
  id: string;
  topic: string;
  source: "topic" | "notes" | "pdf";
  sourceContent?: string; // Original notes or topic
  fileName?: string; // For PDF uploads
  generatedAt: string;
  status: "generating" | "completed" | "error";
  progress: number;
  summary?: AIGeneratedContent;
  flashcards?: AIGeneratedContent;
  quiz?: AIGeneratedContent;
  jobId?: string;
  remoteId?: string;
  error?: string;
}

export interface AIGeneratedContent {
  id: string;
  type: "summary" | "flashcards" | "quiz";
  content: string | FlashcardData | QuizData;
  generatedAt: string;
  model: string; // e.g., "llama-3-8b-instruct"
}

export interface FlashcardData {
  cards: Array<{
    question: string;
    answer: string;
  }>;
}

export interface QuizData {
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
}

// JobStatus is imported from @/types/studyJob to keep state types in sync across client and server

// UI State for Study Page
export interface StudyPageUIState {
  activeTab: "topic" | "notes" | "pdf";
  topicInput: string;
  notesInput: string;
  materialTypes: string[];
}

export interface StudyActions {
  // Data fetching
  fetchStudyMaterials: () => Promise<void>;
  // Session management
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
  // AI-generated materials actions
  addAIPackage: (
    packageData: Omit<AIStudyPackage, "id" | "generatedAt">
  ) => string;
  updateAIPackage: (
    packageId: string,
    updates: Partial<AIStudyPackage>
  ) => void;
  deleteAIPackage: (packageId: string) => void;
  getAIPackage: (packageId: string) => AIStudyPackage | undefined;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  // UI state actions
  updateStudyPageUI: (updates: Partial<StudyPageUIState>) => void;
  resetStudyPageUI: () => void;
  // Database integration
  loadStudySessionsFromDatabase: (userId: string) => Promise<void>;
  saveStudySessionToDatabase: (session: StudySession) => Promise<void>;
}

export interface ProgressActions {
  initializeStreakData: () => void;
  updateStats: () => void;
  updateStreak: (activityType: "quiz" | "study" | "review" | "login") => void;
  unlockAchievement: (achievementId: string) => void;
  addActivity: (activity: {
    type: "quiz" | "study" | "achievement" | "streak";
    description: string;
    points?: number;
  }) => void;
  clearRecentActivity: () => void;
  resetProgress: () => void;
  // Database integration
  loadProgressFromDatabase: (userId: string) => Promise<void>;
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
