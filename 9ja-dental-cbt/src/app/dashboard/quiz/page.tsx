"use client";

import React, { useState, useEffect } from "react";
import { QuizSetup } from "@/components/quiz/QuizSetup";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { QuizResults } from "@/components/quiz/QuizResults";
import { useQuizEngineStore } from "@/store/quizEngineStore";
import { generateQuizSeed } from "@/utils/shuffle";
import { QuizConfig, Question } from "@/types/definitions";
import { ErrorAlert } from "@/components/ui/ErrorAlert";

export default function QuizPage() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizError, setQuizError] = useState<{
    message: string;
    severity?: "error" | "warning";
  } | null>(null);

  const { session, initializeQuiz, resetQuiz, loadProgress } =
    useQuizEngineStore();

  // Specialties data for quiz setup
  const [specialtiesData, setSpecialtiesData] = useState<
    Array<{
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
          data?: Array<{ name: string; questionCount: number }>;
          error?: string;
        };

        if (result.success && result.data) {
          // Map API data to component format
          const mapped = result.data.map((specialty) => ({
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

  // Check for saved progress on mount
  useEffect(() => {
    const hasSavedProgress = loadProgress();
    if (hasSavedProgress) {
      console.log("Found saved progress");
      // Optionally show a dialog to resume
      setIsSetupComplete(true);
    }
  }, [loadProgress]);

  const handleStartQuiz = async (config: QuizConfig) => {
    setIsLoading(true);
    setQuizError(null); // Clear previous errors
    try {
      // Fetch questions directly from the questions API
      const queryParams = new URLSearchParams();

      if (config.specialty && config.specialty !== "All Specialties") {
        // Convert specialty name to slug (lowercase, replace spaces with hyphens)
        const specialtySlug = config.specialty
          .toLowerCase()
          .replace(/\s+/g, "-");
        queryParams.append("specialtySlug", specialtySlug);
      }

      // Request more questions than needed to allow for shuffling
      queryParams.append(
        "limit",
        String(Math.max(config.totalQuestions * 3, 50))
      );
      queryParams.append("isActive", "true");

      const response = await fetch(`/api/questions?${queryParams.toString()}`);
      const questionsData = (await response.json()) as {
        success: boolean;
        data?: Question[];
        error?: string;
      };

      if (
        !questionsData.success ||
        !questionsData.data ||
        questionsData.data.length === 0
      ) {
        console.error("No questions available for selected specialty");
        setQuizError({
          message:
            "No questions available for the selected specialty. Please try a different specialty.",
          severity: "warning",
        });
        return;
      }

      const availableQuestions = questionsData.data;

      if (availableQuestions.length < config.totalQuestions) {
        console.warn(
          `Requested ${config.totalQuestions} questions but only ${availableQuestions.length} available.`
        );
      }

      // Shuffle questions using Fisher-Yates algorithm
      const shuffledQuestions = [...availableQuestions];
      for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [
          shuffledQuestions[j],
          shuffledQuestions[i],
        ];
      }

      // Take only the number of questions requested
      const questionCount = Math.min(
        config.totalQuestions,
        shuffledQuestions.length
      );
      const questionsToUse = shuffledQuestions.slice(0, questionCount);

      // Generate a session ID
      const sessionId = `session-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const seed = generateQuizSeed();
      const configWithSeed: QuizConfig = {
        ...config,
        seed,
        timeLimit: config.timeLimit,
        totalQuestions: questionCount,
        quizId: `quiz-${config.specialty}-${Date.now()}`,
        sessionId,
      };

      initializeQuiz(questionsToUse, configWithSeed);
      setQuizConfig(configWithSeed);
      setIsSetupComplete(true);

      // Start the quiz immediately to avoid double start buttons
      setTimeout(() => {
        useQuizEngineStore.getState().startQuiz();
      }, 0);
    } catch (error) {
      console.error("Failed to start quiz:", error);
      setQuizError({
        message: "Failed to load quiz questions. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartQuiz = () => {
    resetQuiz();
    setIsSetupComplete(false);
    setQuizConfig(null);
    setIsLoading(false);
  };

  // Show results if quiz is completed
  if (session?.endTime) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <QuizResults onRestart={handleRestartQuiz} />
      </div>
    );
  }

  // Show quiz engine if setup is complete and quiz config exists
  if (isSetupComplete && quizConfig) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <QuizEngine config={quizConfig} onExit={handleRestartQuiz} />
      </div>
    );
  }

  // Show quiz setup by default
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
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
        isLoading={isLoading}
        specialties={specialtiesData}
      />
    </div>
  );
}
