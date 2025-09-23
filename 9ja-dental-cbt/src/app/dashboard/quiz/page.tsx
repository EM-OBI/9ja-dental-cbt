"use client";

import React, { useState, useEffect } from "react";
import { QuizSetup } from "@/components/quiz/QuizSetup";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { QuizResults } from "@/components/quiz/QuizResults";
import { useQuizEngineStore } from "@/store/quizEngineStore";
import { databaseService } from "@/services/database";
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

  const handleStartQuiz = async (config: QuizConfig) => {
    try {
      // Get available quizzes for the selected specialty
      const quizzesResponse = await databaseService.getQuizzes({
        category:
          config.specialty === "All Specialties" ? undefined : config.specialty,
        limit: 50, // Get more questions than needed
      });

      if (quizzesResponse.data.length === 0) {
        console.error("No quizzes available for selected specialty");
        alert(
          "No quizzes available for the selected specialty. Please try a different specialty."
        );
        return;
      }

      // For now, we'll need to create mock questions from the quiz data
      // since the backend doesn't return actual question content yet
      const selectedQuiz = quizzesResponse.data[0];

      // Create placeholder questions based on the quiz metadata
      // This is temporary until the backend provides actual questions
      const questions = Array.from(
        {
          length: Math.min(config.totalQuestions, selectedQuiz.totalQuestions),
        },
        (_, index) => ({
          id: `q-${selectedQuiz.id}-${index + 1}`,
          text: `Sample question ${index + 1} for ${selectedQuiz.title}`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: `This is a sample explanation for question ${index + 1}`,
          specialty: selectedQuiz.category,
          difficulty: selectedQuiz.difficulty,
          type: "mcq" as const,
          timeEstimate: 60,
        })
      );

      if (questions.length === 0) {
        console.error("Could not generate questions for quiz");
        alert("Unable to generate questions for this quiz. Please try again.");
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
    } catch (error) {
      console.error("Failed to start quiz:", error);
      alert("Failed to load quiz questions. Please try again.");
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
