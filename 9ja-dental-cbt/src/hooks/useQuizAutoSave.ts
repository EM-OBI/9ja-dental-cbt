import { useEffect, useRef, useCallback } from "react";
import { useQuizEngineStore } from "@/store/quizEngineStore";

import { Answer } from "@/types/definitions";

interface AutoSaveOptions {
  userId: string;
  sessionId: string;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook to automatically save quiz progress to the API
 * Saves answers and session state in real-time
 */
export function useQuizAutoSave({
  sessionId,
  enabled = true,
  debounceMs = 2000,
}: AutoSaveOptions) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>("");

  const { answers, currentQuestionIndex, timeRemaining, isActive } =
    useQuizEngineStore();

  const saveToAPI = useCallback(
    async (data: {
      answers: Answer[];
      currentQuestionIndex: number;
      timeRemaining: number | null;
    }) => {
      if (!enabled || !sessionId) return;

      try {
        // Save answer progress
        const response = await fetch(`/api/quiz-sessions/${sessionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: data.answers[data.answers.length - 1]?.questionId,
            answer: data.answers[data.answers.length - 1]?.selectedOption,
            timeRemaining: data.timeRemaining,
            currentQuestionIndex: data.currentQuestionIndex,
          }),
        });

        if (response.ok) {
          console.log("✅ Quiz progress auto-saved");
        } else {
          console.warn("⚠️ Failed to auto-save quiz progress");
        }
      } catch (error) {
        console.error("❌ Error auto-saving quiz:", error);
      }
    },
    [enabled, sessionId]
  );

  // Auto-save when answers change
  useEffect(() => {
    if (!enabled || !isActive) return;

    const currentState = JSON.stringify({
      answers,
      currentQuestionIndex,
      timeRemaining,
    });

    // Only save if state actually changed
    if (currentState === lastSaveRef.current) return;

    lastSaveRef.current = currentState;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save
    saveTimeoutRef.current = setTimeout(() => {
      saveToAPI({
        answers,
        currentQuestionIndex,
        timeRemaining,
      });
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    answers,
    currentQuestionIndex,
    timeRemaining,
    isActive,
    enabled,
    debounceMs,
    saveToAPI,
  ]);

  return {
    saveNow: () => saveToAPI({ answers, currentQuestionIndex, timeRemaining }),
  };
}
