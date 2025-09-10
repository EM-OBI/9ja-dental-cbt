import React, { useState, useEffect, useRef } from "react";
import { ActivityFeedProps } from "@/types/dashboard";
import { formatDistanceToNow } from "date-fns";
import {
  Trophy,
  Brain,
  BookOpen,
  Flame,
  Filter,
  ChevronDown,
} from "lucide-react";

const activityIcons = {
  quiz_completed: Brain,
  study_session: BookOpen,
  achievement_unlocked: Trophy,
  streak_milestone: Flame,
};

const activityColors = {
  quiz_completed: "text-blue-500 bg-blue-100 dark:bg-blue-900/20",
  study_session: "text-green-500 bg-green-100 dark:bg-green-900/20",
  achievement_unlocked: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20",
  streak_milestone: "text-orange-500 bg-orange-100 dark:bg-orange-900/20",
};

export default function ActivityFeed({
  activities,
  maxItems = 5,
  showTimestamp = true,
}: ActivityFeedProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filterOptions = [
    { value: "all", label: "All Activity" },
    { value: "quiz_completed", label: "Quizzes" },
    { value: "study_session", label: "Study Sessions" },
    { value: "achievement_unlocked", label: "Achievements" },
    { value: "streak_milestone", label: "Streaks" },
  ];

  // Filter activities based on selected filter
  const filteredActivities =
    selectedFilter === "all"
      ? activities
      : activities.filter((activity) => activity.type === selectedFilter);

  const displayedActivities = filteredActivities.slice(0, maxItems);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Recent Activity
        </h3>

        {/* Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>
              {filterOptions.find((opt) => opt.value === selectedFilter)?.label}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedFilter(option.value);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    selectedFilter === option.value
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {displayedActivities.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            No recent activity
          </p>
        ) : (
          displayedActivities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];

            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {activity.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {activity.description}
                  </p>
                  {showTimestamp && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredActivities.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View More ({filteredActivities.length - maxItems} more)
          </button>
        </div>
      )}
    </div>
  );
}
