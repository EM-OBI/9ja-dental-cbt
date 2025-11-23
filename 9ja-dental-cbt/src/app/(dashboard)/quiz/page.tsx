"use client";

import React from "react";
import { QuizSetup } from "@/components/quiz/QuizSetup";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { QuizResults } from "@/components/quiz/QuizResults";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { useQuizPageLogic } from "@/hooks/useQuizPageLogic";

export default function QuizPage() {
  const {
    isSetupComplete,
    quizConfig,
    quizError,
    specialtiesData,
    isStarting,
    session,
    handleStartQuiz,
    handleRestartQuiz,
    dismissError,
  } = useQuizPageLogic();

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
            onDismiss={dismissError}
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
