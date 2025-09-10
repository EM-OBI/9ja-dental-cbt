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
import {
  Brain,
  Clock,
  Trophy,
  Target,
  Filter,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizResultsProps {
  quizAttempts: QuizAttempt[];
  maxItems?: number;
  title?: string;
}

export default function QuizResults({
  quizAttempts,
  maxItems = 5,
  title = "Recent Quiz Results",
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
    : filteredAttempts.slice(0, maxItems);

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return "text-green-600 dark:text-green-400";
    if (percentage >= 75) return "text-blue-600 dark:text-blue-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90)
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    if (percentage >= 75)
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    if (percentage >= 60)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>
                {
                  filterOptions.find((opt) => opt.value === selectedFilter)
                    ?.label
                }
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-80 overflow-y-scroll scrollbar-hide">
                {/* General Filters */}
                <div className="p-2">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2 py-1">
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
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          selectedFilter === option.value
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>

                {/* Date Filters */}
                <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2 py-1">
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
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          selectedFilter === option.value
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>

                {/* Subject Filters */}
                <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2 py-1">
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
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          selectedFilter === option.value
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>

                {/* Performance Filters */}
                <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2 py-1">
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
                        className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          selectedFilter === option.value
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <Brain className="w-5 h-5 text-blue-500" />
        </div>
      </div>

      <div
        className={`space-y-4 transition-all duration-300 ease-in-out ${
          showAllResults && filteredAttempts.length > maxItems
            ? "max-h-none"
            : ""
        }`}
      >
        {displayedAttempts.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
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
                className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatQuizName(attempt.quizId)}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {format(attempt.completedAt, "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      getScoreBadgeColor(attempt.score, attempt.totalQuestions)
                    )}
                  >
                    {percentage}%
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Target className="w-3 h-3 text-slate-400" />
                    <span
                      className={getScoreColor(
                        attempt.score,
                        attempt.totalQuestions
                      )}
                    >
                      {attempt.score}/{attempt.totalQuestions}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {timeInMinutes}m
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Trophy className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">
                      {formatDistanceToNow(attempt.completedAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300 relative overflow-hidden",
                      percentage >= 90
                        ? "bg-green-500"
                        : percentage >= 75
                        ? "bg-blue-500"
                        : percentage >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
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
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-sm bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 transition-all duration-200 group"
            onClick={() => setShowAllResults(!showAllResults)}
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {showAllResults ? "Show Less" : `View All Results`}
              </span>
              {!showAllResults && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">
                  +{filteredAttempts.length - maxItems}
                </span>
              )}
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
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
