import React from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  subDays,
} from "date-fns";
import { Calendar, Flame } from "lucide-react";
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
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm overflow-auto hidden sm:block",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
          <Flame className="w-4 h-4" />
          <span className="text-sm font-medium">
            {streakData.currentStreak} days
          </span>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="space-y-3">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 dark:text-gray-400">
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
                  "aspect-square flex items-center justify-center text-xs rounded transition-colors",
                  {
                    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium":
                      hasActivity,
                    "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400":
                      !hasActivity && !isCurrentDay,
                    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium":
                      isCurrentDay && !hasActivity,
                    "bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200 font-bold border-2 border-green-400":
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
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Current: {streakData.currentStreak} days</span>
            <span>Best: {streakData.longestStreak} days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
