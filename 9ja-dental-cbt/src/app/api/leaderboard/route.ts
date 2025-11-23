import { NextRequest, NextResponse } from "next/server";
import {
  getLeaderboardEntries,
  type LeaderboardPeriod,
} from "@/services/leaderboardService";

const DEFAULT_LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedPeriodRaw = (
      searchParams.get("period") ?? "weekly"
    ).toLowerCase();
    const requestedPeriod =
      requestedPeriodRaw === "all" ? "all-time" : requestedPeriodRaw;
    const allowedPeriods: LeaderboardPeriod[] = [
      "daily",
      "weekly",
      "monthly",
      "all-time",
    ];
    const period = allowedPeriods.includes(requestedPeriod as LeaderboardPeriod)
      ? (requestedPeriod as LeaderboardPeriod)
      : "weekly";

    const entries = await getLeaderboardEntries(period, DEFAULT_LIMIT);

    return NextResponse.json({
      success: true,
      data: {
        period,
        entries,
        totalUsers: entries.length,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[leaderboard] Failed to fetch entries", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leaderboard",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
