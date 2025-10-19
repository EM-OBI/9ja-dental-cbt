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
import { getCurrentUserId } from "./userStore";
import { useProgressStore } from "./progressStore";

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
  updateQuestionsWithResults: (
    results: Array<{
      questionId: string;
      correctAnswer: number;
      explanation?: string;
    }>
  ) => void;

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
  isFinishing: false,
  isLoading: false,
  hasSubmittedResults: false,
  bookmarkedQuestions: new Set(),
  wrongAnswers: new Set(),
  timeSpentPerQuestion: {},
  startTime: null,
  lastQuestionStartTime: null,
  seed: "",
};

const getSecureRandom = () => {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] / (0xffffffff + 1);
  }

  return Math.random();
};

const shuffleQuestionOptions = (question: Question, seed: string): Question => {
  const optionPairs = question.options.map((option, index) => ({
    option,
    originalIndex: index,
  }));

  const combinedSeed = `${seed}-${getSecureRandom()}`;
  const shuffledPairs = seededShuffle(optionPairs, combinedSeed);
  const updatedCorrectIndex = shuffledPairs.findIndex(
    (pair) => pair.originalIndex === question.correctAnswer
  );

  return {
    ...question,
    options: shuffledPairs.map((pair) => pair.option),
    correctAnswer:
      updatedCorrectIndex >= 0 ? updatedCorrectIndex : question.correctAnswer,
  };
};

const ensureDistinctCorrectIndex = (
  question: Question,
  previousIndex: number | null
): Question => {
  if (
    previousIndex === null ||
    question.correctAnswer !== previousIndex ||
    question.options.length <= 1
  ) {
    return question;
  }

  const optionsCopy = [...question.options];
  const swapPool = optionsCopy
    .map((_, idx) => idx)
    .filter((idx) => idx !== question.correctAnswer);
  const swapIndex =
    swapPool[Math.floor(getSecureRandom() * swapPool.length)] ?? 0;

  [optionsCopy[question.correctAnswer], optionsCopy[swapIndex]] = [
    optionsCopy[swapIndex],
    optionsCopy[question.correctAnswer],
  ];

  return {
    ...question,
    options: optionsCopy,
    correctAnswer: swapIndex,
  };
};

// Create a user-specific storage key
const getQuizEngineStorageKey = () => {
  const userId = getCurrentUserId();
  return userId ? `quiz-engine-${userId}` : "quiz-engine-guest";
};

export const useQuizEngineStore = create<QuizStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        initializeQuiz: (questions: Question[], config: QuizConfig) => {
          const seed = config.seed || `${Date.now()}-${Math.random()}`;
          let previousCorrectIndex: number | null = null;
          const questionsWithOptionShuffle = questions.map(
            (question, index) => {
              const shuffledQuestion = shuffleQuestionOptions(
                question,
                `${seed}-${question.id ?? index}`
              );
              const adjustedQuestion = ensureDistinctCorrectIndex(
                shuffledQuestion,
                previousCorrectIndex
              );
              previousCorrectIndex = adjustedQuestion.correctAnswer;
              return adjustedQuestion;
            }
          );
          const shuffledQuestions = seededShuffle(
            questionsWithOptionShuffle,
            seed
          );

          const session: QuizSession = {
            id: config.sessionId || `quiz-${Date.now()}`,
            quizId: config.quizId,
            mode: config.mode,
            timeLimit: config.timeLimit,
            specialty: config.specialtyName || config.specialtyId,
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
            isFinishing: false,
            isLoading: false,
            hasSubmittedResults: false,
            bookmarkedQuestions: new Set(),
            wrongAnswers: new Set(),
            timeSpentPerQuestion: {},
            startTime: null,
            lastQuestionStartTime: null,
            seed,
          });
        },

        shuffleQuestions: (seed?: string) => {
          const state = get();
          const newSeed = seed || `${Date.now()}-${Math.random()}`;
          let previousCorrectIndex: number | null = null;
          const optionShuffledQuestions = state.questions.map(
            (question, index) => {
              const shuffledQuestion = shuffleQuestionOptions(
                question,
                `${newSeed}-${question.id ?? index}`
              );
              const adjustedQuestion = ensureDistinctCorrectIndex(
                shuffledQuestion,
                previousCorrectIndex
              );
              previousCorrectIndex = adjustedQuestion.correctAnswer;
              return adjustedQuestion;
            }
          );
          const totalToUse =
            state.session?.totalQuestions ?? optionShuffledQuestions.length;
          const shuffled = seededShuffle(
            optionShuffledQuestions,
            newSeed
          ).slice(0, totalToUse);

          set({
            shuffledQuestions: shuffled,
            seed: newSeed,
            currentQuestionIndex: 0,
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

          if (!state.session) {
            console.warn(
              "Attempted to finish a quiz without an active session."
            );
            return;
          }

          if (state.isFinishing) {
            console.debug(
              "Quiz submission already in progress; ignoring duplicate finish request."
            );
            return;
          }

          if (state.hasSubmittedResults) {
            console.debug(
              "Quiz results already submitted; skipping duplicate finish call."
            );
            return;
          }

          if (!state.session.id) {
            console.warn(
              "Quiz session is missing an identifier; cannot submit results."
            );
            return;
          }

          const sessionId = state.session.id;

          const endTime = Date.now();
          const scoreBeforeSubmit = state.score;
          const correctAnswersLocal = state.answers.filter(
            (answer) => answer.isCorrect
          ).length;
          const totalQuestions = state.shuffledQuestions.length;
          const durationSeconds = state.startTime
            ? Math.max(0, Math.round((endTime - state.startTime) / 1000))
            : 0;

          console.log(
            "Quiz finished! Reason:",
            state.timeRemaining === 0 ? "Time expired" : "Manual finish"
          );

          const answersMap: Record<string, number> = {};
          state.answers.forEach((answer) => {
            if (answer.selectedOption !== null) {
              answersMap[answer.questionId] = answer.selectedOption;
            }
          });

          set({
            isActive: false,
            isFinishing: true,
          });

          void (async () => {
            try {
              const response = await fetch("/api/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId,
                  answers: answersMap,
                  timeTaken: durationSeconds,
                }),
              });

              if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                console.error(
                  "Failed to submit quiz results:",
                  errorText || response.statusText
                );

                if (response.status === 400 && errorText.includes("already")) {
                  set((current) => ({
                    session: current.session
                      ? { ...current.session, endTime }
                      : current.session,
                    hasSubmittedResults: true,
                  }));
                }
                return;
              }

              const result = (await response.json()) as {
                score?: number;
                correctAnswers?: number;
                totalQuestions?: number;
                pointsEarned?: number;
                xpEarned?: number;
              };

              set((current) => ({
                session: current.session
                  ? { ...current.session, endTime }
                  : current.session,
                score:
                  typeof result.score === "number"
                    ? result.score
                    : current.score,
                hasSubmittedResults: true,
              }));

              const progressStore = useProgressStore.getState();
              progressStore.updateStreak("quiz");
              progressStore.addActivity({
                type: "quiz",
                description: `Completed a quiz with ${
                  result.correctAnswers ?? correctAnswersLocal
                }/${result.totalQuestions ?? totalQuestions} correct answers`,
                points: result.pointsEarned ?? scoreBeforeSubmit,
              });
              progressStore.updateStats();

              const userId = getCurrentUserId();
              if (userId) {
                progressStore
                  .loadProgressFromDatabase(userId)
                  .catch((err) =>
                    console.error(
                      "[ProgressTracking] Failed to refresh progress store:",
                      err
                    )
                  );
              }
            } catch (error) {
              console.error("Error submitting quiz results:", error);
            } finally {
              set({ isFinishing: false });
            }
          })();
        },

        updateTimer: () => {
          const state = get();

          // Only update if quiz is active and has a time limit
          if (!state.isActive || state.timeRemaining === null) {
            return;
          }

          // If time is up, finish the quiz
          if (state.timeRemaining <= 0) {
            console.log("Timer expired! Auto-finishing quiz...");
            get().finishQuiz();
            return;
          }

          // Decrement timer
          set({ timeRemaining: state.timeRemaining - 1 });

          // Check again after decrementing in case we just hit 0
          const newState = get();
          if (newState.timeRemaining !== null && newState.timeRemaining <= 0) {
            console.log("Timer just reached zero! Auto-finishing quiz...");
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

        updateQuestionsWithResults: (
          results: Array<{
            questionId: string;
            correctAnswer: number;
            explanation?: string;
          }>
        ) => {
          const state = get();
          const updatedQuestions = state.shuffledQuestions.map((question) => {
            const result = results.find((r) => r.questionId === question.id);
            if (result) {
              return {
                ...question,
                correctAnswer: result.correctAnswer,
                explanation: result.explanation || question.explanation,
              };
            }
            return question;
          });
          set({ shuffledQuestions: updatedQuestions });
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
        name: getQuizEngineStorageKey(),
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
