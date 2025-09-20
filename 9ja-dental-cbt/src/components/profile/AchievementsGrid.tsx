"use client";

import React from "react";
import { Trophy, Flame, Star, Award, Target, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleSpecialtyMastery } from "@/components/profile/SimpleSpecialtyMastery";
import { useProgressStore } from "@/store/progressStore";
import { cn } from "@/lib/utils";

interface SpecialtyData {
  mastery: string;
  accuracy: string;
  questionsAttempted: number;
  lastAttempted: string;
}

interface AchievementsGridProps {
  className?: string;
  specialtyCoverage?: Record<string, SpecialtyData>;
}

export function AchievementsGrid({
  className,
  specialtyCoverage,
}: AchievementsGridProps) {
  const { achievements, streakData } = useProgressStore();

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.isUnlocked
  );
  const lockedAchievements = achievements.filter(
    (achievement) => !achievement.isUnlocked
  );

  const streakStats = [
    {
      id: "current-streak",
      title: "Current Streak",
      value: streakData.currentStreak,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      id: "longest-streak",
      title: "Longest Streak",
      value: streakData.longestStreak,
      icon: Award,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    },
    {
      id: "monthly-goal",
      title: "Monthly Goal",
      value: `${Math.min(streakData.currentStreak, streakData.monthlyGoal)}/${
        streakData.monthlyGoal
      }`,
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
  ];

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case "🎯":
        return Target;
      case "🏆":
        return Trophy;
      case "⭐":
        return Star;
      case "🔥":
        return Flame;
      case "📅":
        return Calendar;
      default:
        return Award;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Streak Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Study Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {streakStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.id}
                className={cn(
                  "p-4 border-2 transition-colors",
                  stat.bgColor,
                  stat.borderColor
                )}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={cn(
                      "p-2 rounded-full bg-white dark:bg-gray-800",
                      stat.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className={cn("text-xl font-bold", stat.color)}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Specialty Mastery */}
      {specialtyCoverage && Object.keys(specialtyCoverage).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimpleSpecialtyMastery
              specialtyCoverage={specialtyCoverage}
              className="md:col-span-2"
            />
          </div>
        </div>
      )}

      {/* Unlocked Achievements */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Achievements ({unlockedAchievements.length})
        </h3>

        {unlockedAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => {
              const Icon = getAchievementIcon(achievement.icon);
              return (
                <Card
                  key={achievement.id}
                  className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                      <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800 dark:text-green-200">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                        {achievement.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                        >
                          {achievement.category}
                        </Badge>
                        <span className="text-xs text-green-500 dark:text-green-400">
                          ✓ Completed
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-semibold text-muted-foreground mb-2">
              No achievements yet
            </h4>
            <p className="text-sm text-muted-foreground">
              Complete quizzes and maintain study streaks to earn your first
              achievement!
            </p>
          </Card>
        )}
      </div>

      {/* Locked Achievements (Preview) */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Upcoming Achievements ({lockedAchievements.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.slice(0, 6).map((achievement) => {
              const Icon = getAchievementIcon(achievement.icon);
              const progressPercentage = Math.min(
                (achievement.progress / achievement.criteria.target) * 100,
                100
              );

              return (
                <Card
                  key={achievement.id}
                  className="p-4 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 opacity-75"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {achievement.description}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>
                            {achievement.progress}/{achievement.criteria.target}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={cn(
                              "bg-gray-400 dark:bg-gray-500 h-2 rounded-full transition-all",
                              progressPercentage > 0 && "min-w-[2px]"
                            )}
                            style={{
                              width:
                                progressPercentage > 0
                                  ? `${Math.max(progressPercentage, 2)}%`
                                  : "0%",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
