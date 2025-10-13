/**
 * useQuizSession Hook
 * Manages quiz session lifecycle with API integration
 * Handles quiz start, progress tracking, and submission
 */

import { useState, useCallback } from "react";
import { QuizConfig, Question, Answer } from "@/types/definitions";

interface StartQuizResponse {
  sessionId: string;
  questions: Question[];
  config: QuizConfig;
}

interface SubmitQuizPayload {
  sessionId: string;
  userId: string;
  answers: Answer[];
  score: number;
  totalQuestions: number;
  timeSpent: number;
  specialtyId: string;
}

interface SubmitQuizResponse {
  sessionId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  timeTaken: number;
  results: Array<{
    questionId: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation?: string;
  }>;
  pointsEarned: number;
  xpEarned: number;
  resultId?: string;
  percentCorrect?: number;
  completedAt?: string;
  feedback?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

interface UseQuizSessionReturn {
  // State
  isStarting: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  startQuiz: (config: QuizConfig) => Promise<StartQuizResponse | null>;
  submitQuiz: (
    payload: SubmitQuizPayload
  ) => Promise<SubmitQuizResponse | null>;
  clearError: () => void;
}

export function useQuizSession(): UseQuizSessionReturn {
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = useCallback(
    async (
      config: QuizConfig & { userId?: string }
    ): Promise<StartQuizResponse | null> => {
      setIsStarting(true);
      setError(null);

      try {
        const response = await fetch("/api/quiz/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quizType: config.mode || "practice", // Map mode to quizType
            specialtyId: config.specialtyId, // Send specialty ID to backend
            questionCount: config.totalQuestions,
            timeLimit: config.timeLimit,
          }),
        });

        if (!response.ok) {
          const errorData = (await response
            .json()
            .catch(() => ({ error: "Unknown error" }))) as { error?: string };
          throw new Error(errorData.error || "Failed to start quiz");
        }

        const data = (await response.json()) as {
          sessionId: string;
          questions: Question[];
          seed?: string;
          specialtyName?: string;
        };

        return {
          sessionId: data.sessionId,
          questions: data.questions,
          config: {
            ...config,
            sessionId: data.sessionId,
            seed: data.seed,
            specialtyName: data.specialtyName || config.specialtyName,
          },
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start quiz";
        setError(errorMessage);
        console.error("[useQuizSession] Error starting quiz:", err);
        return null;
      } finally {
        setIsStarting(false);
      }
    },
    []
  );

  const submitQuiz = useCallback(
    async (payload: SubmitQuizPayload): Promise<SubmitQuizResponse | null> => {
      setIsSubmitting(true);
      setError(null);

      try {
        // Convert answers array to Record<questionId, answerIndex>
        const answersMap: Record<string, number> = {};
        payload.answers.forEach((answer) => {
          if (answer.selectedOption !== null) {
            answersMap[answer.questionId] = answer.selectedOption;
          }
        });

        const response = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: payload.sessionId,
            answers: answersMap,
            timeTaken: payload.timeSpent,
          }),
        });

        if (!response.ok) {
          const errorData = (await response
            .json()
            .catch(() => ({ error: "Unknown error" }))) as { error?: string };
          throw new Error(errorData.error || "Failed to submit quiz");
        }

        const data = (await response.json()) as {
          sessionId: string;
          score: number;
          correctAnswers: number;
          totalQuestions: number;
          passed: boolean;
          timeTaken: number;
          results: Array<{
            questionId: string;
            userAnswer: number;
            correctAnswer: number;
            isCorrect: boolean;
            explanation?: string;
          }>;
          pointsEarned: number;
          xpEarned: number;
        };

        // Return full API response
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to submit quiz";

        setError(errorMessage);
        console.error("[useQuizSession] Error submitting quiz:", err);
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isStarting,
    isSubmitting,
    error,
    startQuiz,
    submitQuiz,
    clearError,
  };
}
