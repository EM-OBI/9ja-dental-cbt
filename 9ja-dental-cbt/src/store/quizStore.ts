import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { QuizSession, QuizActions, Question } from "./types";
import { addXp, getCurrentUserId } from "./userStore";

interface QuizState {
  currentSession: QuizSession | null;
  isLoading: boolean;
}

type QuizStore = QuizState & QuizActions;

// Create a user-specific storage key
const getStorageKey = () => {
  const userId = getCurrentUserId();
  return userId ? `quiz-storage-${userId}` : "quiz-storage-guest";
};

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      isLoading: false,

      // Actions


      startQuiz: async (
        specialty: string,
        mode: "study" | "exam",
        questions: Question[] = []
      ) => {
        set({ isLoading: true });

        try {
          const userId = getCurrentUserId();
          if (!userId) {
            console.warn(
              "Attempted to start a quiz session without an authenticated user"
            );
            set({ isLoading: false });
            return;
          }

          const newSession: QuizSession = {
            id: `quiz-${Date.now()}`,
            userId,
            mode,
            specialty,
            questions,
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
        });

        return completedSession;
      },

      resetQuiz: () => {
        set({
          currentSession: null,
        });
      },


    }),
    {
      name: getStorageKey(),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Don't persist quiz history - fetched from API
        // Don't persist current session to avoid stale state
        // Actually, we might want to persist current session for page reloads?
        // The original code said "Don't persist current session".
        // I'll stick to that.
      }),
    }
  )
);
