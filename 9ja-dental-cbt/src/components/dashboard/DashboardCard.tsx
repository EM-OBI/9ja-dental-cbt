import React from "react";
import { DashboardCardProps } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {trend.value > 0 ? "+" : ""}
            {trend.value}%
          </div>
          <span className="text-slate-500 dark:text-slate-400 text-sm ml-2">
            vs {trend.period}
          </span>
        </div>
      )}
    </div>
  );
}
