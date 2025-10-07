import React, { useState, useEffect, useRef } from "react";
import { QuizAttempt } from "@/types/dashboard";
import {
  formatDistanceToNow,
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  subDays,
  isAfter,
} from "date-fns";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizResultsProps {
  quizAttempts: QuizAttempt[];
  maxItems?: number;
  title?: string;
}

export default function QuizResults({
  quizAttempts,
  maxItems = 5,
  title = "Recent Results",
}: QuizResultsProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
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

  // Reset showAllResults when filter changes
  useEffect(() => {
    setShowAllResults(false);
  }, [selectedFilter]);

  // Extract unique subjects from quiz IDs for filter options
  const getSubjectFromQuizId = (quizId: string) => {
    if (quizId.includes("anatomy")) return "anatomy";
    if (quizId.includes("periodontics")) return "periodontics";
    if (quizId.includes("surgery")) return "surgery";
    if (quizId.includes("endodontics")) return "endodontics";
    if (quizId.includes("orthodontics")) return "orthodontics";
    if (quizId.includes("radiology")) return "radiology";
    if (quizId.includes("pathology")) return "pathology";
    return "other";
  };

  const filterOptions = [
    { value: "all", label: "All Results", category: "general" },

    // Date filters
    { value: "today", label: "Today", category: "date" },
    { value: "yesterday", label: "Yesterday", category: "date" },
    { value: "this-week", label: "This Week", category: "date" },
    { value: "this-month", label: "This Month", category: "date" },
    { value: "last-7-days", label: "Last 7 Days", category: "date" },
    { value: "last-30-days", label: "Last 30 Days", category: "date" },

    // Subject filters
    { value: "anatomy", label: "Anatomy", category: "subject" },
    { value: "periodontics", label: "Periodontics", category: "subject" },
    { value: "surgery", label: "Oral Surgery", category: "subject" },
    { value: "endodontics", label: "Endodontics", category: "subject" },
    { value: "orthodontics", label: "Orthodontics", category: "subject" },
    { value: "radiology", label: "Radiology", category: "subject" },
    { value: "pathology", label: "Pathology", category: "subject" },

    // Performance filters
    { value: "excellent", label: "Excellent (90%+)", category: "performance" },
    { value: "good", label: "Good (75-89%)", category: "performance" },
    { value: "average", label: "Average (60-74%)", category: "performance" },
    {
      value: "needs-improvement",
      label: "Needs Improvement (<60%)",
      category: "performance",
    },
  ];

  // Filter quiz attempts based on selected filter
  const filteredAttempts =
    selectedFilter === "all"
      ? quizAttempts
      : // Date filters
      selectedFilter === "today"
      ? quizAttempts.filter((attempt) => isToday(attempt.completedAt))
      : selectedFilter === "yesterday"
      ? quizAttempts.filter((attempt) => isYesterday(attempt.completedAt))
      : selectedFilter === "this-week"
      ? quizAttempts.filter((attempt) =>
          isThisWeek(attempt.completedAt, { weekStartsOn: 1 })
        )
      : selectedFilter === "this-month"
      ? quizAttempts.filter((attempt) => isThisMonth(attempt.completedAt))
      : selectedFilter === "last-7-days"
      ? quizAttempts.filter((attempt) =>
          isAfter(attempt.completedAt, subDays(new Date(), 7))
        )
      : selectedFilter === "last-30-days"
      ? quizAttempts.filter((attempt) =>
          isAfter(attempt.completedAt, subDays(new Date(), 30))
        )
      : // Performance filters
      selectedFilter === "excellent"
      ? quizAttempts.filter(
          (attempt) => (attempt.score / attempt.totalQuestions) * 100 >= 90
        )
      : selectedFilter === "good"
      ? quizAttempts.filter((attempt) => {
          const percentage = (attempt.score / attempt.totalQuestions) * 100;
          return percentage >= 75 && percentage < 90;
        })
      : selectedFilter === "average"
      ? quizAttempts.filter((attempt) => {
          const percentage = (attempt.score / attempt.totalQuestions) * 100;
          return percentage >= 60 && percentage < 75;
        })
      : selectedFilter === "needs-improvement"
      ? quizAttempts.filter(
          (attempt) => (attempt.score / attempt.totalQuestions) * 100 < 60
        )
      : // Subject filters
        quizAttempts.filter(
          (attempt) => getSubjectFromQuizId(attempt.quizId) === selectedFilter
        );

  // Helper function to format quiz names
  const formatQuizName = (quizId: string) => {
    return quizId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const displayedAttempts = showAllResults
    ? filteredAttempts
    : filteredAttempts.slice(0, 2);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-foreground">
          {title}
        </h3>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-50 dark:bg-muted hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-border transition-colors"
            >
              <span className="text-slate-600 dark:text-slate-400">
                {
                  filterOptions.find((opt) => opt.value === selectedFilter)
                    ?.label
                }
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-lg shadow-lg z-10 max-h-80 overflow-y-scroll scrollbar-hide">
                {/* General Filters */}
                <div className="p-2">
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1">
                    General
                  </div>
                  {filterOptions
                    .filter((option) => option.category === "general")
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedFilter(option.value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                          selectedFilter === option.value
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-foreground font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>

                {/* Date Filters */}
                <div className="border-t border-slate-100 dark:border-border/50 p-2">
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1">
                    Date Range
                  </div>
                  {filterOptions
                    .filter((option) => option.category === "date")
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedFilter(option.value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                          selectedFilter === option.value
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-foreground font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>

                {/* Subject Filters */}
                <div className="border-t border-slate-100 dark:border-border/50 p-2">
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1">
                    Subject
                  </div>
                  {filterOptions
                    .filter((option) => option.category === "subject")
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedFilter(option.value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                          selectedFilter === option.value
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-foreground font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>

                {/* Performance Filters */}
                <div className="border-t border-slate-100 dark:border-border/50 p-2">
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1">
                    Performance
                  </div>
                  {filterOptions
                    .filter((option) => option.category === "performance")
                    .map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedFilter(option.value);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                          selectedFilter === option.value
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-foreground font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`space-y-3 transition-all duration-300 ease-in-out ${
          showAllResults && filteredAttempts.length > maxItems
            ? "max-h-none"
            : ""
        }`}
      >
        {displayedAttempts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
            No quiz attempts yet
          </p>
        ) : (
          displayedAttempts.map((attempt) => {
            const percentage = Math.round(
              (attempt.score / attempt.totalQuestions) * 100
            );
            const timeInMinutes = Math.round(attempt.timeSpent / 60);

            return (
              <div
                key={attempt.id}
                className="space-y-2.5 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-border/50 hover:border-slate-200 dark:hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-foreground truncate">
                      {formatQuizName(attempt.quizId)}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {format(attempt.completedAt, "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-foreground">
                      {percentage}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {attempt.score}/{attempt.totalQuestions}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span>{timeInMinutes} min</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(attempt.completedAt, {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                  <div
                    className={cn(
                      "h-1 rounded-full transition-all duration-300",
                      percentage >= 90
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : percentage >= 75
                        ? "bg-slate-900 dark:bg-slate-300"
                        : percentage >= 60
                        ? "bg-slate-600 dark:bg-slate-400"
                        : "bg-slate-400 dark:bg-slate-500"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredAttempts.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-border/50">
          <button
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-foreground rounded-lg border border-slate-200 dark:border-border transition-all duration-200 group"
            onClick={() => setShowAllResults(!showAllResults)}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {showAllResults ? "Show Less" : `View All Results`}
              </span>
              {!showAllResults && (
                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  +{filteredAttempts.length - maxItems}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showAllResults
                  ? "transform rotate-180"
                  : "group-hover:translate-y-0.5"
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
