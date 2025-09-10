"use client";

import React, { useState } from "react";
import {
  Star,
  TrendingUp,
  Award,
  Zap,
  Clock,
  Calendar,
  Trophy,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProgressBar from "@/components/ui/progress-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePointsStore,
  formatPoints,
  getLevelProgress,
  type PointsTransaction,
} from "@/store/pointsStore";
import { format } from "date-fns";

interface PointsDisplayProps {
  showHeader?: boolean;
  showTransactions?: boolean;
  compact?: boolean;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({
  showHeader = true,
  showTransactions = true,
  compact = false,
}) => {
  const { userPoints } = usePointsStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "transactions" | "multipliers"
  >("overview");

  const levelProgress = getLevelProgress(userPoints.xp);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "quiz_completion":
      case "quiz_perfect_score":
      case "quiz_high_score":
        return <Trophy className="h-4 w-4 text-blue-500" />;
      case "study_session":
        return <Target className="h-4 w-4 text-green-500" />;
      case "daily_streak":
      case "weekly_streak":
      case "monthly_streak":
        return <Zap className="h-4 w-4 text-orange-500" />;
      case "achievement_earned":
        return <Award className="h-4 w-4 text-purple-500" />;
      case "level_up":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "daily_login":
        return <Calendar className="h-4 w-4 text-indigo-500" />;
      default:
        return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  const TransactionItem: React.FC<{ transaction: PointsTransaction }> = ({
    transaction,
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        {getEventIcon(transaction.type)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {transaction.description}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {format(new Date(transaction.timestamp), "MMM dd, HH:mm")}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`text-sm font-bold ${
            transaction.points > 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {transaction.points > 0 ? "+" : ""}
          {formatPoints(transaction.points)}
        </span>
        {transaction.multiplier && transaction.multiplier > 1 && (
          <div className="text-xs text-purple-600 dark:text-purple-400">
            {transaction.multiplier}x multiplier
          </div>
        )}
      </div>
    </div>
  );

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPoints(userPoints.totalPoints)}
              </span>
              <Badge variant="secondary">Level {userPoints.level}</Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Today
              </div>
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                +{formatPoints(userPoints.todayPoints)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Points */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPoints(userPoints.totalPoints)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Level & Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Level & Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-sm">
                    Level {userPoints.level}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatPoints(userPoints.xpToNextLevel)} XP to next
                  </span>
                </div>
                <ProgressBar
                  progress={levelProgress}
                  className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Today's Points */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today&apos;s Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{formatPoints(userPoints.todayPoints)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Active Multipliers */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Bonuses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userPoints.activeMultipliers.length > 0 ? (
                <div className="space-y-1">
                  {userPoints.activeMultipliers
                    .slice(0, 2)
                    .map((multiplier) => (
                      <Badge
                        key={multiplier.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {multiplier.multiplier}x {multiplier.name}
                      </Badge>
                    ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">
                    None active
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showTransactions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Points Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(
                  value as "overview" | "transactions" | "multipliers"
                )
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Recent Activity</TabsTrigger>
                <TabsTrigger value="multipliers">Bonuses</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPoints(userPoints.weekPoints)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      This Week
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatPoints(userPoints.monthPoints)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      This Month
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {userPoints.transactions.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Activities
                    </div>
                  </div>
                </div>

                {/* Points History Chart */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Daily Points (Last 7 Days)
                  </h4>
                  <div className="flex items-end gap-2 h-20">
                    {userPoints.pointsHistory.slice(-7).map((day) => {
                      const maxPoints = Math.max(
                        ...userPoints.pointsHistory
                          .slice(-7)
                          .map((d) => d.points)
                      );
                      const heightPercentage = Math.max(
                        5,
                        (day.points / maxPoints) * 100
                      );

                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div
                            className={`w-full bg-blue-200 dark:bg-blue-800 rounded-t transition-all duration-300 ${
                              heightPercentage > 75
                                ? "h-full"
                                : heightPercentage > 50
                                ? "h-3/4"
                                : heightPercentage > 25
                                ? "h-1/2"
                                : "h-1/4"
                            }`}
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {format(new Date(day.date), "dd")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-3">
                {userPoints.transactions.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {userPoints.transactions.slice(0, 20).map((transaction) => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="multipliers" className="space-y-4">
                {userPoints.activeMultipliers.length > 0 ? (
                  <div className="space-y-3">
                    {userPoints.activeMultipliers.map((multiplier) => (
                      <div
                        key={multiplier.id}
                        className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {multiplier.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {multiplier.description}
                          </p>
                          {multiplier.validUntil && (
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              Valid until{" "}
                              {format(
                                new Date(multiplier.validUntil),
                                "MMM dd, yyyy"
                              )}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {multiplier.multiplier}x
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active multipliers</p>
                    <p className="text-sm mt-2">
                      Complete achievements to unlock point bonuses!
                    </p>
                  </div>
                )}

                {/* Available Multipliers Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    How to Earn Bonuses
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        Weekly Streak
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        1.5x points for 7 days
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                        Perfect Score
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        2x points on next quiz
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PointsDisplay;
