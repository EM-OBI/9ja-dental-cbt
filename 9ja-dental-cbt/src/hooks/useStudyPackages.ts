import { useCallback, useEffect, useState } from "react";

export type StudyPackageMaterialType = "summary" | "flashcards" | "quiz";

export interface StudyPackageSummary {
  id: string;
  topic: string;
  title?: string;
  specialty?: string;
  progress: number;
  hasSummary: boolean;
  hasFlashcards: boolean;
  flashcardCount: number;
  hasQuiz: boolean;
  quizScore: number | null;
  masteryLevel?: string;
  createdAt?: string;
  lastAccessed?: string;
  availableMaterialTypes: StudyPackageMaterialType[];
}

interface StudyPackagesResponse {
  success: boolean;
  data: Array<{
    id: string;
    topic?: string;
    title?: string;
    specialty?: string;
    progress?: number;
    hasSummary?: boolean;
    hasFlashcards?: boolean;
    flashcardCount?: number;
    hasQuiz?: boolean;
    quizScore?: number | null;
    masteryLevel?: string | number;
    uploadDate?: string;
    lastAccessed?: string;
  }>;
}

export function useStudyPackages() {
  const [packages, setPackages] = useState<StudyPackageSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/study/materials");
      if (!response.ok) {
        throw new Error("Failed to load study packages");
      }

      const payload = (await response.json()) as StudyPackagesResponse;
      if (!payload.success) {
        throw new Error("Unable to retrieve study packages");
      }

      const mapped: StudyPackageSummary[] = (payload.data || []).map((item) => {
        const materialTypes: StudyPackageMaterialType[] = [];
        if (item.hasSummary) materialTypes.push("summary");
        if (item.hasFlashcards) materialTypes.push("flashcards");
        if (item.hasQuiz) materialTypes.push("quiz");

        return {
          id: item.id,
          topic: item.topic || item.title || "Untitled",
          title: item.title,
          specialty: item.specialty,
          progress: item.progress ?? 0,
          hasSummary: Boolean(item.hasSummary),
          hasFlashcards: Boolean(item.hasFlashcards),
          flashcardCount: item.flashcardCount ?? 0,
          hasQuiz: Boolean(item.hasQuiz),
          quizScore: item.quizScore ?? null,
          masteryLevel:
            item.masteryLevel !== undefined
              ? String(item.masteryLevel)
              : undefined,
          createdAt: item.uploadDate,
          lastAccessed: item.lastAccessed,
          availableMaterialTypes: materialTypes,
        } satisfies StudyPackageSummary;
      });

      setPackages(mapped);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPackages();
  }, [fetchPackages]);

  return {
    packages,
    isLoading,
    error,
    refresh: fetchPackages,
  };
}
