import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { user, quizResults, userProfiles } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";

type LeaderboardPeriod = "daily" | "weekly" | "monthly";

export async function GET(request: NextRequest) {
  try {
    console.log("[leaderboard] Fetching leaderboard data...");
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") ||
      "weekly") as LeaderboardPeriod;

    console.log("[leaderboard] Period:", period);

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "daily":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    // Query leaderboard data with aggregated quiz results (only practice quizzes)
    const totalScoreExpr = sql<number>`COALESCE(SUM(${quizResults.pointsEarned}), 0)`;
    const averageScoreExpr = sql<number>`COALESCE(AVG(${quizResults.score}), 0)`;
    const quizzesCompletedExpr = sql<number>`COALESCE(COUNT(${quizResults.id}), 0)`;
    const totalXpExpr = sql<number>`COALESCE(MAX(${userProfiles.xp}), 0)`;
    const levelExpr = sql<number>`COALESCE(MAX(${userProfiles.level}), 1)`;

    const leaderboardEntries = await db
      .select({
        id: user.id,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userAvatar: user.image,
        totalScore: sql<number>`CAST(${totalScoreExpr} AS INTEGER)`,
        totalXp: sql<number>`CAST(${totalXpExpr} AS INTEGER)`,
        quizzesCompleted: sql<number>`CAST(${quizzesCompletedExpr} AS INTEGER)`,
        averageScore: sql<number>`ROUND(${averageScoreExpr})`,
        level: sql<number>`CAST(${levelExpr} AS INTEGER)`,
      })
      .from(user)
      .leftJoin(
        quizResults,
        sql`${user.id} = ${quizResults.userId} AND ${
          quizResults.completedAt
        } >= ${startDate.toISOString()} AND ${
          quizResults.quizType
        } = 'practice'`
      )
      .leftJoin(userProfiles, eq(userProfiles.userId, user.id))
      .groupBy(user.id, user.name, user.email, user.image)
      .orderBy(
        desc(totalScoreExpr),
        desc(averageScoreExpr),
        desc(totalXpExpr),
        desc(quizzesCompletedExpr)
      )
      .limit(50);

    // Add rank to each entry
    const rankedEntries = leaderboardEntries.map((entry, index) => ({
      id: entry.id,
      rank: index + 1,
      userId: entry.userId,
      userName: entry.userName || "Anonymous",
      userEmail: entry.userEmail,
      userAvatar: entry.userAvatar || null,
      totalScore: entry.totalScore || 0,
      quizzesCompleted: entry.quizzesCompleted || 0,
      averageScore: entry.averageScore || 0,
      level: entry.level || 1,
      totalXp: entry.totalXp || 0,
    }));

    const responseData = {
      period,
      entries: rankedEntries,
      totalUsers: rankedEntries.length,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("[leaderboard] Fatal error:", error);
    console.error(
      "[leaderboard] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
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
