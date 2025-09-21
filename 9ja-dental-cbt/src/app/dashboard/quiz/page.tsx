"use client";

import React, { useState, useEffect } from "react";
import { QuizSetup } from "@/components/quiz/QuizSetup";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { QuizResults } from "@/components/quiz/QuizResults";
import { useQuizEngineStore } from "@/store/quizEngineStore";
import { mockQuestions, getQuestionsBySpecialty } from "@/data/mockData";
import { generateQuizSeed } from "@/utils/shuffle";
import { QuizConfig } from "@/types/definitions";

export default function QuizPage() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);

  const { session, isActive, initializeQuiz, resetQuiz, loadProgress } =
    useQuizEngineStore();

  // Check for saved progress on mount
  useEffect(() => {
    const hasSavedProgress = loadProgress();
    if (hasSavedProgress) {
      console.log("Found saved progress");
      // Optionally show a dialog to resume
      setIsSetupComplete(true);
    }
  }, [loadProgress]);

  const handleStartQuiz = (config: QuizConfig) => {
    // Get questions for the selected specialty
    const questions = getQuestionsBySpecialty(config.specialty);

    if (questions.length === 0) {
      console.error("No questions available for selected specialty");
      return;
    }

    // Generate seed for randomization
    const seed = generateQuizSeed();
    const configWithSeed = { ...config, seed };

    // Initialize the quiz
    initializeQuiz(questions, configWithSeed);
    setQuizConfig(configWithSeed);
    setIsSetupComplete(true);

    // Start the quiz immediately to avoid double start buttons
    setTimeout(() => {
      useQuizEngineStore.getState().startQuiz();
    }, 0);
  };

  const handleRestartQuiz = () => {
    resetQuiz();
    setIsSetupComplete(false);
    setQuizConfig(null);
  };

  // Show results if quiz is completed
  if (session?.endTime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <QuizResults onRestart={handleRestartQuiz} />
      </div>
    );
  }

  // Show quiz engine if setup is complete and quiz config exists
  if (isSetupComplete && quizConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <QuizEngine config={quizConfig} onExit={handleRestartQuiz} />
      </div>
    );
  }

  // Show quiz setup by default
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <QuizSetup
        onStartQuiz={handleStartQuiz}
        onRestartQuiz={handleRestartQuiz}
      />
    </div>
  );
}
