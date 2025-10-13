"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { DatabaseService } from "@/services/database";
import type { LeaderboardEntry } from "@/types/dashboard";

type LeaderboardPeriod = "daily" | "weekly" | "monthly";

const database = new DatabaseService();

const periodOptions: Array<{ label: string; value: LeaderboardPeriod }> = [
  { label: "Today", value: "daily" },
  { label: "This Week", value: "weekly" },
  { label: "This Month", value: "monthly" },
];

const formatNumber = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 0 });

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function PeriodSelector({
  value,
  onChange,
}: {
  value: LeaderboardPeriod;
  onChange: (period: LeaderboardPeriod) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {periodOptions.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? "default" : "ghost"}
          className="rounded-full px-4"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isTopThree = entry.rank <= 3;

  return (
    <div
      className={`flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-4 py-3 text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-[#1D1D20] dark:text-slate-100 ${
        isTopThree ? "border-slate-300 bg-slate-50 dark:bg-slate-800" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold text-slate-500 dark:text-slate-300">
          #{entry.rank}
        </span>
        <Avatar className="h-10 w-10">
          {entry.userAvatar ? (
            <AvatarImage src={entry.userAvatar} alt={entry.userName} />
          ) : null}
          <AvatarFallback>{getInitials(entry.userName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {entry.userName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Level {entry.level} • {entry.quizzesCompleted} quizzes
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {formatNumber(entry.totalScore)} pts
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Avg. score {entry.averageScore}%
        </p>
      </div>
    </div>
  );
}

// function LeaderboardSummary({ entries }: { entries: LeaderboardEntry[] }) {
//   if (!entries.length) {
//     return null;
//   }

//   const topScore = entries[0]?.totalScore ?? 0;
//   const avgScore = entries.length
//     ? Math.round(
//         entries.reduce((sum, item) => sum + item.averageScore, 0) /
//           entries.length
//       )
//     : 0;
//   const quizzesCompleted = entries.reduce(
//     (sum, item) => sum + item.quizzesCompleted,
//     0
//   );

//   return (
//     <div className="grid gap-3 sm:grid-cols-3">
//       <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
//         <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
//           Top score
//         </p>
//         <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
//           {formatNumber(topScore)} pts
//         </p>
//       </div>
//       <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
//         <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
//           Average accuracy
//         </p>
//         <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
//           {avgScore}%
//         </p>
//       </div>
//       <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
//         <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
//           Quizzes completed
//         </p>
//         <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
//           {formatNumber(quizzesCompleted)} total
//         </p>
//       </div>
//     </div>
//   );
// }

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await database.getLeaderboard(15, period);
        if (!active) return;
        setEntries(data);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
        if (!active) return;
        setError("We couldn’t load the leaderboard right now.");
        setEntries([]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [period, refreshKey]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-[#1D1D20]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Leaderboard
          </p>
          <div className="flex flex-col gap-3 sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                9ja Dental CBT Rankings
              </h1>
              <p className="max-w-xl text-sm text-slate-600 dark:text-slate-400">
                Track the top performers preparing for the Dental CBT exams.
                Pick a time range to see who&apos;s leading the pack.
              </p>
            </div>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
        </header>

        {/* <LeaderboardSummary entries={entries} /> */}

        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1D1D20]">
          <CardHeader className="border-b border-slate-200/60 pb-4 dark:border-slate-800">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Current standings
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Updated when you switch time periods.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 py-6">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <LoadingSpinner label="Loading leaderboard" />
              </div>
            ) : error ? (
              <ErrorAlert
                message={error}
                severity="error"
                onRetry={() => setRefreshKey((k) => k + 1)}
              />
            ) : entries.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-[#1D1D20]/40 dark:text-slate-400">
                No leaderboard data available for this period yet.
              </div>
            ) : (
              entries.map((entry) => (
                <LeaderboardRow key={entry.id} entry={entry} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
