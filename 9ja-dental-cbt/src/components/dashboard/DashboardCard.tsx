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
        "bg-white dark:bg-card rounded-lg border border-slate-200 dark:border-border p-6 transition-all hover:border-slate-300 dark:hover:border-slate-600",
        className
      )}
    >
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-muted-foreground">
          {title}
        </p>
        <p className="text-4xl font-semibold text-slate-900 dark:text-foreground">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-border/50">
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-sm font-medium tabular-nums",
                trend.isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-500">
              vs {trend.period}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
