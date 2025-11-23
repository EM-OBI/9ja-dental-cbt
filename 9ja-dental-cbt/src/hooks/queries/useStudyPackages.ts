import { useQuery } from "@tanstack/react-query";

// Query Keys
export const STUDY_QUERY_KEYS = {
    packages: () => ['study', 'packages'] as const,
    package: (id: string) => ['study', 'package', id] as const,
    flashcards: () => ['study', 'flashcards'] as const,
};

// Types
export interface StudyPackage {
    id: string;
    topic: string;
    specialty?: string;
    createdAt: string;
    materials: {
        hasSummary: boolean;
        hasFlashcards: boolean;
        hasQuiz: boolean;
    };
    progress?: {
        summaryViewed: boolean;
        flashcardsCompleted: boolean;
        quizScore: number | null;
    };
}

export interface StudyMaterials {
    summary?: string;
    quiz?: {
        multipleChoice: Array<{
            question: string;
            options: string[];
            correctAnswer: number;
            explanation?: string;
        }>;
        trueFalse: Array<{
            question: string;
            options: string[];
            correctAnswer: number;
            explanation?: string;
        }>;
    };
}

export interface PackageDetails {
    id: string;
    topic: string;
    createdAt: string;
    specialty?: string;
}

export interface FlashcardSet {
    id: string;
    topic: string;
    cardCount: number;
    createdAt: string;
    cards: Array<{ front: string; back: string; hint?: string }>;
}

// API Response Types
interface PackagesApiResponse {
    packages: StudyPackage[];
}

interface PackageApiResponse {
    package: {
        id: string;
        topic: string;
        createdAt: string;
        specialty?: string;
    };
    materials: {
        summary?: {
            content: string;
        };
        quiz?: {
            content: {
                multipleChoice: Array<{
                    question: string;
                    options: string[];
                    correctAnswer: number;
                    explanation?: string;
                }>;
                trueFalse: Array<{
                    question: string;
                    options: string[];
                    correctAnswer: number;
                    explanation?: string;
                }>;
            };
        };
    };
}

interface FlashcardsApiResponse {
    sets: FlashcardSet[];
}

// Hooks

/**
 * Fetch all study packages for the library
 */
export function useStudyPackages() {
    return useQuery({
        queryKey: STUDY_QUERY_KEYS.packages(),
        queryFn: async () => {
            const response = await fetch("/api/study/packages");
            if (!response.ok) {
                throw new Error("Failed to load study packages");
            }
            const data = await response.json() as PackagesApiResponse;
            return data.packages || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

/**
 * Fetch a single study package by ID
 */
export function useStudyPackage(packageId: string | null) {
    return useQuery({
        queryKey: STUDY_QUERY_KEYS.package(packageId || ''),
        queryFn: async () => {
            if (!packageId) {
                throw new Error("No package ID provided");
            }

            const response = await fetch(`/api/study/materials/${packageId}`);
            if (!response.ok) {
                throw new Error("Failed to load study package");
            }

            const data = await response.json() as PackageApiResponse;

            return {
                packageDetails: {
                    id: data.package.id,
                    topic: data.package.topic,
                    createdAt: data.package.createdAt,
                    specialty: data.package.specialty,
                } as PackageDetails,
                materials: {
                    summary: data.materials.summary?.content,
                    quiz: data.materials.quiz?.content ? {
                        multipleChoice: data.materials.quiz.content.multipleChoice || [],
                        trueFalse: data.materials.quiz.content.trueFalse || [],
                    } : undefined,
                } as StudyMaterials,
            };
        },
        enabled: !!packageId,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

/**
 * Fetch all flashcard sets
 */
export function useFlashcardSets() {
    return useQuery({
        queryKey: STUDY_QUERY_KEYS.flashcards(),
        queryFn: async () => {
            const response = await fetch("/api/study/flashcards");
            if (!response.ok) {
                throw new Error("Failed to load flashcards");
            }
            const data = await response.json() as FlashcardsApiResponse;
            return data.sets || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}
