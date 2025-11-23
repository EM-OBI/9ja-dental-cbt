import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DatabaseService } from "@/services/database";
import { ProgressStats } from "@/store/types";
import { QUERY_KEYS } from "@/lib/queryKeys";

const databaseService = new DatabaseService();

export const PROGRESS_QUERY_KEY = QUERY_KEYS.progress.all; // Backward compatibility

export function useProgress(userId?: string) {
    return useQuery({
        queryKey: QUERY_KEYS.progress.stats(userId),
        queryFn: async () => {
            if (!userId) throw new Error("User ID is required");
            return databaseService.getUserProgress(userId);
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useStreaks(userId?: string) {
    return useQuery({
        queryKey: QUERY_KEYS.progress.streaks(userId),
        queryFn: async () => {
            if (!userId) throw new Error("User ID is required");
            return databaseService.getUserStreak(userId);
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useUpdateProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            data,
        }: {
            userId: string;
            data: Partial<ProgressStats>;
        }) => {
            // This would be an API call to update progress
            // For now, we'll assume there's an endpoint or we just invalidate
            return Promise.resolve(data);
        },
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.progress.stats(userId),
            });
        },
    });
}
