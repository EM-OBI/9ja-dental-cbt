import React from "react";
import { WeeklyProgress } from "@/types/dashboard";
import { format } from "date-fns";
import { BarChart3 } from "lucide-react";

interface ProgressChartProps {
  data: WeeklyProgress[];
  title?: string;
}

export default function ProgressChart({
  data,
  title = "Weekly Progress",
}: ProgressChartProps) {
  const maxQuizzes = Math.max(...data.map((d) => d.quizzesTaken), 1);
  const maxStudyTime = Math.max(...data.map((d) => d.studyMinutes), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <BarChart3 className="w-5 h-5 text-blue-500" />
      </div>

      <div className="space-y-4">
        {data.map((day, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {format(day.date, "EEE, MMM d")}
              </span>
              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{day.quizzesTaken} quizzes</span>
                <span>{day.studyMinutes}min study</span>
                <span className="font-medium">{day.averageScore}% avg</span>
              </div>
            </div>

            {/* Quiz progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Quizzes
                </span>
                <span className="text-slate-900 dark:text-slate-100">
                  {day.quizzesTaken}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(day.quizzesTaken / maxQuizzes) * 100}%` }}
                />
              </div>
            </div>

            {/* Study time progress bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Study Time
                </span>
                <span className="text-slate-900 dark:text-slate-100">
                  {day.studyMinutes}m
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${(day.studyMinutes / maxStudyTime) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Average score indicator */}
            <div className="flex items-center justify-end">
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  day.averageScore >= 90
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : day.averageScore >= 75
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    : day.averageScore >= 60
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {day.averageScore}% avg score
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
