import React from "react";
import { DashboardCardProps } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export default function DashboardCard({
  title,
  value,
  subtitle,
  trend,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700 group",
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {title}
          </p>
          {trend && (
            <div className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            )}>
              <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-800/50 flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            vs {trend.period}
          </span>
        </div>
      )}
    </div>
  );
}
