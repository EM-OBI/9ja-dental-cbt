"use client";

import React, { useState, useEffect } from "react";
import { useQuizEngineStore } from "@/store/quizEngineStore";
import { QuizConfig } from "@/types/definitions";
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Target,
  Trophy,
  BookOpen,
} from "lucide-react";

interface QuizEngineProps {
  config: QuizConfig;
  onExit: () => void;
}

export function QuizEngine({ config, onExit }: QuizEngineProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const {
    shuffledQuestions,
    currentQuestionIndex,
    answers,
    score,
    timeRemaining,
    isActive,
    isSubmitting,
    bookmarkedQuestions,
    session,
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

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
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

    if (isActive && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        useQuizEngineStore.getState().updateTimer();
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getModeIcon = () => {
    switch (config.mode) {
      case "practice":
        return <BookOpen className="w-5 h-5" />;
      case "challenge":
        return <Trophy className="w-5 h-5" />;
      case "exam":
        return <Target className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getModeColor = () => {
    switch (config.mode) {
      case "practice":
        return "text-green-600 dark:text-green-400";
      case "challenge":
        return "text-blue-600 dark:text-blue-400";
      case "exam":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getOptionIcon = (optionIndex: number) => {
    if (!existingAnswer) return null;

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const isSelected = optionIndex === existingAnswer.selectedOption;

    if (isCorrect) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }

    if (isSelected && !isCorrect) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }

    return null;
  };

  const getOptionClassName = (optionIndex: number) => {
    const baseClasses = `
      w-full p-4 text-left border-2 rounded-lg transition-all duration-200
      hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500
    `;

    if (existingAnswer) {
      const isCorrect = optionIndex === currentQuestion.correctAnswer;
      const isSelected = optionIndex === existingAnswer.selectedOption;

      if (isCorrect) {
        return `${baseClasses} border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100`;
      }

      if (isSelected && !isCorrect) {
        return `${baseClasses} border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100`;
      }

      return `${baseClasses} border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400`;
    }

    if (selectedAnswer === optionIndex) {
      return `${baseClasses} border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100`;
    }

    return `${baseClasses} border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100`;
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg text-gray-600 dark:text-gray-400">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-3">
                <div
                  className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${getModeColor()}`}
                >
                  {getModeIcon()}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}{" "}
                  Mode
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Questions
                  </div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {shuffledQuestions.length}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Specialty
                  </div>
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {config.specialty}
                  </div>
                </div>

                {config.timeLimit && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Time Limit
                    </div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {Math.floor(config.timeLimit / 60)}m
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={startQuiz}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                <span>Start Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${getModeColor()}`}
              >
                {getModeIcon()}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}{" "}
                  Mode
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {config.specialty}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {timeRemaining !== null && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="font-mono text-orange-500">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={isActive ? pauseQuiz : resumeQuiz}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {isActive ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={onExit}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>
                Progress: {currentQuestionIndex + 1} of{" "}
                {shuffledQuestions.length}
              </span>
              <span>Score: {score}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / shuffledQuestions.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">
                  Question {currentQuestionIndex + 1} of{" "}
                  {shuffledQuestions.length}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    currentQuestion.difficulty === "easy"
                      ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : currentQuestion.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                {currentQuestion.text}
              </h2>
            </div>

            <button
              onClick={handleBookmark}
              className={`ml-4 p-2 rounded-lg transition-colors duration-200 ${
                isBookmarked
                  ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                  : "bg-gray-100 text-gray-400 dark:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Question Image */}
          {currentQuestion.imageUrl && (
            <div className="mb-6">
              <img
                src={currentQuestion.imageUrl}
                alt="Question illustration"
                className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
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
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          )}

          {/* Explanation */}
          {showExplanation && existingAnswer && currentQuestion.explanation && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    existingAnswer.isCorrect
                      ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {existingAnswer.isCorrect ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    {existingAnswer.isCorrect ? "Correct!" : "Incorrect"}
                  </h4>
                  {!existingAnswer.isCorrect && (
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      The correct answer is:{" "}
                      <strong>
                        {currentQuestion.options[currentQuestion.correctAnswer]}
                      </strong>
                    </p>
                  )}
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Practice Mode Next Button */}
          {config.mode === "practice" && existingAnswer && showExplanation && (
            <div className="flex justify-center mb-6">
              <button
                onClick={handleNextQuestion}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                {currentQuestionIndex === shuffledQuestions.length - 1
                  ? "Finish Quiz"
                  : "Next Question"}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {config.mode !== "practice" && (
              <button
                onClick={
                  currentQuestionIndex === shuffledQuestions.length - 1
                    ? finishQuiz
                    : handleNextQuestion
                }
                disabled={!existingAnswer}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <span>
                  {currentQuestionIndex === shuffledQuestions.length - 1
                    ? "Finish"
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
