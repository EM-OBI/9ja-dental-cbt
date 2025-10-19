"use client";

import Link from "next/link";
import { Clock3, NotebookTabs } from "lucide-react";
import type { StudySession } from "@/types/progress";

interface StudyProgressCardProps {
  sessions: StudySession[];
  totalStudyMinutes: number;
}

const formatDateLabel = (isoDate: string) => {
  if (!isoDate) return "Unknown date";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const formatDuration = (minutes: number) => {
  if (!minutes || minutes <= 0) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
};

export function StudyProgressCard({
  sessions,
  totalStudyMinutes,
}: StudyProgressCardProps) {
  const recentSessions = (sessions ?? []).slice(0, 4);
  const totalDurationLabel = formatDuration(totalStudyMinutes);

  return (
    <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Study Progress
          </p>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground">
            Recent study sessions
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track how your AI-generated packages are helping you revise.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100/70 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
          <Clock3 className="h-3.5 w-3.5" />
          {totalDurationLabel}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {recentSessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No study sessions yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generate a study package to see your progress summary here.
            </p>
          </div>
        ) : (
          recentSessions.map((session) => {
            const topics = session.topicsStudied?.slice(0, 2)?.join(", ") ?? "";
            return (
              <div
                key={session.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 dark:border-slate-800 px-4 py-3 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-200">
                    <NotebookTabs className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                      {session.specialty}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateLabel(session.date)}
                      {topics ? ` • ${topics}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-foreground">
                    {session.timeSpent}m
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {session.completionPercentage}% complete
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-sm">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Keep building streaks by reviewing saved packages.
        </p>
        <Link
          href="/study/saved"
          className="font-semibold text-slate-900 hover:text-orange-600 dark:text-slate-100 dark:hover:text-orange-300 transition-colors"
        >
          View saved packages
        </Link>
      </div>
    </div>
  );
}

export default StudyProgressCard;
