import { getDb } from "@/db";
import { user, userProfiles } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { LeaderboardEntry } from "@/types/dashboard";

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "all-time";

const LEADERBOARD_LIMIT_DEFAULT = 50;

const TOTAL_XP_EXPR = sql<number>`COALESCE(${userProfiles.xp}, 0)`;
const LEVEL_EXPR = sql<number>`COALESCE(${userProfiles.level}, 1)`;

export async function getLeaderboardEntries(
  period: LeaderboardPeriod,
  limit: number = LEADERBOARD_LIMIT_DEFAULT
): Promise<LeaderboardEntry[]> {
  const db = await getDb();

  // Period is currently informational only while the leaderboard focuses on total XP
  void period;

  const rows = await db
    .select({
      id: user.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.image,
      totalXp: sql<number>`CAST(${TOTAL_XP_EXPR} AS INTEGER)`,
      level: sql<number>`CAST(${LEVEL_EXPR} AS INTEGER)`,
    })
    .from(user)
    .leftJoin(userProfiles, eq(userProfiles.userId, user.id))
    .orderBy(desc(TOTAL_XP_EXPR), desc(LEVEL_EXPR))
    .limit(limit);

  return rows.map((row, index) => ({
    id: row.id,
    userId: row.userId,
    userName: row.userName ?? "Anonymous",
    userAvatar: row.userAvatar ?? undefined,
    totalScore: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    rank: index + 1,
    level: row.level ?? 1,
    totalXp: row.totalXp ?? 0,
  }));
}
