import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { quizResults, userStreaks, specialties } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import {
  createKVCacheFromContext,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/services/kvCache";

interface UserStats {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  totalTimeSpent: number; // in seconds
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  specialtyBreakdown: Array<{
    specialty: string;
    quizCount: number;
    averageScore: number;
    lastAttempt: string;
  }>;
  recentPerformance: Array<{
    date: string;
    score: number;
    quizCount: number;
  }>;
  weakestTopics: Array<{
    topic: string;
    score: number;
    attempts: number;
  }>;
  strongestTopics: Array<{
    topic: string;
    score: number;
    attempts: number;
  }>;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      console.error("[api/users/stats] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const cache = await createKVCacheFromContext();

    // Try cache first
    const cacheKey = CACHE_KEYS.USER_STATS(userId);
    const cached = await cache.get<UserStats>(cacheKey);

    if (cached) {
      console.log(`[api/users/stats] Cache hit for user ${userId}`);
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    console.log(
      `[api/users/stats] Cache miss for user ${userId} - computing stats`
    );

    const db = await getDb();

    // Get all quiz results for the user with specialty info
    const results = await db
      .select({
        id: quizResults.id,
        score: quizResults.score,
        totalQuestions: quizResults.totalQuestions,
        timeTaken: quizResults.timeTaken,
        completedAt: quizResults.completedAt,
        specialtyId: quizResults.specialtyId,
        specialtyName: specialties.name,
      })
      .from(quizResults)
      .leftJoin(specialties, eq(quizResults.specialtyId, specialties.id))
      .where(eq(quizResults.userId, userId))
      .orderBy(sql`${quizResults.completedAt} DESC`)
      .all();

    const quizResultsData = results.map((r) => ({
      id: r.id,
      score: r.score,
      total_questions: r.totalQuestions,
      time_spent: r.timeTaken,
      completed_at: r.completedAt ? r.completedAt.getTime() : Date.now(),
      specialty_id: r.specialtyId,
      specialty_name: r.specialtyName,
    }));

    // Calculate overall stats
    const totalQuizzes = quizResultsData.length;
    const totalQuestions = quizResultsData.reduce(
      (sum, r) => sum + r.total_questions,
      0
    );
    const correctAnswers = quizResultsData.reduce((sum, r) => sum + r.score, 0);
    const totalTimeSpent = quizResultsData.reduce(
      (sum, r) => sum + (r.time_spent || 0),
      0
    );
    const averageScore =
      totalQuizzes > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const bestScore =
      totalQuizzes > 0
        ? Math.max(
            ...quizResultsData.map((r) =>
              Math.round((r.score / r.total_questions) * 100)
            )
          )
        : 0;

    // Get streak data from user_streaks table
    const streakData = await db
      .select({
        currentCount: userStreaks.currentCount,
        bestCount: userStreaks.bestCount,
      })
      .from(userStreaks)
      .where(
        and(
          eq(userStreaks.userId, userId),
          eq(userStreaks.streakType, "daily_quiz")
        )
      )
      .get();

    const currentStreak = streakData?.currentCount || 0;
    const longestStreak = streakData?.bestCount || 0;

    // Calculate specialty breakdown
    const specialtyMap = new Map<
      string,
      {
        quizCount: number;
        totalScore: number;
        totalQuestions: number;
        lastAttempt: number;
      }
    >();

    quizResultsData.forEach((result) => {
      const specialty = result.specialty_name || "General";
      const existing = specialtyMap.get(specialty) || {
        quizCount: 0,
        totalScore: 0,
        totalQuestions: 0,
        lastAttempt: 0,
      };

      specialtyMap.set(specialty, {
        quizCount: existing.quizCount + 1,
        totalScore: existing.totalScore + result.score,
        totalQuestions: existing.totalQuestions + result.total_questions,
        lastAttempt: Math.max(existing.lastAttempt, result.completed_at),
      });
    });

    const specialtyBreakdown = Array.from(specialtyMap.entries())
      .map(([specialty, data]) => ({
        specialty,
        quizCount: data.quizCount,
        averageScore: Math.round((data.totalScore / data.totalQuestions) * 100),
        lastAttempt: new Date(data.lastAttempt).toISOString(),
      }))
      .sort((a, b) => b.quizCount - a.quizCount);

    // Find strongest and weakest topics (min 2 attempts)
    const topicsWithMultipleAttempts = Array.from(specialtyMap.entries())
      .filter(([, data]) => data.quizCount >= 2)
      .map(([specialty, data]) => ({
        topic: specialty,
        score: Math.round((data.totalScore / data.totalQuestions) * 100),
        attempts: data.quizCount,
      }));

    const strongestTopics = topicsWithMultipleAttempts
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const weakestTopics = topicsWithMultipleAttempts
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    // Calculate recent performance (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentQuizzes = quizResultsData.filter(
      (r) => r.completed_at >= sevenDaysAgo
    );

    const performanceByDay = new Map<
      string,
      {
        totalScore: number;
        totalQuestions: number;
        quizCount: number;
      }
    >();

    recentQuizzes.forEach((result) => {
      const dateKey = new Date(result.completed_at).toISOString().split("T")[0];
      const existing = performanceByDay.get(dateKey) || {
        totalScore: 0,
        totalQuestions: 0,
        quizCount: 0,
      };

      performanceByDay.set(dateKey, {
        totalScore: existing.totalScore + result.score,
        totalQuestions: existing.totalQuestions + result.total_questions,
        quizCount: existing.quizCount + 1,
      });
    });

    const recentPerformance = Array.from(performanceByDay.entries())
      .map(([date, data]) => ({
        date,
        score: Math.round((data.totalScore / data.totalQuestions) * 100),
        quizCount: data.quizCount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const stats: UserStats = {
      totalQuizzes,
      totalQuestions,
      correctAnswers,
      averageScore,
      totalTimeSpent,
      bestScore,
      currentStreak,
      longestStreak,
      specialtyBreakdown,
      recentPerformance,
      weakestTopics,
      strongestTopics,
    };

    // Cache the results
    await cache.set(cacheKey, stats, CACHE_TTL.USER_STATS);
    console.log(`[api/users/stats] Cached stats for user ${userId}`);

    return NextResponse.json({
      success: true,
      data: stats,
      cached: false,
    });
  } catch (error) {
    console.error("[api/users/stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
