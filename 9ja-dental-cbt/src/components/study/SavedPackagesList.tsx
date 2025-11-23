"use client";

import React from "react";
import { History, RefreshCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StudyPackageSummary } from "@/hooks/useStudyPackages";

interface SavedPackagesListProps {
  packages: StudyPackageSummary[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenPackage: (pkg: StudyPackageSummary) => void;
}

export function SavedPackagesList({
  packages,
  isLoading,
  error,
  onRefresh,
  onOpenPackage,
}: SavedPackagesListProps) {
  const showPanel = isLoading || error || packages.length > 0;

  if (!showPanel) {
    return (
      <Card className="border-dashed border-slate-200 dark:border-slate-700">
        <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-400">
          You have not generated any study materials yet. Create a new set to
          see it appear here.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-slate-500" />
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-foreground">
            Saved study packages
          </CardTitle>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-xs text-red-500 dark:text-red-400">
              {error}
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Loading saved materials...
          </div>
        ) : packages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            You have not generated any study materials yet. Create a new set to
            see it appear here.
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-foreground">
                  {pkg.title || pkg.topic}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {pkg.specialty && <span>{pkg.specialty}</span>}
                  {pkg.createdAt && <span>· Created {pkg.createdAt}</span>}
                  {pkg.lastAccessed && (
                    <span>· Last used {pkg.lastAccessed}</span>
                  )}
                  <span>· Progress {pkg.progress}%</span>
                  {typeof pkg.quizScore === "number" && (
                    <span>· Best quiz {pkg.quizScore}%</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {pkg.hasSummary && <Badge variant="secondary">Summary</Badge>}
                  {pkg.hasFlashcards && (
                    <Badge variant="secondary">
                      {pkg.flashcardCount} Flashcards
                    </Badge>
                  )}
                  {pkg.hasQuiz && <Badge variant="secondary">Quiz</Badge>}
                  {pkg.masteryLevel && (
                    <Badge variant="outline">Level {pkg.masteryLevel}</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 md:items-center">
                <Button
                  type="button"
                  variant="secondary"
                  className="inline-flex items-center"
                  onClick={() => onOpenPackage(pkg)}
                >
                  Continue studying
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
