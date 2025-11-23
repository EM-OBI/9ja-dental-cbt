import { useQuery } from "@tanstack/react-query";
import { databaseService } from "@/services/database";
import { QuizFilters } from "@/types/dashboard";
import { QUERY_KEYS } from "@/lib/queryKeys";

export const QUIZ_KEYS = QUERY_KEYS.quiz.all; // Backward compatibility

export function useQuizzes(filters?: QuizFilters) {
    return useQuery({
        queryKey: QUERY_KEYS.quiz.list(filters),
        queryFn: () => databaseService.getQuizzes(filters),
    });
}

export function useDashboardStats(userId?: string) {
    return useQuery({
        queryKey: QUERY_KEYS.quiz.dashboardStats(userId),
        queryFn: () => databaseService.getDashboardStats(userId!),
        enabled: !!userId,
    });
}

export function useUserProgress(userId?: string) {
    return useQuery({
        queryKey: QUERY_KEYS.quiz.userProgress(userId),
        queryFn: () => databaseService.getUserProgress(userId!),
        enabled: !!userId,
    });
}
