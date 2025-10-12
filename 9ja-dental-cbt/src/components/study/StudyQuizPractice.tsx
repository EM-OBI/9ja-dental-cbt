"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface StudyQuizPracticeProps {
  questions: QuizQuestion[];
  onClose?: () => void;
}

export function StudyQuizPractice({
  questions,
  onClose,
}: StudyQuizPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<
    Array<{ questionIndex: number; selectedIndex: number; isCorrect: boolean }>
  >([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (optionIndex: number) => {
    if (showExplanation) return; // Already answered
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    setAnswers([
      ...answers,
      { questionIndex: currentIndex, selectedIndex: selectedAnswer, isCorrect },
    ]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setIsComplete(false);
  };

  // Results View
  if (isComplete) {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-foreground mb-2">
            Quiz Complete!
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            You scored {correctCount} out of {questions.length} ({percentage}%)
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="text-center">
            <div className="text-6xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {percentage}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {percentage >= 80
                ? "Excellent work! 🎉"
                : percentage >= 60
                ? "Good job! Keep practicing 💪"
                : "Keep studying and try again 📚"}
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-foreground">
            Review:
          </h4>
          {answers.map((answer, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                answer.isCorrect
                  ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                  : "border-red-500 bg-red-50 dark:bg-red-950/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {answer.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-foreground mb-1">
                    Question {idx + 1}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {questions[answer.questionIndex].question}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleRestart}
            className="flex-1 bg-gray-950 hover:bg-gray-800 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-slate-300 dark:border-slate-600"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-950 dark:bg-slate-100 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQuestion.correctIndex;
            const showCorrectAnswer = showExplanation && isCorrect;
            const showWrongAnswer = showExplanation && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={showExplanation}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  showCorrectAnswer
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : showWrongAnswer
                    ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                    : isSelected
                    ? "border-gray-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                } ${showExplanation ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-900 dark:text-foreground">
                    {option}
                  </span>
                  {showCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                  {showWrongAnswer && (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && currentQuestion.explanation && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-foreground mb-1">
              Explanation:
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!showExplanation ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="flex-1 bg-gray-950 hover:bg-gray-800 text-white disabled:opacity-50"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNextQuestion}
            className="flex-1 bg-gray-950 hover:bg-gray-800 text-white"
          >
            {currentIndex < questions.length - 1 ? (
              <>
                Next Question
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              "View Results"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
