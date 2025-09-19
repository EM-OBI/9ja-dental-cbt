"use client";

import React, { useState, useEffect } from "react";
import { Search, Trophy, Flame, Medal, Crown, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [filteredData, setFilteredData] =
    useState<LeaderboardEntry[]>(mockLeaderboardData);
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [specialtyFilter, setSpecialtyFilter] = useState("General");
  const [sortBy, setSortBy] = useState("By Score");
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = leaderboardData.find((entry) => entry.isCurrentUser);

  // Filter and sort data
  useEffect(() => {
    let filtered = [...leaderboardData];

    // Apply specialty filter
    if (specialtyFilter !== "General") {
      filtered = filtered.filter(
        (entry) => entry.specialty === specialtyFilter
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((entry) =>
        entry.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === "By Streak") {
      filtered.sort((a, b) => b.streak - a.streak);
    } else {
      filtered.sort((a, b) => b.score - a.score);
    }

    // Re-rank after filtering and sorting
    filtered = filtered.map((entry, index) => ({ ...entry, rank: index + 1 }));

    setFilteredData(filtered);
  }, [leaderboardData, specialtyFilter, searchQuery, sortBy]);

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
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Time Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Time Period
              </label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Time">All Time</SelectItem>
                  <SelectItem value="This Month">This Month</SelectItem>
                  <SelectItem value="This Week">This Week</SelectItem>
                  <SelectItem value="Today">Today</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Category
              </label>
              <Select
                value={specialtyFilter}
                onValueChange={setSpecialtyFilter}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">All Categories</SelectItem>
                  <SelectItem value="Endodontics">Endodontics</SelectItem>
                  <SelectItem value="Prosthodontics">Prosthodontics</SelectItem>
                  <SelectItem value="Orthodontics">Orthodontics</SelectItem>
                  <SelectItem value="Periodontics">Periodontics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="By Score">By Score</SelectItem>
                  <SelectItem value="By Streak">By Streak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      {filteredData.length >= 3 && (
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {filteredData.slice(0, 3).map((entry, index) => (
                <div
                  key={entry.id}
                  className={`text-center p-3 sm:p-4 rounded-lg ${
                    index === 0
                      ? "bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20"
                      : index === 1
                      ? "bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20"
                      : "bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20"
                  }`}
                >
                  <div className="mb-2 sm:mb-3">
                    {index === 0 && (
                      <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mx-auto mb-1 sm:mb-2" />
                    )}
                    {index === 1 && (
                      <Medal className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-1 sm:mb-2" />
                    )}
                    {index === 2 && (
                      <Medal className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600 mx-auto mb-1 sm:mb-2" />
                    )}
                  </div>
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-3">
                    <AvatarImage src={entry.avatar} alt={entry.username} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm sm:text-lg">
                      {entry.username
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-sm sm:text-lg mb-1 truncate px-1">
                    {entry.username.length > 20
                      ? `${entry.username.slice(0, 20)}...`
                      : entry.username}
                  </h3>
                  <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">
                    {entry.score > 999
                      ? `${(entry.score / 1000).toFixed(1)}k`
                      : entry.score.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                    <span className="text-xs sm:text-sm text-orange-500 font-medium">
                      {entry.streak} streak
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card className="mb-20 sm:mb-0">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Full Rankings</CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredData.length}{" "}
            {filteredData.length === 1 ? "player" : "players"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 sm:space-y-3">
            {filteredData.length > 0 ? (
              filteredData.map((entry) => (
                <LeaderboardItem
                  key={entry.id}
                  entry={entry}
                  isHighlighted={entry.isCurrentUser}
                />
              ))
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

      {/* Sticky Bottom Bar - Your Position */}
      {currentUser && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 sm:hidden shadow-lg">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Your Rank:
                </span>
                <span className="font-bold text-base sm:text-lg">
                  #{currentUser.rank}
                </span>
                <span className="font-medium text-sm truncate max-w-24">
                  {currentUser.username.length > 12
                    ? `${currentUser.username.slice(0, 12)}...`
                    : currentUser.username}
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm sm:text-base">
                  {currentUser.score > 999
                    ? `${(currentUser.score / 1000).toFixed(1)}k`
                    : currentUser.score.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-500">
                    {currentUser.streak}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
