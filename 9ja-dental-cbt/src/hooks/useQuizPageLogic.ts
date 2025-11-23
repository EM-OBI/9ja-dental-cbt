import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuizEngineStore } from "@/store/quizEngineStore";
import { useUserStore } from "@/store/userStore";
import { useQuizSession } from "@/hooks/useQuizSession";
import { useSpecialties } from "@/hooks/useSpecialties";
import { useStudyMaterialQuiz } from "@/hooks/queries/useStudyMaterialQuiz";
import { QuizConfig } from "@/types/definitions";

export function useQuizPageLogic() {
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
    const [quizError, setQuizError] = useState<{
        message: string;
        severity?: "error" | "warning";
    } | null>(null);

    const { user } = useUserStore();
    const { session, initializeQuiz, resetQuiz, loadProgress } = useQuizEngineStore();
    const searchParams = useSearchParams();
    const {
        startQuiz: startQuizAPI,
        isStarting,
        error: apiError,
    } = useQuizSession();

    // Fetch specialties using TanStack Query
    const { specialties } = useSpecialties({
        includeQuestionCount: true,
    });

    const specialtiesData = specialties.map((specialty) => ({
        id: specialty.id,
        name: specialty.name,
        questionCount: specialty.questionCount || 0,
        icon: undefined,
    }));

    // Get packageId from URL params
    const packageId = searchParams.get("packageId");

    // Fetch AI-generated quiz using TanStack Query
    const {
        data: studyMaterialData,
        error: studyMaterialError,
        isLoading: isLoadingStudyMaterial,
    } = useStudyMaterialQuiz(packageId);

    // Handle study material quiz data when it loads
    useMemo(() => {
        if (studyMaterialData && packageId && !isSetupComplete) {
            resetQuiz();
            initializeQuiz(studyMaterialData.questions, studyMaterialData.config);
            setQuizConfig(studyMaterialData.config);
            setIsSetupComplete(true);

            // Start quiz after initialization
            setTimeout(() => {
                useQuizEngineStore.getState().startQuiz();
            }, 0);
        }
    }, [studyMaterialData, packageId, isSetupComplete, initializeQuiz, resetQuiz]);

    // Handle study material errors
    useMemo(() => {
        if (studyMaterialError) {
            setQuizError({
                message: studyMaterialError instanceof Error
                    ? studyMaterialError.message
                    : "Unable to load AI-generated quiz",
                severity: "error",
            });
        }
    }, [studyMaterialError]);

    // Handle API errors from quiz session
    useMemo(() => {
        if (apiError) {
            setQuizError({
                message: apiError,
                severity: "error",
            });
        }
    }, [apiError]);

    // Check for saved progress (only when not loading from packageId)
    useMemo(() => {
        if (!packageId && !isSetupComplete) {
            const hasSavedProgress = loadProgress();
            if (hasSavedProgress) {
                setIsSetupComplete(true);
            }
        }
    }, [packageId, isSetupComplete, loadProgress]);

    const handleStartQuiz = useCallback(async (config: QuizConfig) => {
        if (!user?.id) {
            setQuizError({ message: "Please log in to start a quiz", severity: "error" });
            return;
        }

        setQuizError(null);

        try {
            const result = await startQuizAPI({ ...config, userId: user.id } as QuizConfig & { userId: string });
            if (!result) return;

            initializeQuiz(result.questions, result.config);
            setQuizConfig(result.config);
            setIsSetupComplete(true);

            setTimeout(() => {
                useQuizEngineStore.getState().startQuiz();
            }, 0);
        } catch (error) {
            console.error("Failed to start quiz:", error);
            setQuizError({ message: "Failed to start quiz. Please try again.", severity: "error" });
        }
    }, [user, startQuizAPI, initializeQuiz]);

    const handleRestartQuiz = useCallback(() => {
        resetQuiz();
        setIsSetupComplete(false);
        setQuizConfig(null);
        setQuizError(null);
    }, [resetQuiz]);

    const dismissError = useCallback(() => setQuizError(null), []);

    return {
        isSetupComplete,
        quizConfig,
        quizError,
        specialtiesData,
        isStarting: isStarting || isLoadingStudyMaterial,
        session,
        handleStartQuiz,
        handleRestartQuiz,
        dismissError,
    };
}
