"use client";

import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-card rounded-lg border border-slate-200 dark:border-border p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-8 w-12 ml-auto" />
          <Skeleton className="h-3 w-10 ml-auto" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={`header-${index}`} className="h-3" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 21 }).map((_, index) => (
            <Skeleton key={`day-${index}`} className="aspect-square" />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-200/70 dark:border-slate-700/60">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="py-4">
      <div className="mx-auto max-w-7xl px-4 md:px-6 space-y-6">
        <div className="flex items-center justify-between bg-white dark:bg-card rounded-lg p-4 border border-slate-200 dark:border-border">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>

            <div className="lg:hidden mt-6">
              <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border">
                <CalendarSkeleton />
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:w-80 xl:w-96">
            <div className="bg-white dark:bg-card rounded-lg border border-slate-200 dark:border-border sticky top-6">
              <CalendarSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
