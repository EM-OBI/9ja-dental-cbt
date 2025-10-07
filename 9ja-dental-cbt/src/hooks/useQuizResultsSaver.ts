import { useCallback } from "react";
import { Answer } from "@/types/definitions";

interface QuizResultData {
  sessionId: string;
  userId: string;
  answers: Answer[];
  score: number;
  totalQuestions: number;
  timeSpent: number;
  specialtyId?: string;
}

/**
 * Hook to save quiz results to the API when quiz is completed
 */
export function useQuizResultsSaver() {
  const saveResults = useCallback(async (data: QuizResultData) => {
    try {
      console.log("💾 Saving quiz results...", data);

      // Complete the quiz session
      const response = await fetch(`/api/quiz-sessions/${data.sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: data.answers.reduce((acc, answer) => {
            if (answer.selectedOption !== null) {
              acc[answer.questionId] = answer.selectedOption.toString();
            }
            return acc;
          }, {} as Record<string, string>),
          timeSpent: data.timeSpent,
        }),
      });

      if (response.ok) {
        const result = (await response.json()) as {
          success: boolean;
          data: unknown;
        };
        console.log("✅ Quiz results saved successfully", result);
        return {
          success: true,
          data: result.data,
        };
      } else {
        console.warn("⚠️ Failed to save quiz results:", response.status);
        return {
          success: false,
          error: "Failed to save results",
        };
      }
    } catch (error) {
      console.error("❌ Error saving quiz results:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }, []);

  return { saveResults };
}
