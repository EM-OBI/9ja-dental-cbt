import React from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  subDays,
} from "date-fns";
import { Flame } from "lucide-react";
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
    <div className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              streakData.currentStreak > 0
                ? "bg-orange-100 dark:bg-orange-950/30"
                : "bg-slate-100 dark:bg-slate-800"
            )}
          >
            <Flame
              className={cn(
                "w-4 h-4",
                streakData.currentStreak > 0
                  ? "text-orange-500 dark:text-orange-400"
                  : "text-slate-400 dark:text-slate-500"
              )}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keep your momentum going
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900 dark:text-foreground">
            {streakData.currentStreak}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">days</div>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="space-y-2">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
            <div
              key={idx}
              className="text-center text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day, index) => {
            const hasActivity = allActivityDates.some((activityDate: Date) =>
              isSameDay(activityDate, day)
            );
            const isCurrentDay = isToday(day);

            return (
              <div
                key={index}
                className={cn(
                  "aspect-square flex items-center justify-center text-xs rounded-lg transition-all font-medium relative",
                  {
                    "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm":
                      hasActivity && !isCurrentDay,
                    "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md ring-2 ring-amber-300 dark:ring-amber-600 scale-110":
                      hasActivity && isCurrentDay,
                    "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500":
                      !hasActivity && !isCurrentDay,
                    "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ring-2 ring-slate-300 dark:ring-slate-600":
                      isCurrentDay && !hasActivity,
                  }
                )}
              >
                {format(day, "d")}
              </div>
            );
          })}
        </div>

        {/* Streak Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Current:{" "}
              <span className="font-semibold text-slate-900 dark:text-foreground">
                {streakData.currentStreak}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Best:{" "}
              <span className="font-semibold text-slate-900 dark:text-foreground">
                {streakData.longestStreak}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
