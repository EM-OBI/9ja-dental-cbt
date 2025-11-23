import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { QuizConfig, Question, Answer } from "@/types/definitions";
import { databaseService } from "@/services/database";

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
  const [error, setError] = useState<string | null>(null);

  const startMutation = useMutation({
    mutationFn: async (config: QuizConfig & { userId?: string }) => {
      const payload = {
        quizType: config.mode || "practice",
        specialtyId: config.specialtyId,
        questionCount: config.totalQuestions,
        timeLimit: config.timeLimit,
      };

      // API returns data directly, not wrapped in {success, data}
      const response = await fetch("/api/quiz/start", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(errorBody.error || `Failed to start quiz: ${response.statusText}`);
      }

      const data = await response.json() as {
        sessionId: string;
        questions: unknown[];
        quizType?: string;
        totalQuestions?: number;
        timeLimit?: number;
        specialtyName?: string;
      };

      return {
        sessionId: data.sessionId,
        questions: data.questions as Question[],
        config: {
          ...config,
          sessionId: data.sessionId,
          specialtyName: data.specialtyName || config.specialtyName,
        },
      } as StartQuizResponse;
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to start quiz");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: SubmitQuizPayload) => {
      // Convert answers array to Record<questionId, answerIndex>
      const answersMap: Record<string, number> = {};
      payload.answers.forEach((answer) => {
        if (answer.selectedOption !== null) {
          answersMap[answer.questionId] = answer.selectedOption;
        }
      });

      const data = await databaseService.submitQuiz({
        sessionId: payload.sessionId,
        answers: answersMap,
        timeTaken: payload.timeSpent,
      });

      return data as SubmitQuizResponse;
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
    },
  });

  const startQuiz = useCallback(
    async (config: QuizConfig & { userId?: string }) => {
      setError(null);
      try {
        return await startMutation.mutateAsync(config);
      } catch {
        // Error is handled in onError
        return null;
      }
    },
    [startMutation]
  );

  const submitQuiz = useCallback(
    async (payload: SubmitQuizPayload) => {
      setError(null);
      try {
        return await submitMutation.mutateAsync(payload);
      } catch {
        // Error is handled in onError
        return null;
      }
    },
    [submitMutation]
  );

  const clearError = useCallback(() => {
    setError(null);
    startMutation.reset();
    submitMutation.reset();
  }, [startMutation, submitMutation]);

  return {
    isStarting: startMutation.isPending,
    isSubmitting: submitMutation.isPending,
    error: error || (startMutation.error as Error)?.message || (submitMutation.error as Error)?.message || null,
    startQuiz,
    submitQuiz,
    clearError,
  };
}
