import React from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  subDays,
} from "date-fns";
import { cn } from "@/lib/utils";
import { useProgressStore } from "@/store/progressStore";

interface StreakCalendarProps {
  title?: string;
  className?: string;
}

export default function StreakCalendar({
  title = "Study Streak",
  className,
}: StreakCalendarProps) {
  // Get streak data from the progress store
  const { streakData, recentActivity } = useProgressStore();

  // Get the last 7 days for the mini calendar
  const today = new Date();
  const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeekDate, i)
  );

  // Get activity dates from recent activity and streak history
  const activityDates = recentActivity.map(
    (activity) => new Date(activity.timestamp)
  );

  // Calculate consecutive streak dates
  const getStreakDates = () => {
    if (streakData.currentStreak === 0) return [];

    const today = new Date();
    const streakDates = [];

    for (let i = 0; i < streakData.currentStreak; i++) {
      const date = subDays(today, i);
      streakDates.push(date);
    }

    return streakDates;
  };

  const streakDates = getStreakDates();
  const allActivityDates = [...activityDates, ...streakDates];

  return (
    <div className={cn("p-5 overflow-auto hidden sm:block", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-foreground">
          {title}
        </h3>
        <div className="text-sm font-semibold tabular-nums text-slate-900 dark:text-foreground">
          {streakData.currentStreak} days
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="space-y-2.5">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => {
            const hasActivity = allActivityDates.some((activityDate: Date) =>
              isSameDay(activityDate, day)
            );
            const isCurrentDay = isToday(day);

            return (
              <div
                key={index}
                className={cn(
                  "aspect-square flex items-center justify-center text-xs rounded transition-colors font-medium",
                  {
                    "bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900":
                      hasActivity,
                    "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400":
                      !hasActivity && !isCurrentDay,
                    "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 ring-1 ring-slate-300 dark:ring-slate-600":
                      isCurrentDay && !hasActivity,
                    "bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 ring-2 ring-slate-400 dark:ring-slate-500":
                      isCurrentDay && hasActivity,
                  }
                )}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>

        {/* Streak Info */}
        <div className="pt-3 border-t border-slate-100 dark:border-border/50">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Current: {streakData.currentStreak}</span>
            <span>Best: {streakData.longestStreak}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
