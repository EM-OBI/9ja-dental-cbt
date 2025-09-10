import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { QuizSession, QuizQuestion, QuizActions } from "./types";
import { addXp } from "./userStore";

interface QuizState {
  currentSession: QuizSession | null;
  questions: QuizQuestion[];
  quizHistory: QuizSession[];
  isLoading: boolean;
  availableSpecialties: string[];
}

type QuizStore = QuizState & QuizActions;

// Mock questions data (subset of the full database)
const mockQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "Which of the following is the most common cause of tooth pain?",
    options: [
      "Dental caries",
      "Periodontal disease",
      "Tooth fracture",
      "Bruxism",
    ],
    correctAnswer: "Dental caries",
    explanation:
      "Dental caries (tooth decay) is the most common cause of tooth pain as it affects the pulp when it progresses deep into the tooth structure.",
    difficulty: "easy",
    specialty: "General Dentistry",
    tags: ["pain", "diagnosis", "caries"],
  },
  {
    id: "q2",
    question: "What is the gold standard treatment for irreversible pulpitis?",
    options: [
      "Pulp capping",
      "Root canal therapy",
      "Tooth extraction",
      "Antibiotics",
    ],
    correctAnswer: "Root canal therapy",
    explanation:
      "Root canal therapy is the gold standard for treating irreversible pulpitis, as it removes the infected pulp and preserves the tooth structure.",
    difficulty: "medium",
    specialty: "Endodontics",
    tags: ["pulpitis", "treatment", "endodontics"],
  },
  // Add more questions as needed
];

const availableSpecialties = [
  "General Dentistry",
  "Oral Pathology",
  "Endodontics",
  "Periodontics",
  "Oral Surgery",
  "Orthodontics",
  "Prosthodontics",
  "Pediatric Dentistry",
  "Oral Medicine",
  "Dental Public Health",
];

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      questions: mockQuestions,
      quizHistory: [],
      isLoading: false,
      availableSpecialties,

      // Actions
      startQuiz: async (
        specialty: string,
        mode: "study" | "exam",
        questionCount: number = 10
      ) => {
        set({ isLoading: true });

        try {
          // Filter questions by specialty
          const allQuestions = get().questions;
          const specialtyQuestions =
            specialty === "All Specialties"
              ? allQuestions
              : allQuestions.filter((q) => q.specialty === specialty);

          // Randomly select questions
          const selectedQuestions = specialtyQuestions
            .sort(() => Math.random() - 0.5)
            .slice(0, questionCount);

          const newSession: QuizSession = {
            id: `quiz-${Date.now()}`,
            userId: "user-123", // Get from user store
            mode,
            specialty,
            questions: selectedQuestions,
            currentQuestionIndex: 0,
            answers: {},
            startTime: new Date().toISOString(),
            timePerQuestion: {},
            isActive: true,
            isPaused: false,
          };

          set({
            currentSession: newSession,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error starting quiz:", error);
          set({ isLoading: false });
        }
      },

      answerQuestion: (
        questionId: string,
        answer: string,
        timeSpent: number
      ) => {
        const session = get().currentSession;
        if (!session) return;

        set({
          currentSession: {
            ...session,
            answers: {
              ...session.answers,
              [questionId]: answer,
            },
            timePerQuestion: {
              ...session.timePerQuestion,
              [questionId]: timeSpent,
            },
          },
        });
      },

      nextQuestion: () => {
        const session = get().currentSession;
        if (!session) return;

        const nextIndex = session.currentQuestionIndex + 1;
        if (nextIndex < session.questions.length) {
          set({
            currentSession: {
              ...session,
              currentQuestionIndex: nextIndex,
            },
          });
        }
      },

      previousQuestion: () => {
        const session = get().currentSession;
        if (!session) return;

        const prevIndex = session.currentQuestionIndex - 1;
        if (prevIndex >= 0) {
          set({
            currentSession: {
              ...session,
              currentQuestionIndex: prevIndex,
            },
          });
        }
      },

      pauseQuiz: () => {
        const session = get().currentSession;
        if (!session) return;

        set({
          currentSession: {
            ...session,
            isPaused: true,
          },
        });
      },

      resumeQuiz: () => {
        const session = get().currentSession;
        if (!session) return;

        set({
          currentSession: {
            ...session,
            isPaused: false,
          },
        });
      },

      submitQuiz: () => {
        const session = get().currentSession;
        if (!session) return;

        // Calculate score
        let correct = 0;
        session.questions.forEach((question) => {
          const userAnswer = session.answers[question.id];
          if (userAnswer === question.correctAnswer) {
            correct++;
          }
        });

        const incorrect = session.questions.length - correct;
        const percentage = Math.round(
          (correct / session.questions.length) * 100
        );

        // Calculate XP reward
        const baseXp = correct * 10;
        const bonusXp = percentage >= 80 ? Math.floor(baseXp * 0.5) : 0;
        const totalXp = baseXp + bonusXp;

        const completedSession: QuizSession = {
          ...session,
          endTime: new Date().toISOString(),
          isActive: false,
          score: {
            correct,
            incorrect,
            percentage,
          },
        };

        // Add XP to user
        addXp(totalXp);

        // Update state
        set({
          currentSession: null,
          quizHistory: [completedSession, ...get().quizHistory],
        });

        return completedSession;
      },

      resetQuiz: () => {
        set({
          currentSession: null,
        });
      },

      saveQuizSession: () => {
        const session = get().currentSession;
        if (!session) return;

        // In a real app, this would save to a backend
        localStorage.setItem(
          `quiz-session-${session.id}`,
          JSON.stringify(session)
        );
      },

      loadQuizHistory: async () => {
        set({ isLoading: true });

        try {
          // In a real app, this would load from a backend
          // For now, use mock data
          const mockHistory: QuizSession[] = [];

          set({
            quizHistory: mockHistory,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error loading quiz history:", error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "quiz-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        quizHistory: state.quizHistory,
        // Don't persist current session to avoid stale state
      }),
    }
  )
);

// Helper functions
export const getQuizStats = () => {
  const { quizHistory } = useQuizStore.getState();

  if (quizHistory.length === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0,
      accuracyTrend: [],
    };
  }

  const totalQuizzes = quizHistory.length;
  const scores = quizHistory.map((quiz) => quiz.score?.percentage || 0);
  const averageScore =
    scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const bestScore = Math.max(...scores);

  const totalTimeSpent = quizHistory.reduce((total, quiz) => {
    const timeValues = Object.values(quiz.timePerQuestion);
    return total + timeValues.reduce((sum, time) => sum + time, 0);
  }, 0);

  const accuracyTrend = quizHistory
    .slice(-10) // Last 10 quizzes
    .map((quiz) => quiz.score?.percentage || 0);

  return {
    totalQuizzes,
    averageScore: Math.round(averageScore),
    bestScore,
    totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
    accuracyTrend,
  };
};

export const getSpecialtyStats = () => {
  const { quizHistory } = useQuizStore.getState();

  const specialtyStats: Record<
    string,
    {
      attempted: number;
      accuracy: number;
      averageTime: number;
    }
  > = {};

  quizHistory.forEach((quiz) => {
    if (!specialtyStats[quiz.specialty]) {
      specialtyStats[quiz.specialty] = {
        attempted: 0,
        accuracy: 0,
        averageTime: 0,
      };
    }

    const stats = specialtyStats[quiz.specialty];
    stats.attempted++;

    if (quiz.score) {
      stats.accuracy =
        (stats.accuracy * (stats.attempted - 1) + quiz.score.percentage) /
        stats.attempted;
    }

    const timeValues = Object.values(quiz.timePerQuestion);
    const avgTime =
      timeValues.reduce((sum, time) => sum + time, 0) / timeValues.length;
    stats.averageTime =
      (stats.averageTime * (stats.attempted - 1) + avgTime) / stats.attempted;
  });

  return specialtyStats;
};
