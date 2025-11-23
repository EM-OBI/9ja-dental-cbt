import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StudySession } from "@/store/types";
import { databaseService } from "@/services/database";
import { QUERY_KEYS } from "@/lib/queryKeys";

export const STUDY_MATERIALS_QUERY_KEY = QUERY_KEYS.study.materials();
export const STUDY_HISTORY_QUERY_KEY = ["study", "history"]; // Keeping for backward compat if needed, but should migrate

export function useStudyMaterials() {
    return useQuery({
        queryKey: QUERY_KEYS.study.materials(),
        queryFn: () => databaseService.getStudyMaterials(),
    });
}

export function useStudyHistory(userId?: string) {
    return useQuery({
        queryKey: QUERY_KEYS.study.history(userId),
        queryFn: async () => {
            if (!userId) return [];
            return databaseService.getStudyHistory(userId);
        },
        enabled: !!userId,
    });
}

export function useSaveStudySession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (session: StudySession) => databaseService.saveStudySession(session),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.study.history(variables.userId),
            });
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.study.stats(variables.userId),
            });
        },
    });
}

export function useBookmarkMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (materialId: string) => databaseService.bookmarkMaterial(materialId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.study.materials() });
        },
    });
}

export function useUpdateProgress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ materialId, progress }: { materialId: string; progress: number }) =>
            databaseService.updateMaterialProgress(materialId, progress),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.study.materials() });
        },
    });
}

export function useUploadMaterial() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (material: Record<string, unknown>) => databaseService.uploadMaterial(material),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.study.materials() });
        },
    });
}
