"use client";

import Link from "next/link";
import { ClipboardCheck, Target } from "lucide-react";
import type { QuizAttempt } from "@/types/progress";

interface QuizProgressCardProps {
  quizzes: QuizAttempt[];
  averageScore: number;
  totalQuestionsAnswered: number;
}

const formatScore = (score: string | number) => {
  if (typeof score === "string") return score;
  if (typeof score === "number") return `${Math.round(score)}%`;
  return "--";
};

const formatDateLabel = (isoDate: string) => {
  if (!isoDate) return "Unknown date";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export function QuizProgressCard({
  quizzes,
  averageScore,
  totalQuestionsAnswered,
}: QuizProgressCardProps) {
  const recentQuizzes = (quizzes ?? []).slice(0, 4);

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quiz Progress
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground">
            Recent quiz performance
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Monitor accuracy and question coverage across specialties.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100/70 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
            <Target className="h-3.5 w-3.5" />
            {Math.round(averageScore)}% avg
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {totalQuestionsAnswered} questions answered
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {recentQuizzes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No quizzes yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Start a quiz to see your performance trends here.
            </p>
          </div>
        ) : (
          recentQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 dark:border-slate-800 px-4 py-3 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                    {quiz.specialty}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDateLabel(quiz.date)} • {quiz.mode}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                  {formatScore(quiz.score)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {quiz.correct}/{quiz.questionsAttempted} correct
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-sm">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Aim for consistent accuracy above 80% to level up faster.
        </p>
        <Link
          href="/quiz"
          className="font-semibold text-slate-900 hover:text-orange-600 dark:text-slate-100 dark:hover:text-orange-300 transition-colors"
        >
          Start a quiz
        </Link>
      </div>
    </div>
  );
}

export default QuizProgressCard;
