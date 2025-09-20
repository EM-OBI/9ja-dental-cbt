"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface SpecialtyData {
  mastery: string;
  accuracy: string;
  questionsAttempted: number;
  lastAttempted: string;
}

interface SimpleSpecialtyMasteryProps {
  specialtyCoverage: Record<string, SpecialtyData>;
  className?: string;
}

export function SimpleSpecialtyMastery({
  specialtyCoverage,
  className,
}: SimpleSpecialtyMasteryProps) {
  const specialties = Object.entries(specialtyCoverage);

  const getMasteryColor = (mastery: string) => {
    switch (mastery) {
      case "Expert":
        return {
          text: "text-emerald-700 dark:text-emerald-300",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          border: "border-emerald-200 dark:border-emerald-800",
        };
      case "Advanced":
        return {
          text: "text-blue-700 dark:text-blue-300",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800",
        };
      case "Intermediate":
        return {
          text: "text-amber-700 dark:text-amber-300",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-800",
        };
      default:
        return {
          text: "text-slate-700 dark:text-slate-300",
          bg: "bg-slate-50 dark:bg-slate-900/20",
          border: "border-slate-200 dark:border-slate-800",
        };
    }
  };

  if (specialties.length === 0) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-sm">Specialty Mastery</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Complete quizzes to track your specialty progress
        </p>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-blue-600" />
        <h3 className="font-semibold text-sm">Specialty Mastery</h3>
        <Badge variant="secondary" className="text-xs ml-auto">
          {specialties.length} areas
        </Badge>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {specialties.slice(0, 8).map(([specialty, data]) => {
          const colors = getMasteryColor(data.mastery);
          return (
            <div
              key={specialty}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:shadow-sm ${colors.bg} ${colors.border}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {specialty}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.questionsAttempted} questions • {data.lastAttempted}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {data.accuracy}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-xs px-2 py-0.5 ${colors.text} ${colors.border}`}
                  >
                    {data.mastery}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}

        {specialties.length > 8 && (
          <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-muted-foreground">
              +{specialties.length - 8} more specialties
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
