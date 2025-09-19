"use client";

import React from "react";
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  BookOpen,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProgressData } from "@/hooks/useProgressData";

export default function ProgressPage() {
  const { progressData, isLoading, error } = useProgressData("user-123");

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your progress...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Failed to load progress data
          </p>
        </div>
      </div>
    );
  }

  const { quizTracking, streakTracking, specialtyCoverage, userLeveling } =
    progressData;

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Progress
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Questions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quizTracking.totalQuestionsAnswered}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Questions Answered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accuracy */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {quizTracking.accuracyPercentage}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Overall Accuracy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {streakTracking.currentStreak}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Day Streak
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Level */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {userLeveling.currentLevel}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Current Level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Quiz Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quizTracking.recentQuizzes.slice(0, 5).map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {quiz.mode}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {quiz.specialty}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {quiz.questionsAttempted} questions • {quiz.timeSpent} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {quiz.score}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(quiz.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Specialty Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Specialty Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(specialtyCoverage).map(([specialty, data]) => (
                <div key={specialty} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {specialty}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          data.mastery === "Expert"
                            ? "border-green-500 text-green-700 dark:text-green-300"
                            : data.mastery === "Advanced"
                            ? "border-blue-500 text-blue-700 dark:text-blue-300"
                            : data.mastery === "Intermediate"
                            ? "border-yellow-500 text-yellow-700 dark:text-yellow-300"
                            : "border-gray-500 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {data.mastery}
                      </Badge>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {data.accuracy}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        data.mastery === "Expert"
                          ? "bg-green-500 w-full"
                          : data.mastery === "Advanced"
                          ? "bg-blue-500 w-3/4"
                          : data.mastery === "Intermediate"
                          ? "bg-yellow-500 w-1/2"
                          : "bg-gray-400 w-1/4"
                      }`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {data.questionsAttempted} questions attempted
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Progress Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {quizTracking.totalQuizzesAttempted}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Quizzes
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {quizTracking.correctAnswers}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Correct Answers
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {streakTracking.longestStreak}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Longest Streak
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
