"use client";

import React, { useMemo, useCallback } from "react";
import { Flame, X, Calendar as CalendarIcon, Award } from "lucide-react";
import { motion } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useProgressStore } from "@/store/progressStore";
import { isToday, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface StreakCalendarDrawerProps {
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showFloatingTrigger?: boolean;
}

export const StreakCalendarDrawer: React.FC<StreakCalendarDrawerProps> = ({
  className = "",
  isOpen = false,
  onOpenChange,
  showFloatingTrigger = false,
}) => {
  const { streakData, recentActivity } = useProgressStore();

  // Get activity dates for calendar highlighting
  const activityDates = recentActivity.map(
    (activity) => new Date(activity.timestamp)
  );

  // Calculate consecutive streak dates
  const getStreakDates = useCallback(() => {
    if (streakData.currentStreak === 0) return [];

    const today = new Date();
    const streakDates = [];

    for (let i = 0; i < streakData.currentStreak; i++) {
      const date = subDays(today, i);
      streakDates.push(date);
    }

    return streakDates;
  }, [streakData.currentStreak]);

  const streakDates = useMemo(() => getStreakDates(), [getStreakDates]);
  const allHighlightedDates = useMemo(
    () => [...activityDates, ...streakDates],
    [activityDates, streakDates]
  );

  // Create modifiers for the calendar
  const calendarModifiers = useMemo(
    () => ({
      activity: activityDates,
      streak: streakDates,
      today: [new Date()],
    }),
    [activityDates, streakDates]
  );

  const calendarModifiersClassNames = {
    activity:
      "bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-400 dark:text-orange-900",
    streak:
      "bg-orange-300 text-orange-900 hover:bg-orange-400 dark:bg-orange-600 dark:text-white",
    today:
      "bg-orange-100 text-orange-900 ring-2 ring-orange-500 dark:bg-orange-900/30 dark:text-orange-100",
  };

  // Check if user has activity today
  const hasActivityToday = recentActivity.some((activity) => {
    const activityDate = new Date(activity.timestamp);
    return isToday(activityDate);
  });

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const StreakDrawerContent = () => (
    <DrawerContent className="h-[90vh] max-h-screen">
      <DrawerHeader className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <DrawerTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Study Streak
              </DrawerTitle>
              <DrawerDescription className="text-sm text-gray-600 dark:text-gray-400">
                Track your daily learning progress
              </DrawerDescription>
            </div>
          </div>
          <DrawerClose asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </DrawerClose>
        </div>
      </DrawerHeader>

      <div className="flex-1 px-4 md:px-6 pb-4 md:pb-6 max-h-[75vh] md:max-h-[70vh] overflow-y-auto">
        {/* Streak Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-3 md:p-4 rounded-lg border border-orange-200 dark:border-orange-800"
          >
            <div className="flex flex-col items-center text-center">
              <Flame className="h-6 w-6 md:h-8 md:w-8 text-orange-500 mb-2" />
              <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">
                {streakData.currentStreak}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Current
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-3 md:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex flex-col items-center text-center">
              <Award className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 mb-2" />
              <div className="text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {streakData.longestStreak}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Best
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 md:p-4 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex flex-col items-center text-center">
              <CalendarIcon className="h-6 w-6 md:h-8 md:w-8 text-green-500 mb-2" />
              <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                {recentActivity.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Days Active
              </div>
            </div>
          </motion.div>
        </div>

        {/* Today's Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "p-3 md:p-4 rounded-lg border mb-4 md:mb-6",
            hasActivityToday
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
          )}
        >
          <div className="flex items-center space-x-2 md:space-x-3">
            <div
              className={cn(
                "p-1.5 md:p-2 rounded-full",
                hasActivityToday
                  ? "bg-green-100 dark:bg-green-900/40"
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <CalendarIcon
                className={cn(
                  "h-4 w-4 md:h-5 md:w-5",
                  hasActivityToday
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                )}
              />
            </div>
            <div>
              <div
                className={cn(
                  "text-sm md:text-base font-medium",
                  hasActivityToday
                    ? "text-green-800 dark:text-green-200"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {hasActivityToday ? "Great work today!" : "No activity today"}
              </div>
              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {hasActivityToday
                  ? "You've maintained your streak"
                  : "Complete a quiz to continue your streak"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 md:p-4"
        >
          <div className="flex items-center space-x-2 mb-3 md:mb-4">
            <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
              Activity Calendar
            </h3>
          </div>

          <Calendar
            mode="multiple"
            selected={allHighlightedDates}
            modifiers={calendarModifiers}
            modifiersClassNames={calendarModifiersClassNames}
            className="w-full"
            classNames={{
              months:
                "flex w-full flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0",
              month: "space-y-4 w-full",
              day: "h-7 w-7 md:h-8 md:w-8 text-xs md:text-sm font-medium",
            }}
          />

          <div className="mt-3 md:mt-4 flex flex-wrap gap-2 text-xs md:text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Study Days
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-orange-200 dark:bg-orange-900/40 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Today</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 md:mt-6"
          >
            <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
              <Award className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-2 max-h-28 md:max-h-32 overflow-y-auto">
              {recentActivity.slice(0, 5).map((activity, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 md:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-500 rounded-full"></div>
                    <div>
                      <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                        {activity.type === "quiz"
                          ? "Quiz Completed"
                          : activity.description}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.type}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DrawerContent>
  );

  return (
    <>
      {/* Show floating trigger only if requested */}
      {showFloatingTrigger && (
        <Drawer open={isOpen} onOpenChange={handleOpenChange}>
          <DrawerTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "fixed bottom-20 md:bottom-24 right-3 md:right-4 z-50 p-3 md:p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg lg:hidden",
                className
              )}
            >
              <div className="relative flex items-center space-x-1.5 md:space-x-2">
                <Flame className="h-5 w-5 md:h-6 md:w-6" />
                <Badge
                  variant="secondary"
                  className="text-xs bg-white text-orange-600"
                >
                  {streakData.currentStreak}
                </Badge>
              </div>
            </motion.button>
          </DrawerTrigger>
          <StreakDrawerContent />
        </Drawer>
      )}

      {/* Standalone drawer for external triggers */}
      {!showFloatingTrigger && (
        <Drawer open={isOpen} onOpenChange={handleOpenChange}>
          <StreakDrawerContent />
        </Drawer>
      )}
    </>
  );
};

export default StreakCalendarDrawer;
