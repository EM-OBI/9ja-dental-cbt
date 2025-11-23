/**
 * Custom Hook: useSpecialties
 * Fetches specialties list from API
 * Implements client-side caching
 */

import { useState, useEffect, useCallback } from "react";

interface Specialty {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  questionCount?: number;
}

interface UseSpecialtiesOptions {
  includeQuestionCount?: boolean;
  enabled?: boolean;
}

interface UseSpecialtiesReturn {
  specialties: Specialty[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSpecialties(
  options: UseSpecialtiesOptions = {}
): UseSpecialtiesReturn {
  const { includeQuestionCount = false, enabled = true } = options;

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (includeQuestionCount) {
        params.append("includeQuestionCount", "true");
      }

      const url = `/api/specialties${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch specialties");
      }

      const result = (await response.json()) as {
        success: boolean;
        data?: Specialty[];
        error?: string;
      };

      if (result.success && result.data) {
        setSpecialties(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch specialties");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("[useSpecialties] Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, includeQuestionCount]);

  const refetch = useCallback(async () => {
    await fetchSpecialties();
  }, [fetchSpecialties]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchSpecialties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, includeQuestionCount]);

  return {
    specialties,
    isLoading,
    error,
    refetch,
  };
}
