import { QuizFilters } from "@/types/dashboard";

export const QUERY_KEYS = {
    user: {
        all: ["user"] as const,
        profile: (userId?: string) => ["user", "profile", userId] as const,
        preferences: (userId?: string) => ["user", "preferences", userId] as const,
    },
    study: {
        all: ["study"] as const,
        materials: () => ["study", "materials"] as const,
        history: (userId?: string) => ["study", "history", userId] as const,
        stats: (userId?: string) => ["study", "stats", userId] as const,
    },
    quiz: {
        all: ["quiz"] as const,
        list: (filters?: QuizFilters) => ["quiz", "list", filters] as const,
        history: (userId?: string) => ["quiz", "history", userId] as const,
        stats: (userId?: string) => ["quiz", "stats", userId] as const,
        dashboardStats: (userId?: string) => ["quiz", "dashboardStats", userId] as const,
        userProgress: (userId?: string) => ["quiz", "userProgress", userId] as const,
    },
    progress: {
        all: ["progress"] as const,
        stats: (userId?: string) => ["progress", "stats", userId] as const,
        streaks: (userId?: string) => ["progress", "streaks", userId] as const,
    },
};
