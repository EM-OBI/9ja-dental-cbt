"use client";

import React, { useState, useEffect } from "react";
import { QuizSetup } from "@/components/quiz/QuizSetup";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { QuizResults } from "@/components/quiz/QuizResults";
import { useQuizEngineStore } from "@/store/quizEngineStore";
import { useUserStore } from "@/store/userStore";
import { useQuizSession } from "@/hooks/useQuizSession";
import { QuizConfig, Question } from "@/types/definitions";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { useSearchParams } from "next/navigation";

export default function QuizPage() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizError, setQuizError] = useState<{
    message: string;
    severity?: "error" | "warning";
  } | null>(null);

  const { user } = useUserStore();
  const { session, initializeQuiz, resetQuiz, loadProgress } =
    useQuizEngineStore();
  const searchParams = useSearchParams();
  const [loadedPackageId, setLoadedPackageId] = useState<string | null>(null);

  const {
    startQuiz: startQuizAPI,
    isStarting,
    error: apiError,
  } = useQuizSession();

  // Specialties data for quiz setup
  const [specialtiesData, setSpecialtiesData] = useState<
    Array<{
      id: string;
      name: string;
      questionCount: number;
      icon?: React.ReactNode;
    }>
  >([]);

  // Fetch specialties on mount
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const response = await fetch(
          "/api/specialties?includeQuestionCount=true"
        );
        const result = (await response.json()) as {
          success: boolean;
          data?: Array<{ id: string; name: string; questionCount: number }>;
          error?: string;
        };

        if (result.success && result.data) {
          // Map API data to component format
          const mapped = result.data.map((specialty) => ({
            id: specialty.id,
            name: specialty.name,
            questionCount: specialty.questionCount || 0,
            icon: undefined, // Icons will be handled in the component
          }));
          setSpecialtiesData(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch specialties:", error);
      }
    };

    loadSpecialties();
  }, []);

  // Check for API errors
  useEffect(() => {
    if (apiError) {
      setQuizError({
        message: apiError,
        severity: "error",
      });
    }
  }, [apiError]);

  // Check for saved progress on mount
  useEffect(() => {
    if (searchParams.get("packageId")) return;

    const hasSavedProgress = loadProgress();
    if (hasSavedProgress) {
      console.log("Found saved progress");
      // Optionally show a dialog to resume
      setIsSetupComplete(true);
    }
  }, [loadProgress, searchParams]);

  useEffect(() => {
    const packageId = searchParams.get("packageId");
    if (!packageId || packageId === loadedPackageId) {
      return;
    }

    const loadGeneratedQuiz = async () => {
      try {
        const response = await fetch(`/api/study/materials/${packageId}`);
        if (!response.ok) {
          throw new Error("Failed to load AI-generated quiz");
        }

        const result = (await response.json()) as {
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
        };

        if (result.success === false) {
          throw new Error("Quiz materials are unavailable");
        }

        const quizMaterial = result.materials?.quiz;
        type GeneratedQuestion = {
          question: string;
          options?: string[];
          correctIndex?: number;
          correctAnswer?: number;
          explanation?: string;
        };

        const content = quizMaterial?.content as
          | GeneratedQuestion[]
          | { questions?: GeneratedQuestion[] }
          | undefined;

        const rawQuestions: GeneratedQuestion[] = Array.isArray(content)
          ? content
          : content?.questions ?? [];

        if (!rawQuestions || rawQuestions.length === 0) {
          throw new Error("No quiz questions found for this study package");
        }

        resetQuiz();

        const mappedQuestions: Question[] = rawQuestions.map((q, index) => ({
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

        initializeQuiz(mappedQuestions, config);
        setQuizConfig(config);
        setIsSetupComplete(true);
        setLoadedPackageId(packageId);

        setTimeout(() => {
          useQuizEngineStore.getState().startQuiz();
        }, 0);
      } catch (error) {
        console.error("Failed to load AI-generated quiz:", error);
        setQuizError({
          message:
            error instanceof Error
              ? error.message
              : "Unable to load AI-generated quiz",
          severity: "error",
        });
      }
    };

    loadGeneratedQuiz();
  }, [
    searchParams,
    loadedPackageId,
    initializeQuiz,
    resetQuiz,
    setIsSetupComplete,
    setQuizConfig,
  ]);

  const handleStartQuiz = async (config: QuizConfig) => {
    if (!user?.id) {
      setQuizError({
        message: "Please log in to start a quiz",
        severity: "error",
      });
      return;
    }

    setQuizError(null); // Clear previous errors

    try {
      // Call the quiz start API
      const result = await startQuizAPI({
        ...config,
        userId: user.id,
      } as QuizConfig & { userId: string });

      if (!result) {
        // Error handled by useQuizSession
        return;
      }

      // Initialize the quiz engine store with questions from API
      initializeQuiz(result.questions, result.config);
      setQuizConfig(result.config);
      setIsSetupComplete(true);

      // Start the quiz immediately
      setTimeout(() => {
        useQuizEngineStore.getState().startQuiz();
      }, 0);
    } catch (error) {
      console.error("Failed to start quiz:", error);
      setQuizError({
        message: "Failed to start quiz. Please try again.",
        severity: "error",
      });
    }
  };

  const handleRestartQuiz = () => {
    resetQuiz();
    setIsSetupComplete(false);
    setQuizConfig(null);
  };

  // Show results if quiz is completed
  if (session?.endTime) {
    return (
      <div className="py-6 bg-slate-50 dark:bg-background">
        <QuizResults onRestart={handleRestartQuiz} />
      </div>
    );
  }

  // Show quiz engine if setup is complete and quiz config exists
  if (isSetupComplete && quizConfig) {
    return (
      <div className="py-6 bg-slate-50 dark:bg-background">
        <QuizEngine config={quizConfig} onExit={handleRestartQuiz} />
      </div>
    );
  }

  // Show quiz setup by default
  return (
    <div className="py-6 bg-slate-50 dark:bg-background">
      {quizError && (
        <div className="max-w-4xl mx-auto pt-6 px-4">
          <ErrorAlert
            message={quizError.message}
            severity={quizError.severity}
            onDismiss={() => setQuizError(null)}
          />
        </div>
      )}
      <QuizSetup
        onStartQuiz={handleStartQuiz}
        onRestartQuiz={handleRestartQuiz}
        isLoading={isStarting}
        specialties={specialtiesData}
      />
    </div>
  );
}
