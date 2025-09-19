"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Trophy,
  Flame,
  Medal,
  Crown,
  Filter,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Mock data - In a real app, this would come from an API
const mockLeaderboardData = [
  {
    id: 1,
    rank: 1,
    username: "Dr. Sarah Ahmed",
    avatar: "/avatars/sarah.jpg",
    score: 24500,
    streak: 45,
    specialty: "Endodontics",
    totalQuizzes: 156,
    accuracy: 94.5,
    isCurrentUser: false,
  },
  {
    id: 2,
    rank: 2,
    username: "Dr. Michael Okafor",
    avatar: "/avatars/michael.jpg",
    score: 23800,
    streak: 38,
    specialty: "Prosthodontics",
    totalQuizzes: 142,
    accuracy: 92.8,
    isCurrentUser: false,
  },
  {
    id: 3,
    rank: 3,
    username: "Dr. Fatima Bello",
    avatar: "/avatars/fatima.jpg",
    score: 22900,
    streak: 52,
    specialty: "Orthodontics",
    totalQuizzes: 134,
    accuracy: 93.2,
    isCurrentUser: false,
  },
  {
    id: 4,
    rank: 4,
    username: "Dr. Alex Johnson",
    avatar: "/avatars/alex.jpg",
    score: 21200,
    streak: 12,
    specialty: "General",
    totalQuizzes: 98,
    accuracy: 89.5,
    isCurrentUser: true, // This would be determined by comparing with current user
  },
  {
    id: 5,
    rank: 5,
    username: "Dr. Kemi Adebayo",
    avatar: "/avatars/kemi.jpg",
    score: 20800,
    streak: 28,
    specialty: "Periodontics",
    totalQuizzes: 87,
    accuracy: 91.2,
    isCurrentUser: false,
  },
  {
    id: 6,
    rank: 6,
    username: "Dr. Ibrahim Musa",
    avatar: "/avatars/ibrahim.jpg",
    score: 19500,
    streak: 15,
    specialty: "Endodontics",
    totalQuizzes: 79,
    accuracy: 88.7,
    isCurrentUser: false,
  },
  {
    id: 7,
    rank: 7,
    username: "Dr. Grace Okoro",
    avatar: "/avatars/grace.jpg",
    score: 18900,
    streak: 22,
    specialty: "General",
    totalQuizzes: 73,
    accuracy: 90.1,
    isCurrentUser: false,
  },
  {
    id: 8,
    rank: 8,
    username: "Dr. Abdul Rahman",
    avatar: "/avatars/abdul.jpg",
    score: 18200,
    streak: 19,
    specialty: "Orthodontics",
    totalQuizzes: 68,
    accuracy: 87.9,
    isCurrentUser: false,
  },
  // Additional mock data for infinite scroll demonstration
  ...Array.from({ length: 50 }, (_, i) => ({
    id: i + 9,
    rank: i + 9,
    username: `Dr. User ${i + 9}`,
    avatar: `/avatars/user${i + 9}.jpg`,
    score: 18000 - i * 50,
    streak: Math.floor(Math.random() * 30) + 1,
    specialty: [
      "Endodontics",
      "Prosthodontics",
      "Orthodontics",
      "Periodontics",
      "General",
    ][i % 5],
    totalQuizzes: Math.floor(Math.random() * 100) + 20,
    accuracy: Math.floor(Math.random() * 20) + 80,
    isCurrentUser: false,
  })),
];

interface LeaderboardEntry {
  id: number;
  rank: number;
  username: string;
  avatar: string;
  score: number;
  streak: number;
  specialty: string;
  totalQuizzes: number;
  accuracy: number;
  isCurrentUser: boolean;
}

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isHighlighted?: boolean;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  entry,
  isHighlighted = false,
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />;
      default:
        return (
          <span className="text-sm sm:text-lg font-bold text-gray-600 dark:text-gray-300">
            #{rank}
          </span>
        );
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-red-500";
    if (streak >= 15) return "text-orange-500";
    if (streak >= 7) return "text-yellow-500";
    return "text-gray-500";
  };

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        isHighlighted
          ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
    >
      <CardContent className="p-3 sm:p-4">
        {/* Mobile Layout */}
        <div className="flex items-center gap-3 sm:hidden">
          {/* Rank */}
          <div className="flex-shrink-0 w-8 flex justify-center">
            {getRankIcon(entry.rank)}
          </div>

          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={entry.avatar} alt={entry.username} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
              {entry.username
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* User Info - Mobile */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                {entry.username.length > 15
                  ? `${entry.username.slice(0, 15)}...`
                  : entry.username}
                {entry.isCurrentUser && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    You
                  </Badge>
                )}
              </h3>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {entry.score > 999
                    ? `${(entry.score / 1000).toFixed(1)}k`
                    : entry.score.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="truncate max-w-20">{entry.specialty}</span>
                <span>•</span>
                <span>{entry.accuracy}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className={`h-3 w-3 ${getStreakColor(entry.streak)}`} />
                <span
                  className={`text-xs font-medium ${getStreakColor(
                    entry.streak
                  )}`}
                >
                  {entry.streak}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Rank */}
          <div className="flex-shrink-0 w-12 flex justify-center">
            {getRankIcon(entry.rank)}
          </div>

          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={entry.avatar} alt={entry.username} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {entry.username
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {entry.username}
                {entry.isCurrentUser && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    You
                  </Badge>
                )}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{entry.specialty}</span>
              <span>{entry.totalQuizzes} quizzes</span>
              <span>{entry.accuracy}% accuracy</span>
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {entry.score.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 justify-end">
              <Flame className={`h-4 w-4 ${getStreakColor(entry.streak)}`} />
              <span
                className={`text-sm font-medium ${getStreakColor(
                  entry.streak
                )}`}
              >
                {entry.streak}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardEntry[]>(mockLeaderboardData);
  const [displayedData, setDisplayedData] = useState<LeaderboardEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const currentUser = leaderboardData.find((entry) => entry.isCurrentUser);

  // Load more data for infinite scroll
  const loadMoreData = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = page * itemsPerPage;
      const newData = leaderboardData.slice(startIndex, endIndex);

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedData((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);
      }

      setLoading(false);
    }, 500);
  }, [loading, hasMore, page, leaderboardData, itemsPerPage]);

  // Initialize data and handle time filter changes
  useEffect(() => {
    let filtered = [...leaderboardData];

    // Apply sorting by score (default)
    filtered.sort((a, b) => b.score - a.score);

    // Re-rank after filtering and sorting
    filtered = filtered.map((entry, index) => ({ ...entry, rank: index + 1 }));

    // Reset pagination
    setPage(1);
    setHasMore(true);
    setDisplayedData(filtered.slice(0, itemsPerPage));
    setPage(2);
  }, [leaderboardData, timeFilter, itemsPerPage]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMoreData();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreData]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small score updates
      setLeaderboardData((prev) =>
        prev.map((entry) => ({
          ...entry,
          score: entry.score + Math.floor(Math.random() * 10),
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Leaderboard
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          See how you rank among other players
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex justify-end mb-4 sm:mb-6">
        {/* Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10 gap-2">
              <Filter className="h-4 w-4" />
              Time Period
              {timeFilter !== "All Time" && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  1
                </Badge>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Time Period</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setTimeFilter("All Time")}
              className={
                timeFilter === "All Time" ? "bg-blue-50 dark:bg-blue-950" : ""
              }
            >
              All Time
              {timeFilter === "All Time" && (
                <Badge variant="secondary" className="ml-auto">
                  ✓
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTimeFilter("This Month")}
              className={
                timeFilter === "This Month" ? "bg-blue-50 dark:bg-blue-950" : ""
              }
            >
              This Month
              {timeFilter === "This Month" && (
                <Badge variant="secondary" className="ml-auto">
                  ✓
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTimeFilter("This Week")}
              className={
                timeFilter === "This Week" ? "bg-blue-50 dark:bg-blue-950" : ""
              }
            >
              This Week
              {timeFilter === "This Week" && (
                <Badge variant="secondary" className="ml-auto">
                  ✓
                </Badge>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTimeFilter("Today")}
              className={
                timeFilter === "Today" ? "bg-blue-50 dark:bg-blue-950" : ""
              }
            >
              Today
              {timeFilter === "Today" && (
                <Badge variant="secondary" className="ml-auto">
                  ✓
                </Badge>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Full Leaderboard */}
      <Card className="mb-20 sm:mb-0">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Rankings</CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Showing {displayedData.length}{" "}
            {displayedData.length === 1 ? "player" : "players"}
            {hasMore && " (scroll for more)"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {displayedData.length > 0 ? (
              <>
                {displayedData.map((entry) => (
                  <LeaderboardItem
                    key={entry.id}
                    entry={entry}
                    isHighlighted={entry.isCurrentUser}
                  />
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-center py-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading more players...</span>
                    </div>
                  </div>
                )}

                {/* End of list indicator */}
                {!hasMore && displayedData.length > itemsPerPage && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">
                      You&apos;ve reached the end of the leaderboard
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
                <Trophy className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">
                  No players found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
