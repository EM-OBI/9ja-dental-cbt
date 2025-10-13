import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { QuizSession, QuizActions } from "./types";
import { addXp, getCurrentUserId } from "./userStore";

interface QuizState {
  currentSession: QuizSession | null;
  // questions removed - fetched when quiz starts
  // quizHistory removed - now fetched from API
  // availableSpecialties removed - fetch from API
  isLoading: boolean;
}

type QuizStore = QuizState & QuizActions;

// Questions will be loaded from the API instead of mock data
// Specialties will be loaded from the API

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
      // questions removed - fetched when quiz starts
      // quizHistory removed - now fetched from API
      // availableSpecialties removed - fetch from API
      isLoading: false,

      // Actions
      // fetchSpecialties removed - fetch from /api/specialties instead
      fetchSpecialties: async () => {
        // Deprecated - use API hook instead
        console.warn("fetchSpecialties is deprecated - use /api/specialties");
      },

      startQuiz: async (
        specialty: string,
        mode: "study" | "exam",
        questionCount: number = 10 // Will be used in API call
      ) => {
        set({ isLoading: true });

        try {
          // TODO: Fetch questions from API instead of from store
          // Call /api/quiz/start with specialty, mode, questionCount
          // For now, create empty session
          console.warn(
            "startQuiz needs to call API - questions no longer in store",
            {
              specialty,
              mode,
              questionCount,
            }
          );

          const userId = getCurrentUserId();
          if (!userId) {
            console.warn(
              "Attempted to start a quiz session without an authenticated user"
            );
            set({ isLoading: false });
            return;
          }

          // Placeholder - replace with API call
          const newSession: QuizSession = {
            id: `quiz-${Date.now()}`,
            userId,
            mode,
            specialty,
            questions: [], // Will be fetched from API
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
          // quizHistory removed - no longer stored in Zustand
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

      // loadQuizHistory removed - use API hook instead
      // History is now fetched from /api/quiz/history with pagination

      // loadQuestionsFromDatabase removed - questions fetched when quiz starts
      // loadQuizQuestionsById removed - use API instead
    }),
    {
      name: getStorageKey(),
      storage: createJSONStorage(() => localStorage),
      partialize: () => ({
        // Don't persist quiz history - fetched from API
        // Don't persist current session to avoid stale state
      }),
    }
  )
);

// Helper functions removed - use API hooks instead
// Use /api/quiz/history for quiz stats
// Use /api/users/stats for user statistics
