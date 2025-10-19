"use client";

import React from "react";
import { useQuizEngineStore } from "@/store/quizEngineStore";
import { QuizStats } from "@/types/definitions";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

interface QuizResultsProps {
  onRestart: () => void;
}

export function QuizResults({ onRestart }: QuizResultsProps) {
  const {
    session,
    shuffledQuestions,
    answers,
    score,
    timeSpentPerQuestion,
    wrongAnswers,
  } = useQuizEngineStore();

  if (!session) {
    return (
      <div className="min-h-full bg-transparent p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              No quiz session found
            </div>
            <button
              onClick={onRestart}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-lg font-medium transition-colors"
            >
              Start New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalQuestions = shuffledQuestions.length;
  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const wrongAnswersCount = answers.filter((a) => !a.isCorrect).length;
  const skippedAnswers = totalQuestions - answers.length;
  const accuracy =
    totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const totalTime = Object.values(timeSpentPerQuestion).reduce(
    (sum, time) => sum + time,
    0
  );
  const averageTime = totalQuestions > 0 ? totalTime / totalQuestions : 0;

  // Calculate time bonus
  const timeBonus = score - correctAnswers * 10;

  const stats: QuizStats = {
    totalTime,
    averageTimePerQuestion: averageTime,
    correctAnswers,
    wrongAnswers: wrongAnswersCount,
    skippedAnswers,
    accuracy,
    timeBonus,
    finalScore: score,
  };

  const getPerformanceGrade = (
    accuracy: number
  ): { grade: string; message: string } => {
    if (accuracy >= 90) return { grade: "A+", message: "Excellent" };
    if (accuracy >= 80) return { grade: "A", message: "Great job" };
    if (accuracy >= 70) return { grade: "B", message: "Good work" };
    if (accuracy >= 60) return { grade: "C", message: "Keep practicing" };
    return { grade: "D", message: "More study needed" };
  };

  const performance = getPerformanceGrade(accuracy);

  return (
    <div className="min-h-full bg-transparent p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-foreground mb-2">
              Quiz Complete
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)}{" "}
              Mode • {session.specialty}
            </p>
            <div className="text-5xl font-bold text-slate-900 dark:text-foreground mb-2">
              {performance.grade}
            </div>
            <p className="text-base text-slate-600 dark:text-slate-400">
              {performance.message}
            </p>
          </div>

          {/* Main Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-border p-5 text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Correct Answers
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-border p-5 text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
                {accuracy.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Accuracy
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-border p-5 text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
                {stats.finalScore}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Final Score
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-border p-5 text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
                {averageTime.toFixed(1)}s
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Avg Time/Q
              </div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-border p-6 mb-8">
            <h3 className="text-base font-semibold text-slate-900 dark:text-foreground mb-6 text-center">
              Performance Breakdown
            </h3>

            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
                  {correctAnswers}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Correct
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
                  {wrongAnswersCount}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Wrong
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
                  {skippedAnswers}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Skipped
                </div>
              </div>
            </div>

            {/* Time Bonus */}
            {timeBonus > 0 && (
              <div className="text-center p-4 bg-white dark:bg-card rounded-lg border border-slate-200 dark:border-border">
                <div className="text-slate-900 dark:text-foreground text-base font-semibold">
                  Time Bonus: +{timeBonus} points
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Earned for quick and accurate answers
                </div>
              </div>
            )}
          </div>

          {/* Wrong Answers Review */}
          {wrongAnswers.size > 0 && session.mode !== "practice" && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-border p-6 mb-8">
              <h3 className="text-base font-semibold text-slate-900 dark:text-foreground mb-6">
                Review Incorrect Answers
              </h3>

              <div className="space-y-4">
                {Array.from(wrongAnswers).map((questionId) => {
                  const question = shuffledQuestions.find(
                    (q) => q.id === questionId
                  );
                  const answer = answers.find(
                    (a) => a.questionId === questionId
                  );

                  if (!question || !answer) return null;

                  return (
                    <div
                      key={questionId}
                      className="border border-slate-200 dark:border-border rounded-lg p-4 bg-white dark:bg-card"
                    >
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-foreground mb-3">
                          {question.text}
                        </h4>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-border">
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              Your Answer:
                            </span>
                            <div className="text-sm text-slate-900 dark:text-foreground mt-1">
                              {answer.selectedOption !== null
                                ? question.options[answer.selectedOption]
                                : "Not answered"}
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-border">
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              Correct Answer:
                            </span>
                            <div className="text-sm text-slate-900 dark:text-foreground mt-1">
                              {question.options[question.correctAnswer]}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-border">
                        <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                          Explanation:
                        </h5>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onRestart}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Another Quiz</span>
            </button>

            <Link href="/overview" className="w-full sm:w-auto">
              <button className="w-full px-6 py-3 bg-white hover:bg-slate-50 dark:bg-card dark:hover:bg-slate-800 text-slate-900 dark:text-foreground rounded-lg font-medium border border-slate-200 dark:border-border transition-colors">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
