import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { databaseService } from "@/services/database";
import { User, UserPreferences } from "@/store/types";
import { QUERY_KEYS } from "@/lib/queryKeys";

export const USER_QUERY_KEY = QUERY_KEYS.user.all; // Backward compatibility if needed

export function useUser(userId?: string) {
    return useQuery({
        queryKey: QUERY_KEYS.user.profile(userId),
        queryFn: async () => {
            if (!userId) return null;
            return databaseService.getUserById(userId);
        },
        enabled: !!userId,
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: string;
            data: Partial<User>;
        }) => {
            return databaseService.updateUser(id, data);
        },
        onSuccess: (data, variables) => {
            queryClient.setQueryData(QUERY_KEYS.user.profile(variables.id), data);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.profile(variables.id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.all });
        },
    });
}

export function useUpdateUserPreferences() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            preferences,
        }: {
            id: string;
            preferences: UserPreferences;
        }) => {
            return databaseService.updateUserPreferences(id, preferences);
        },
        onSuccess: (_, variables) => {
            // Optimistically update or invalidate
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.profile(variables.id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.preferences(variables.id) });
        },
    });
}
