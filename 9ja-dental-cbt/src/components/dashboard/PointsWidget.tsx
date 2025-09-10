"use client";

import React from "react";
import { Star, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "@/components/ui/progress-bar";
import {
  usePointsStore,
  formatPoints,
  getLevelProgress,
} from "@/store/pointsStore";

interface PointsWidgetProps {
  className?: string;
}

const PointsWidget: React.FC<PointsWidgetProps> = ({ className = "" }) => {
  const { userPoints } = usePointsStore();
  const levelProgress = getLevelProgress(userPoints.xp);

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Points & Level
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Points Overview */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPoints(userPoints.totalPoints)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Points
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            Level {userPoints.level}
          </Badge>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Level Progress
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {formatPoints(userPoints.xpToNextLevel)} XP to next level
            </span>
          </div>
          <ProgressBar
            progress={levelProgress}
            className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full"
          />
        </div>

        {/* Today's Progress */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Today
            </span>
          </div>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            +{formatPoints(userPoints.todayPoints)}
          </span>
        </div>

        {/* Active Multipliers */}
        {userPoints.activeMultipliers.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active Bonus
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {userPoints.activeMultipliers[0].multiplier}x
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PointsWidget;
