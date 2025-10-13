/**
 * Quiz History API
 * GET /api/quiz/history
 *
 * Returns paginated quiz history for the authenticated user
 * Supports filtering by specialty and time range
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { quizSessions, quizResults, specialties } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  createKVCacheFromContext,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/services/kvCache";

// Removed: export const runtime = "edge";
// OpenNext for Cloudflare requires edge runtime routes to be in separate files

interface QuizHistoryItem {
  id: string;
  specialty: string;
  specialtyName: string;
  mode: "practice" | "timed" | "exam";
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
  isPassed: boolean;
}

interface QuizHistoryResponse {
  history: QuizHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  stats: {
    totalQuizzes: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get user session using Better-Auth
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      console.error("[api/quiz/history] Unauthorized - No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`[api/quiz/history] Fetching history for user: ${userId}`);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const specialtyFilter = searchParams.get("specialty");
    const offset = (page - 1) * limit;

    // Try to get from cache first
    const cache = await createKVCacheFromContext();
    const cacheKey = CACHE_KEYS.USER_QUIZ_HISTORY(userId, page);
    const cached = await cache.get<QuizHistoryResponse>(cacheKey);

    if (cached) {
      console.log(
        `[api/quiz/history] Returning cached history for user: ${userId}`
      );
      return NextResponse.json(cached);
    }

    const db = await getDb();

    // Build query conditions
    const conditions = [
      eq(quizSessions.userId, userId),
      eq(quizSessions.isCompleted, true), // Only completed quizzes
    ];

    if (specialtyFilter) {
      conditions.push(eq(quizSessions.specialtyId, specialtyFilter));
    }

    // Fetch quiz history
    const history = await db
      .select({
        id: quizSessions.id,
        specialtyId: quizSessions.specialtyId,
        quizType: quizSessions.quizType,
        score: quizResults.score,
        totalQuestions: quizResults.totalQuestions,
        correctAnswers: quizResults.correctAnswers,
        timeTaken: quizResults.timeTaken,
        completedAt: quizResults.completedAt,
        passed: quizResults.passed,
        specialtyName: specialties.name,
      })
      .from(quizSessions)
      .innerJoin(quizResults, eq(quizSessions.id, quizResults.sessionId))
      .leftJoin(specialties, eq(quizSessions.specialtyId, specialties.id))
      .where(and(...conditions))
      .orderBy(desc(quizResults.completedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizSessions)
      .where(and(...conditions));

    // Calculate stats
    const [statsData] = await db
      .select({
        totalQuizzes: sql<number>`count(*)`,
        averageScore: sql<number>`avg(${quizResults.score})`,
        bestScore: sql<number>`max(${quizResults.score})`,
        totalTimeSpent: sql<number>`sum(${quizResults.timeTaken})`,
      })
      .from(quizSessions)
      .innerJoin(quizResults, eq(quizSessions.id, quizResults.sessionId))
      .where(eq(quizSessions.userId, userId));

    const response: QuizHistoryResponse = {
      history: history.map((item) => ({
        id: item.id,
        specialty: item.specialtyId || "general",
        specialtyName: item.specialtyName || "Unknown",
        mode: (item.quizType === "challenge" ? "timed" : item.quizType) as
          | "practice"
          | "timed"
          | "exam",
        score: item.score || 0,
        totalQuestions: item.totalQuestions || 0,
        correctAnswers: item.correctAnswers || 0,
        timeSpent: item.timeTaken || 0,
        completedAt:
          item.completedAt?.toISOString() || new Date().toISOString(),
        isPassed: item.passed || false,
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: offset + limit < (count || 0),
      },
      stats: {
        totalQuizzes: statsData?.totalQuizzes || 0,
        averageScore: Math.round(statsData?.averageScore || 0),
        bestScore: statsData?.bestScore || 0,
        totalTimeSpent: statsData?.totalTimeSpent || 0,
      },
    };

    // Cache the response
    await cache.set(cacheKey, response, CACHE_TTL.QUIZ_HISTORY);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Quiz History API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz history" },
      { status: 500 }
    );
  }
}
