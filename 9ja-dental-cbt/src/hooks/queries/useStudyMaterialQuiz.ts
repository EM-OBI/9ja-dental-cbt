import { useQuery } from "@tanstack/react-query";
import { Question, QuizConfig } from "@/types/definitions";

interface StudyMaterialResponse {
    success?: boolean;
    package?: { topic?: string };
    materials?: {
        quiz?: {
            content?:
            | Array<{
                question: string;
                options?: string[];
                correctIndex?: number;
                correctAnswer?: number;
                explanation?: string;
            }>
            | {
                questions?: Array<{
                    question: string;
                    options?: string[];
                    correctIndex?: number;
                    correctAnswer?: number;
                    explanation?: string;
                }>;
            };
        };
    };
}

interface RawQuestion {
    question: string;
    options?: string[];
    correctIndex?: number;
    correctAnswer?: number;
    explanation?: string;
}

interface ProcessedQuizData {
    questions: Question[];
    config: QuizConfig;
}

async function fetchStudyMaterialQuiz(packageId: string): Promise<ProcessedQuizData> {
    const response = await fetch(`/api/study/materials/${packageId}`);
    if (!response.ok) throw new Error("Failed to load AI-generated quiz");

    const result = await response.json() as StudyMaterialResponse;

    if (result.success === false) {
        throw new Error("Quiz materials are unavailable");
    }

    const quizMaterial = result.materials?.quiz;
    const content = quizMaterial?.content;
    const rawQuestions = Array.isArray(content) ? content : content?.questions ?? [];

    if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error("No quiz questions found for this study package");
    }

    const mappedQuestions: Question[] = rawQuestions.map((q: RawQuestion, index: number) => ({
        id: `${packageId}-${index}`,
        text: q.question,
        options: q.options ?? [],
        correctAnswer: q.correctIndex ?? q.correctAnswer ?? 0,
        explanation: q.explanation ?? "",
        specialty: result.package?.topic ?? "AI Study",
        difficulty: "medium",
        type: "mcq",
        timeEstimate: 60,
    }));

    const config: QuizConfig = {
        mode: "practice",
        timeLimit: null,
        specialtyId: packageId,
        specialtyName: result.package?.topic ?? "AI Study",
        totalQuestions: mappedQuestions.length,
        quizId: packageId,
        sessionId: `study-${packageId}-${Date.now()}`,
    };

    return { questions: mappedQuestions, config };
}

export function useStudyMaterialQuiz(packageId: string | null) {
    return useQuery({
        queryKey: ["study-material-quiz", packageId],
        queryFn: () => fetchStudyMaterialQuiz(packageId!),
        enabled: !!packageId,
        staleTime: 0, // Always fetch fresh data for quiz
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
        retry: 1,
    });
}
