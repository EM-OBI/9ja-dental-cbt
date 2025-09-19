"use client";

import React from "react";
import { useQuizEngineStore } from "@/store/quizEngineStore";
import { QuizStats } from "@/types/definitions";
import {
  Trophy,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Award,
  TrendingUp,
} from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg text-gray-600 dark:text-gray-400">
              No quiz session found
            </div>
            <button
              onClick={onRestart}
              className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors duration-200"
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
  ): { grade: string; color: string; message: string } => {
    if (accuracy >= 90)
      return { grade: "A+", color: "text-green-600", message: "Excellent!" };
    if (accuracy >= 80)
      return { grade: "A", color: "text-green-500", message: "Great job!" };
    if (accuracy >= 70)
      return { grade: "B", color: "text-blue-500", message: "Good work!" };
    if (accuracy >= 60)
      return {
        grade: "C",
        color: "text-yellow-500",
        message: "Keep practicing!",
      };
    return { grade: "D", color: "text-red-500", message: "More study needed" };
  };

  const performance = getPerformanceGrade(accuracy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                <Trophy className="w-12 h-12 text-yellow-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Quiz Complete!
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {session.mode.charAt(0).toUpperCase() + session.mode.slice(1)}{" "}
              Mode - {session.specialty}
            </p>
            <div className={`text-4xl font-bold ${performance.color} mt-4`}>
              {performance.grade}
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
              {performance.message}
            </p>
          </div>

          {/* Main Statistics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 text-center">
              <Target className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-blue-100">Correct Answers</div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold">{accuracy.toFixed(1)}%</div>
              <div className="text-green-100">Accuracy</div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 text-center">
              <Award className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold">{stats.finalScore}</div>
              <div className="text-purple-100">Final Score</div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3" />
              <div className="text-2xl font-bold">
                {averageTime.toFixed(1)}s
              </div>
              <div className="text-orange-100">Avg Time/Q</div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center">
              Performance Breakdown
            </h3>

            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {correctAnswers}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Correct
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {wrongAnswersCount}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Wrong
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {skippedAnswers}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Skipped
                </div>
              </div>
            </div>

            {/* Time Bonus */}
            {timeBonus > 0 && (
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-blue-600 dark:text-blue-400 text-lg font-semibold">
                  Time Bonus: +{timeBonus} points
                </div>
                <div className="text-sm text-blue-500 dark:text-blue-300">
                  Earned for quick and accurate answers
                </div>
              </div>
            )}
          </div>

          {/* Wrong Answers Review */}
          {wrongAnswers.size > 0 && session.mode !== "practice" && (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
                <XCircle className="w-6 h-6 text-red-500 mr-3" />
                Review Incorrect Answers
              </h3>

              <div className="space-y-6">
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
                      className="border border-slate-200 dark:border-slate-600 rounded-lg p-4"
                    >
                      <div className="mb-4">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                          {question.text}
                        </h4>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                              Your Answer:
                            </span>
                            <div className="text-slate-700 dark:text-slate-300 mt-1">
                              {answer.selectedOption !== null
                                ? question.options[answer.selectedOption]
                                : "Not answered"}
                            </div>
                          </div>

                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Correct Answer:
                            </span>
                            <div className="text-slate-700 dark:text-slate-300 mt-1">
                              {question.options[question.correctAnswer]}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Explanation:
                        </h5>
                        <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
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
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Take Another Quiz</span>
            </button>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl font-semibold text-lg border border-slate-300 dark:border-slate-600 transition-all duration-200">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
