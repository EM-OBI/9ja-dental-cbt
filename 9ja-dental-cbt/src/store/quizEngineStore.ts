import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist } from "zustand/middleware";
import {
  Question,
  Answer,
  QuizSession,
  QuizState,
  QuizConfig,
} from "@/types/definitions";
import { seededShuffle } from "@/utils/shuffle";

export interface QuizActions {
  // Core actions
  initializeQuiz: (questions: Question[], config: QuizConfig) => void;
  startQuiz: () => void;
  submitAnswer: (questionId: string, selectedOption: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishQuiz: () => void;

  // Timer actions
  updateTimer: () => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;

  // Question management
  shuffleQuestions: (seed?: string) => void;
  bookmarkQuestion: (questionId: string) => void;
  unbookmarkQuestion: (questionId: string) => void;

  // State management
  resetQuiz: () => void;
  saveProgress: () => void;
  loadProgress: () => boolean;

  // Performance
  recordQuestionTime: (questionId: string, timeSpent: number) => void;
  preloadNextImage: () => void;

  // Navigation
  goToQuestion: (index: number) => void;
  skipQuestion: () => void;
}

type QuizStore = QuizState & QuizActions;

const initialState: QuizState = {
  questions: [],
  shuffledQuestions: [],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  timeRemaining: null,
  session: null,
  isActive: false,
  isSubmitting: false,
  isLoading: false,
  bookmarkedQuestions: new Set(),
  wrongAnswers: new Set(),
  timeSpentPerQuestion: {},
  startTime: null,
  lastQuestionStartTime: null,
  seed: "",
};

export const useQuizEngineStore = create<QuizStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        initializeQuiz: (questions: Question[], config: QuizConfig) => {
          const seed = config.seed || `${Date.now()}-${Math.random()}`;
          const shuffledQuestions = seededShuffle(questions, seed);

          const session: QuizSession = {
            id: `quiz-${Date.now()}`,
            mode: config.mode,
            timeLimit: config.timeLimit,
            specialty: config.specialty,
            totalQuestions: config.totalQuestions,
            startTime: Date.now(),
          };

          set({
            questions,
            shuffledQuestions: shuffledQuestions.slice(
              0,
              config.totalQuestions
            ),
            currentQuestionIndex: 0,
            answers: [],
            score: 0,
            timeRemaining: config.timeLimit,
            session,
            isActive: false,
            isSubmitting: false,
            isLoading: false,
            bookmarkedQuestions: new Set(),
            wrongAnswers: new Set(),
            timeSpentPerQuestion: {},
            startTime: null,
            lastQuestionStartTime: null,
            seed,
          });
        },

        startQuiz: () => {
          const now = Date.now();
          set({
            isActive: true,
            startTime: now,
            lastQuestionStartTime: now,
          });
        },

        submitAnswer: (questionId: string, selectedOption: number) => {
          const state = get();
          const question = state.shuffledQuestions.find(
            (q) => q.id === questionId
          );

          if (!question || state.isSubmitting) return;

          set({ isSubmitting: true });

          const timeSpent = state.lastQuestionStartTime
            ? Date.now() - state.lastQuestionStartTime
            : 0;

          const isCorrect = selectedOption === question.correctAnswer;

          const answer: Answer = {
            questionId,
            selectedOption,
            timeSpent,
            isCorrect,
            timestamp: Date.now(),
          };

          const newAnswers = [
            ...state.answers.filter((a) => a.questionId !== questionId),
            answer,
          ];
          const newScore = newAnswers.filter((a) => a.isCorrect).length * 10;
          const newWrongAnswers = new Set(state.wrongAnswers);

          if (!isCorrect) {
            newWrongAnswers.add(questionId);
          } else {
            newWrongAnswers.delete(questionId);
          }

          const newTimeSpent = {
            ...state.timeSpentPerQuestion,
            [questionId]: timeSpent,
          };

          set({
            answers: newAnswers,
            score: newScore,
            wrongAnswers: newWrongAnswers,
            timeSpentPerQuestion: newTimeSpent,
            isSubmitting: false,
          });
        },

        nextQuestion: () => {
          const state = get();
          if (state.currentQuestionIndex < state.shuffledQuestions.length - 1) {
            set({
              currentQuestionIndex: state.currentQuestionIndex + 1,
              lastQuestionStartTime: Date.now(),
            });

            // Preload next image
            get().preloadNextImage();
          } else {
            // Auto-finish when reaching the last question
            get().finishQuiz();
          }
        },

        previousQuestion: () => {
          const state = get();
          if (state.currentQuestionIndex > 0) {
            set({
              currentQuestionIndex: state.currentQuestionIndex - 1,
              lastQuestionStartTime: Date.now(),
            });
          }
        },

        goToQuestion: (index: number) => {
          const state = get();
          if (index >= 0 && index < state.shuffledQuestions.length) {
            set({
              currentQuestionIndex: index,
              lastQuestionStartTime: Date.now(),
            });
          }
        },

        skipQuestion: () => {
          get().nextQuestion();
        },

        finishQuiz: () => {
          const state = get();
          const endTime = Date.now();

          if (state.session) {
            const updatedSession = {
              ...state.session,
              endTime,
            };

            set({
              session: updatedSession,
              isActive: false,
            });
          }
        },

        updateTimer: () => {
          const state = get();
          if (
            state.timeRemaining !== null &&
            state.timeRemaining > 0 &&
            state.isActive
          ) {
            set({ timeRemaining: state.timeRemaining - 1 });
          } else if (state.timeRemaining === 0 && state.isActive) {
            get().finishQuiz();
          }
        },

        pauseQuiz: () => {
          set({ isActive: false });
        },

        resumeQuiz: () => {
          set({
            isActive: true,
            lastQuestionStartTime: Date.now(),
          });
        },

        shuffleQuestions: (seed?: string) => {
          const state = get();
          const newSeed = seed || `${Date.now()}-${Math.random()}`;
          const shuffled = seededShuffle(state.questions, newSeed);

          set({
            shuffledQuestions: shuffled,
            seed: newSeed,
            currentQuestionIndex: 0,
          });
        },

        bookmarkQuestion: (questionId: string) => {
          const state = get();
          const newBookmarks = new Set(state.bookmarkedQuestions);
          newBookmarks.add(questionId);
          set({ bookmarkedQuestions: newBookmarks });
        },

        unbookmarkQuestion: (questionId: string) => {
          const state = get();
          const newBookmarks = new Set(state.bookmarkedQuestions);
          newBookmarks.delete(questionId);
          set({ bookmarkedQuestions: newBookmarks });
        },

        resetQuiz: () => {
          set({
            ...initialState,
            bookmarkedQuestions: new Set(),
            wrongAnswers: new Set(),
          });
        },

        saveProgress: () => {
          // Progress is automatically saved via persist middleware
          console.log("Progress saved to localStorage");
        },

        loadProgress: (): boolean => {
          try {
            const stored = localStorage.getItem("quiz-engine-store");
            if (stored) {
              const parsedState = JSON.parse(stored);
              if (parsedState.state && parsedState.state.session) {
                return true;
              }
            }
            return false;
          } catch {
            return false;
          }
        },

        recordQuestionTime: (questionId: string, timeSpent: number) => {
          const state = get();
          set({
            timeSpentPerQuestion: {
              ...state.timeSpentPerQuestion,
              [questionId]: timeSpent,
            },
          });
        },

        preloadNextImage: () => {
          const state = get();
          const nextIndex = state.currentQuestionIndex + 1;
          const nextQuestion = state.shuffledQuestions[nextIndex];

          if (nextQuestion?.imageUrl) {
            const img = new Image();
            img.src = nextQuestion.imageUrl;
          }
        },
      }),
      {
        name: "quiz-engine-store",
        partialize: (state) => ({
          session: state.session,
          answers: state.answers,
          score: state.score,
          currentQuestionIndex: state.currentQuestionIndex,
          timeRemaining: state.timeRemaining,
          bookmarkedQuestions: Array.from(state.bookmarkedQuestions),
          wrongAnswers: Array.from(state.wrongAnswers),
          timeSpentPerQuestion: state.timeSpentPerQuestion,
          shuffledQuestions: state.shuffledQuestions,
          seed: state.seed,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Convert arrays back to Sets
            state.bookmarkedQuestions = new Set(
              Array.isArray(state.bookmarkedQuestions)
                ? state.bookmarkedQuestions
                : []
            );
            state.wrongAnswers = new Set(
              Array.isArray(state.wrongAnswers) ? state.wrongAnswers : []
            );
          }
        },
      }
    )
  )
);
