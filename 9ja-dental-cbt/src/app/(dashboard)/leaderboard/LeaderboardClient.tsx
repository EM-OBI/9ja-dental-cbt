"use client";

import React, { useRef, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { fetchLeaderboardEntries } from "./actions";
import type { LeaderboardEntry } from "@/types/dashboard";
import type { LeaderboardPeriod } from "@/services/leaderboardService";

const periodOptions: Array<{ label: string; value: LeaderboardPeriod }> = [
  { label: "Today", value: "daily" },
  { label: "This Week", value: "weekly" },
  { label: "All Time", value: "all-time" },
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
  disabled = false,
}: {
  value: LeaderboardPeriod;
  onChange: (period: LeaderboardPeriod) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-full flex-wrap justify-start gap-2 sm:w-auto sm:justify-end">
      {periodOptions.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? "default" : "ghost"}
          className="rounded-full px-4"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          aria-pressed={value === option.value}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isTopThree = entry.rank <= 3;
  const xp = formatNumber(entry.totalXp ?? 0);

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-white px-4 py-3 text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-border dark:bg-card dark:text-slate-100 ${
        isTopThree ? "border-slate-300 bg-slate-50 dark:bg-slate-800" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="text-lg font-semibold text-slate-500 dark:text-slate-300">
          #{entry.rank}
        </span>
        <Avatar className="h-10 w-10">
          {entry.userAvatar ? (
            <AvatarImage src={entry.userAvatar} alt={entry.userName} />
          ) : null}
          <AvatarFallback>{getInitials(entry.userName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {entry.userName}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            Level {entry.level}
          </p>
        </div>
      </div>
      <div className="flex min-w-[72px] flex-col items-end">
        <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
          XP
        </span>
        <span className="text-lg font-semibold text-slate-900 dark:text-white">
          {xp}
        </span>
      </div>
    </div>
  );
}

function LeaderboardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm dark:border-border dark:bg-card"
        >
          <div className="flex items-center gap-4">
            <div className="h-5 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="h-6 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

interface LeaderboardClientProps {
  initialEntries: LeaderboardEntry[];
  initialPeriod?: LeaderboardPeriod;
  limit?: number;
}

export default function LeaderboardClient({
  initialEntries,
  initialPeriod = "weekly",
  limit = 15,
}: LeaderboardClientProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>(initialPeriod);
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);

  const loadEntries = (nextPeriod?: LeaderboardPeriod) => {
    startTransition(() => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setError(null);

      const periodToLoad = nextPeriod ?? period;

      void fetchLeaderboardEntries(periodToLoad, limit)
        .then((data) => {
          if (requestIdRef.current !== requestId) {
            return;
          }

          setEntries(data);
          setError(null);
          setPeriod(periodToLoad);
        })
        .catch((err) => {
          if (requestIdRef.current !== requestId) {
            return;
          }

          console.error("Failed to load leaderboard", err);
          setError("We couldn’t load the leaderboard right now.");
        });
    });
  };

  const handlePeriodChange = (nextPeriod: LeaderboardPeriod) => {
    if (nextPeriod === period) {
      return;
    }

    loadEntries(nextPeriod);
  };

  const rowsForSkeleton = Math.max(entries.length || 0, 5);
  const activePeriodLabel =
    periodOptions.find((option) => option.value === period)?.label ??
    periodOptions[1]?.label ??
    "This Week";

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Leaderboard
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Track the top performers across today, this week, or all time.
        </p>
      </header>

      <Card className="border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
        <CardHeader className="flex flex-col gap-3 border-b border-slate-200/60 p-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Current standings
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing leaders by total XP earned ({activePeriodLabel}).
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <PeriodSelector
              value={period}
              onChange={handlePeriodChange}
              disabled={isPending}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {error ? (
            <ErrorAlert
              message={error}
              severity="error"
              onRetry={() => loadEntries(period)}
            />
          ) : isPending ? (
            <LeaderboardSkeleton rows={rowsForSkeleton} />
          ) : entries.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-[#1D1D20]/40 dark:text-slate-400">
              No leaderboard data available for this timeframe yet.
            </div>
          ) : (
            entries.map((entry) => (
              <LeaderboardRow key={entry.id} entry={entry} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
