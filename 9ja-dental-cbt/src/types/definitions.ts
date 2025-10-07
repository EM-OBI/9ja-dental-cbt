// Type definitions
export interface StatItem {
  title: string;
  value: string;
  icon?: React.ReactNode; // Made optional for minimal design
  position: "top-right" | "bottom-left" | "top-left" | "bottom-right";
  delay: string;
}

export interface StatsData {
  questions: number;
  satisfactionRate: string;
  countries: number;
}

export interface HeaderVariant {
  title: string;
  headline: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  specialty: string;
  difficulty: "easy" | "medium" | "hard";
  imageUrl?: string;
  timeLimit?: number;
  type: "mcq" | "true-false" | "image-based";
  timeEstimate: number; // seconds
}

export interface Answer {
  questionId: string;
  selectedOption: number | null;
  timeSpent: number;
  isCorrect: boolean;
  timestamp: number;
}

export interface QuizSession {
  id: string;
  mode: "practice" | "challenge" | "exam";
  timeLimit: number | null;
  specialty: string;
  totalQuestions: number;
  startTime: number;
  endTime?: number;
  quizId?: string;
}

export interface QuizState {
  // Core state
  questions: Question[];
  shuffledQuestions: Question[];
  currentQuestionIndex: number;
  answers: Answer[];
  score: number;
  timeRemaining: number | null;
  session: QuizSession | null;

  // UI state
  isActive: boolean;
  isSubmitting: boolean;
  isLoading: boolean;

  // User interactions
  bookmarkedQuestions: Set<string>;
  wrongAnswers: Set<string>;
  timeSpentPerQuestion: Record<string, number>;

  // Performance tracking
  startTime: number | null;
  lastQuestionStartTime: number | null;

  // Randomization
  seed: string;
}

export interface QuizConfig {
  mode: "practice" | "challenge" | "exam";
  timeLimit: number | null;
  specialty: string;
  totalQuestions: number;
  seed?: string;
  quizId?: string;
  sessionId?: string;
}

export interface QuizMode {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  settings: {
    timeLimit: boolean;
    showExplanationAfterEachQuestion: boolean;
    showSummaryAtEnd: boolean;
    leaderboard: boolean;
  };
}

export interface Specialty {
  name: string;
  icon: React.ReactNode;
  count?: number;
}

export interface TimerOption {
  name: string;
  duration: string;
  minutes: number;
}

export interface QuizStats {
  totalTime: number;
  averageTimePerQuestion: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  accuracy: number;
  timeBonus: number;
  finalScore: number;
}
