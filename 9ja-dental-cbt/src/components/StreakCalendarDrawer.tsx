"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  Award,
  BookOpen,
  Clock,
  Flame,
  Target,
  X,
} from "lucide-react";
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
import { useProgressStore } from "@/store/progressStore";
import { cn } from "@/lib/utils";

interface StreakCalendarDrawerProps {
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showFloatingTrigger?: boolean;
}

export const StreakCalendarDrawer: React.FC<StreakCalendarDrawerProps> = ({
  className,
  isOpen: controlledIsOpen,
  onOpenChange,
  showFloatingTrigger = false,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledIsOpen ?? uncontrolledOpen;

  const { recentActivity } = useProgressStore();

  const activityTypeConfig = useMemo(
    () => ({
      quiz: {
        label: "Quiz completed",
        icon: Target,
        iconClass: "text-blue-500",
        badgeClass:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      },
      study: {
        label: "Study session",
        icon: BookOpen,
        iconClass: "text-emerald-600",
        badgeClass:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      },
      achievement: {
        label: "Achievement unlocked",
        icon: Award,
        iconClass: "text-amber-500",
        badgeClass:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      },
      streak: {
        label: "Streak milestone",
        icon: Flame,
        iconClass: "text-orange-500",
        badgeClass:
          "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      },
    }),
    []
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    []
  );

  const formatRelativeTime = (timestamp: string) => {
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) {
      return "Just now";
    }

    const diffMs = Date.now() - parsed.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    if (diffMinutes <= 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    const diffWeeks = Math.round(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks} wk${diffWeeks > 1 ? "s" : ""} ago`;

    const diffMonths = Math.round(diffDays / 30);
    if (diffMonths < 12)
      return `${diffMonths} mo${diffMonths > 1 ? "s" : ""} ago`;

    const diffYears = Math.round(diffMonths / 12);
    return `${diffYears} yr${diffYears > 1 ? "s" : ""} ago`;
  };

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setUncontrolledOpen(open);
    }
  };

  const StreakDrawerContent = () => (
    <DrawerContent className="h-[90vh] max-h-screen">
      <DrawerHeader className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500 rounded-full">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <DrawerTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </DrawerTitle>
              <DrawerDescription className="text-sm text-gray-600 dark:text-gray-400">
                Track your learning activities
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

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                Activity Log
              </h3>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity) => {
                  const config =
                    activityTypeConfig[
                      activity.type as keyof typeof activityTypeConfig
                    ] ??
                    ({
                      label: "Progress update",
                      icon: Clock,
                      iconClass: "text-slate-500",
                      badgeClass:
                        "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
                    } as const);
                  const Icon = config.icon;
                  const parsedDate = new Date(activity.timestamp);
                  const timestampLabel = !Number.isNaN(parsedDate.getTime())
                    ? dateFormatter.format(parsedDate)
                    : "Time unavailable";

                  return (
                    <div
                      key={activity.id}
                      className="p-4 bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-1 rounded-full p-2",
                            config.badgeClass
                          )}
                        >
                          <Icon className={cn("h-4 w-4", config.iconClass)} />
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {config.label}
                            </span>
                            <span
                              className="text-xs text-gray-500 dark:text-gray-400"
                              title={timestampLabel}
                            >
                              {formatRelativeTime(activity.timestamp)}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {activity.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{timestampLabel}</span>
                            {typeof activity.points === "number" && (
                              <span className="font-semibold text-orange-500">
                                +{activity.points}
                                {activity.type === "quiz" ? " pts" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DrawerContent>
  );

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      {showFloatingTrigger && (
        <DrawerTrigger asChild>
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "fixed bottom-20 right-6 z-50",
              "bg-orange-500 hover:bg-orange-600 text-white",
              "rounded-full p-4 shadow-lg",
              "flex items-center space-x-2",
              "transition-all duration-200",
              className
            )}
          >
            <Activity className="h-5 w-5 md:h-6 md:w-6" />
            <span className="hidden sm:inline text-sm font-medium">
              Recent Activity
            </span>
          </motion.button>
        </DrawerTrigger>
      )}
      <StreakDrawerContent />
    </Drawer>
  );
};

export default StreakCalendarDrawer;
