"use server";

import {
  getLeaderboardEntries,
  type LeaderboardPeriod,
} from "@/services/leaderboardService";

const DEFAULT_LIMIT = 15;

export async function fetchLeaderboardEntries(
  period: LeaderboardPeriod,
  limit: number = DEFAULT_LIMIT
) {
  return getLeaderboardEntries(period, limit);
}
