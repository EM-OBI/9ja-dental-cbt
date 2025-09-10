import React from "react";
import { Goal } from "@/types/dashboard";
import { Calendar, Target, Clock } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface GoalsWidgetProps {
  goals: Goal[];
  maxItems?: number;
}

export default function GoalsWidget({ goals, maxItems = 3 }: GoalsWidgetProps) {
  const displayedGoals = goals.slice(0, maxItems);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Current Goals
        </h3>
        <Target className="w-5 h-5 text-blue-500" />
      </div>

      <div className="space-y-4">
        {displayedGoals.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">
            No active goals
          </p>
        ) : (
          displayedGoals.map((goal) => {
            const progress = (goal.currentValue / goal.targetValue) * 100;
            const isOverdue = new Date() > goal.deadline && !goal.isCompleted;
            const isNearDeadline =
              !goal.isCompleted &&
              goal.deadline.getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000; // 2 days

            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4
                      className={cn(
                        "text-sm font-medium",
                        goal.isCompleted
                          ? "text-green-600 dark:text-green-400"
                          : isOverdue
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-900 dark:text-slate-100"
                      )}
                    >
                      {goal.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {goal.description}
                    </p>
                  </div>

                  <div className="text-right ml-2">
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                      {goal.currentValue}/{goal.targetValue} {goal.unit}
                    </div>
                    <div
                      className={cn(
                        "text-xs flex items-center mt-1",
                        isOverdue
                          ? "text-red-500"
                          : isNearDeadline
                          ? "text-yellow-500"
                          : "text-slate-500"
                      )}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {isOverdue
                        ? "Overdue"
                        : formatDistanceToNow(goal.deadline)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      goal.isCompleted
                        ? "bg-green-500"
                        : progress >= 80
                        ? "bg-blue-500"
                        : progress >= 50
                        ? "bg-yellow-500"
                        : "bg-orange-500"
                    )}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {Math.round(progress)}% complete • Due{" "}
                  {format(goal.deadline, "MMM d")}
                </div>
              </div>
            );
          })
        )}
      </div>

      {goals.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View all goals ({goals.length - maxItems} more)
          </button>
        </div>
      )}
    </div>
  );
}
