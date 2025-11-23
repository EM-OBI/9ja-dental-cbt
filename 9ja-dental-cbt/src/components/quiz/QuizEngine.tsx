"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuizEngineStore } from "@/store/quizEngineStore";
import { useQuizAutoSave } from "@/hooks/useQuizAutoSave";
import { useUserStore } from "@/store/userStore";
import { QuizConfig } from "@/types/definitions";
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";

interface QuizEngineProps {
  config: QuizConfig;
  onExit: () => void;
}

export function QuizEngine({ config, onExit }: QuizEngineProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const { user } = useUserStore();

  const {
    shuffledQuestions,
    currentQuestionIndex,
    answers,
    score,
    timeRemaining,
    isActive,
    isSubmitting,
    isFinishing,
    hasSubmittedResults,
    bookmarkedQuestions,
    startQuiz,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    pauseQuiz,
    resumeQuiz,
    bookmarkQuestion,
    unbookmarkQuestion,
    finishQuiz,
  } = useQuizEngineStore();

  // Auto-save quiz progress
  useQuizAutoSave({
    userId: user?.id || "",
    sessionId: config?.sessionId || `temp-${Date.now()}`,
    enabled: !!config?.sessionId && !!user?.id,
    debounceMs: 2000,
  });

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const displaySpecialty = config.specialtyName || config.specialtyId;
  const progressBarRef = useRef<HTMLDivElement>(null);
  const existingAnswer = answers.find(
    (a) => a.questionId === currentQuestion?.id
  );
  const isBookmarked = currentQuestion
    ? bookmarkedQuestions.has(currentQuestion.id)
    : false;

  // Reset selected answer when question changes
  useEffect(() => {
    if (existingAnswer) {
      setSelectedAnswer(existingAnswer.selectedOption);
      if (config.mode === "practice") {
        setShowExplanation(true);
      }
    } else {
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  }, [currentQuestionIndex, existingAnswer, config.mode]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Only start timer if quiz is active and has a time limit
    if (isActive && timeRemaining !== null) {
      interval = setInterval(() => {
        useQuizEngineStore.getState().updateTimer();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeRemaining]);

  useEffect(() => {
    if (!progressBarRef.current || shuffledQuestions.length === 0) return;

    const progress =
      ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

    progressBarRef.current.style.width = `${progress}%`;
  }, [currentQuestionIndex, shuffledQuestions.length]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (existingAnswer || !isActive) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || existingAnswer || !isActive) return;

    submitAnswer(currentQuestion.id, selectedAnswer);

    if (config.mode === "practice") {
      setShowExplanation(true);
    } else {
      // Auto-advance in challenge/exam mode
      setTimeout(() => {
        nextQuestion();
      }, 1000);
    }
  };

  const handleNextQuestion = () => {
    nextQuestion();
  };

  const handlePreviousQuestion = () => {
    previousQuestion();
  };

  const handleBookmark = () => {
    if (isBookmarked) {
      unbookmarkQuestion(currentQuestion.id);
    } else {
      bookmarkQuestion(currentQuestion.id);
    }
  };

  const handleFinishQuiz = () => {
    if (isFinishing || hasSubmittedResults) {
      return;
    }

    finishQuiz();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getOptionIcon = (optionIndex: number) => {
    if (!existingAnswer) return null;

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const isSelected = optionIndex === existingAnswer.selectedOption;

    if (isCorrect) {
      return <span className="text-xs font-medium">✓</span>;
    }

    if (isSelected && !isCorrect) {
      return <span className="text-xs font-medium">✗</span>;
    }

    return null;
  };

  const getOptionClassName = (optionIndex: number) => {
    const baseClasses = `
      w-full p-4 text-left border-2 rounded-lg transition-all
      hover:border-slate-300 dark:hover:border-border focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-ring
    `;

    if (existingAnswer) {
      const isCorrect = optionIndex === currentQuestion.correctAnswer;
      const isSelected = optionIndex === existingAnswer.selectedOption;

      if (isCorrect) {
        return `${baseClasses} border-slate-900 dark:border-ring bg-slate-50 dark:bg-card text-slate-900 dark:text-foreground`;
      }

      if (isSelected && !isCorrect) {
        return `${baseClasses} border-slate-400 dark:border-border bg-slate-50 dark:bg-card/80 text-slate-600 dark:text-muted-foreground`;
      }

      return `${baseClasses} border-slate-200 dark:border-border text-slate-500 dark:text-muted-foreground`;
    }

    if (selectedAnswer === optionIndex) {
      return `${baseClasses} border-slate-900 dark:border-ring bg-slate-50 dark:bg-card text-slate-900 dark:text-foreground`;
    }

    return `${baseClasses} border-slate-200 dark:border-border text-slate-900 dark:text-foreground bg-white dark:bg-card`;
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-full bg-transparent p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Loading questions...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Start quiz if not active
  if (!isActive && currentQuestionIndex === 0) {
    return (
      <div className="min-h-full bg-transparent p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-card rounded-lg border border-slate-200 dark:border-border p-8">
            <div className="text-center space-y-6">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-foreground">
                {config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}{" "}
                Mode
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-slate-50 dark:bg-card/80 p-4 rounded-lg border border-slate-200 dark:border-border">
                  <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Questions
                  </div>
                  <div className="text-xl font-semibold text-slate-900 dark:text-foreground">
                    {shuffledQuestions.length}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-card/80 p-4 rounded-lg border border-slate-200 dark:border-border">
                  <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Specialty
                  </div>
                  <div className="text-xl font-semibold text-slate-900 dark:text-foreground">
                    {displaySpecialty}
                  </div>
                </div>

                {config.timeLimit && (
                  <div className="bg-slate-50 dark:bg-card/80 p-4 rounded-lg border border-slate-200 dark:border-border">
                    <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Time Limit
                    </div>
                    <div className="text-xl font-semibold text-slate-900 dark:text-foreground">
                      {Math.floor(config.timeLimit / 60)}m
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={startQuiz}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4" />
                <span>Start Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-card rounded-lg border border-slate-200 dark:border-border p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-foreground">
                {config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}{" "}
                Mode
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {displaySpecialty}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {timeRemaining !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="font-mono text-slate-900 dark:text-foreground">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={isActive ? pauseQuiz : resumeQuiz}
                  className="p-2 rounded-lg border border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-card transition-colors"
                >
                  {isActive ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  title="Exit Quiz"
                  aria-labelledby="exit-quiz-button"
                  onClick={onExit}
                  className="p-2 rounded-lg border border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-card transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>
                Question {currentQuestionIndex + 1} of{" "}
                {shuffledQuestions.length}
              </span>
              <span>Score: {score}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                ref={progressBarRef}
                className="bg-primary h-1.5 rounded-full transition-all"
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-card rounded-lg border border-slate-200 dark:border-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
                  Question {currentQuestionIndex + 1} of{" "}
                  {shuffledQuestions.length}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                  {currentQuestion.difficulty}
                </span>
              </div>

              <h2 className="text-lg font-medium text-slate-900 dark:text-foreground leading-relaxed">
                {currentQuestion.text}
              </h2>
            </div>

            <button
              onClick={handleBookmark}
              className={`ml-4 p-2 rounded-lg border transition-colors ${isBookmarked
                  ? "border-slate-900 dark:border-ring bg-slate-50 dark:bg-card"
                  : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-ring"
                }`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Question Image */}
          {currentQuestion.imageUrl && (
            <div className="mb-6">
              <Image
                src={currentQuestion.imageUrl}
                alt="Question illustration"
                className="max-w-full h-auto rounded-lg border border-border"
              />
            </div>
          )}

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={!!existingAnswer || !isActive}
                className={getOptionClassName(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-left">{option}</span>
                  </div>
                  {getOptionIcon(index)}
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!existingAnswer && selectedAnswer !== null && isActive && (
            <div className="flex justify-center mb-6">
              <button
                onClick={handleSubmitAnswer}
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground disabled:bg-slate-300 dark:disabled:bg-muted text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          )}

          {/* Explanation */}
          {showExplanation && existingAnswer && currentQuestion.explanation && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-card/80 rounded-lg border border-slate-200 dark:border-border">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-foreground mb-2">
                {existingAnswer.isCorrect ? "Correct" : "Incorrect"}
              </h4>
              {!existingAnswer.isCorrect && (
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Correct answer:{" "}
                  <strong>
                    {currentQuestion.options[currentQuestion.correctAnswer]}
                  </strong>
                </p>
              )}
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Practice Mode Next Button */}
          {config.mode === "practice" && existingAnswer && showExplanation && (
            <div className="flex justify-center mb-6">
              <button
                onClick={
                  currentQuestionIndex === shuffledQuestions.length - 1
                    ? handleFinishQuiz
                    : handleNextQuestion
                }
                disabled={isFinishing || hasSubmittedResults}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground disabled:bg-slate-300 dark:disabled:bg-muted text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                {currentQuestionIndex === shuffledQuestions.length - 1
                  ? isFinishing
                    ? "Finishing..."
                    : hasSubmittedResults
                      ? "Finished"
                      : "Finish Quiz"
                  : "Next Question"}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-border">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {config.mode !== "practice" && (
              <button
                onClick={
                  currentQuestionIndex === shuffledQuestions.length - 1
                    ? handleFinishQuiz
                    : handleNextQuestion
                }
                disabled={!existingAnswer || isFinishing || hasSubmittedResults}
                className="px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 dark:text-primary-foreground disabled:bg-slate-300 dark:disabled:bg-muted text-white rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>
                  {currentQuestionIndex === shuffledQuestions.length - 1
                    ? isFinishing
                      ? "Finishing..."
                      : hasSubmittedResults
                        ? "Finished"
                        : "Finish"
                    : "Next"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
