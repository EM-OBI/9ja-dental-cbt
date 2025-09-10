"use client";

import React from "react";
import { Flame, Calendar as CalendarIcon, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useProgressStore } from "@/store/progressStore";
import { isToday, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface MobileStreakCalendarProps {
  className?: string;
  showStats?: boolean;
  showLegend?: boolean;
}

export const MobileStreakCalendar: React.FC<MobileStreakCalendarProps> = ({
  className = "",
  showStats = true,
  showLegend = true,
}) => {
  const { streakData, recentActivity } = useProgressStore();

  // Get activity dates for calendar highlighting
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

  // Check if user has activity today
  const hasActivityToday = recentActivity.some((activity) => {
    const activityDate = new Date(activity.timestamp);
    return isToday(activityDate);
  });

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <CalendarIcon className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Study Streak
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {streakData.currentStreak} days
        </Badge>
      </div>

      {/* Streak Stats */}
      {showStats && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800"
          >
            <div className="flex flex-col items-center text-center">
              <Flame className="h-6 w-6 text-orange-500 mb-1" />
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {streakData.currentStreak}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Current
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex flex-col items-center text-center">
              <Award className="h-6 w-6 text-yellow-500 mb-1" />
              <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {streakData.longestStreak}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Best
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex flex-col items-center text-center">
              <CalendarIcon className="h-6 w-6 text-green-500 mb-1" />
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {recentActivity.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Days Active
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Today's Status */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          "p-3 rounded-lg border mb-4 text-sm",
          hasActivityToday
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
        )}
      >
        <div className="flex items-center space-x-2">
          <div
            className={cn(
              "p-1.5 rounded-full",
              hasActivityToday
                ? "bg-green-100 dark:bg-green-900/40"
                : "bg-gray-100 dark:bg-gray-800"
            )}
          >
            <CalendarIcon
              className={cn(
                "h-4 w-4",
                hasActivityToday
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              )}
            />
          </div>
          <div>
            <div
              className={cn(
                "font-medium text-sm",
                hasActivityToday
                  ? "text-green-800 dark:text-green-200"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              {hasActivityToday ? "Great work today!" : "No activity today"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {hasActivityToday
                ? "You've maintained your streak"
                : "Complete a quiz to continue your streak"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compact Calendar */}
      <Calendar
        mode="multiple"
        selected={[...activityDates, ...streakDates]}
        className="w-full"
        classNames={{
          months: "flex w-full flex-col space-y-2 flex-1",
          month: "space-y-2 w-full flex flex-col",
          table: "w-full h-full border-collapse space-y-1",
          head_row: "",
          row: "w-full mt-1",
          cell: "relative p-0 text-center text-xs focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-orange-100 dark:[&:has([aria-selected])]:bg-orange-900/20 [&:has([aria-selected].day-outside)]:bg-orange-100/50 dark:[&:has([aria-selected].day-outside)]:bg-orange-900/10",
          day: cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-950 disabled:pointer-events-none disabled:opacity-50 hover:bg-orange-100 hover:text-orange-900 dark:hover:bg-orange-900/20 dark:hover:text-orange-50 h-6 w-6",
            "aria-selected:opacity-100 aria-selected:bg-orange-500 aria-selected:text-orange-50 dark:aria-selected:bg-orange-400 dark:aria-selected:text-orange-900"
          ),
          day_selected:
            "bg-orange-500 text-orange-50 hover:bg-orange-500 hover:text-orange-50 focus:bg-orange-500 focus:text-orange-50 dark:bg-orange-400 dark:text-orange-900 dark:hover:bg-orange-400 dark:hover:text-orange-900 dark:focus:bg-orange-400 dark:focus:text-orange-900",
          day_today:
            "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-50",
          day_outside:
            "day-outside text-gray-400 opacity-50 dark:text-gray-600 aria-selected:bg-orange-100/50 aria-selected:text-gray-400 aria-selected:opacity-30 dark:aria-selected:bg-orange-900/10 dark:aria-selected:text-gray-600",
          day_disabled: "text-gray-400 opacity-50 dark:text-gray-600",
          day_range_middle:
            "aria-selected:bg-orange-100 aria-selected:text-orange-900 dark:aria-selected:bg-orange-900/20 dark:aria-selected:text-orange-50",
          day_hidden: "invisible",
        }}
      />

      {/* Legend */}
      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Study Days</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 bg-orange-200 dark:bg-orange-900/40 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Today</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileStreakCalendar;
