/**
 * Custom Hook: useSpecialties
 * Fetches specialties list from API using TanStack Query
 */

import { useQuery } from "@tanstack/react-query";

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
  refetch: () => void;
}

async function fetchSpecialties(includeQuestionCount: boolean): Promise<Specialty[]> {
  const params = new URLSearchParams();
  if (includeQuestionCount) {
    params.append("includeQuestionCount", "true");
  }

  const url = `/api/specialties${params.toString() ? `?${params.toString()}` : ""
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
    return result.data;
  } else {
    throw new Error(result.error || "Failed to fetch specialties");
  }
}

export function useSpecialties(
  options: UseSpecialtiesOptions = {}
): UseSpecialtiesReturn {
  const { includeQuestionCount = false, enabled = true } = options;

  const {
    data: specialties = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["specialties", { includeQuestionCount }],
    queryFn: () => fetchSpecialties(includeQuestionCount),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
  });

  return {
    specialties,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}
