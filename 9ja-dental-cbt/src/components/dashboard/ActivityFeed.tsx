import React, { useState, useEffect, useRef } from "react";
import { ActivityFeedProps } from "@/types/dashboard";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown } from "lucide-react";

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
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-foreground">
          Recent Activity
        </h3>

        {/* Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-50 dark:bg-muted hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-border transition-colors"
          >
            <span className="text-slate-600 dark:text-slate-400">
              {filterOptions.find((opt) => opt.value === selectedFilter)?.label}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-lg shadow-lg z-10">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedFilter(option.value);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    selectedFilter === option.value
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-foreground font-medium"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
            No activity yet
          </p>
        ) : (
          displayedActivities.map((activity) => {
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mt-2" />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
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
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-border/50">
          <button className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground font-medium transition-colors">
            View all activity ({filteredActivities.length})
          </button>
        </div>
      )}
    </div>
  );
}
