import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  user,
  quizResults,
  studySessions,
  questions,
  specialties,
} from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    console.log("[dashboard/stats] Fetching dashboard statistics...");
    const db = await getDb();

    // Get total users
    console.log("[dashboard/stats] Querying total users...");
    const totalUsersResult = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(user);
    const totalUsers = totalUsersResult[0]?.count || 0;
    console.log("[dashboard/stats] Total users:", totalUsers);

    // Get total quiz results (only practice/study quizzes)
    const totalQuizzesResult = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(quizResults)
      .where(sql`${quizResults.quizType} = 'practice'`);
    const totalQuizzes = totalQuizzesResult[0]?.count || 0;

    // Get total study sessions
    const totalStudySessionsResult = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(studySessions);
    const totalStudySessions = totalStudySessionsResult[0]?.count || 0;

    // Get total questions
    const totalQuestionsResult = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(questions);
    const totalQuestions = totalQuestionsResult[0]?.count || 0;

    // Get total specialties
    const totalSpecialtiesResult = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(specialties);
    const totalSpecialties = totalSpecialtiesResult[0]?.count || 0;

    // Get average quiz score (only practice/study quizzes)
    const avgScoreResult = await db
      .select({
        avg: sql<number>`CAST(COALESCE(AVG(${quizResults.score}), 0) AS INTEGER)`,
      })
      .from(quizResults)
      .where(sql`${quizResults.quizType} = 'practice'`);
    const averageQuizScore = avgScoreResult[0]?.avg || 0;

    // Get active users (users who completed a practice quiz in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsersResult = await db
      .select({
        count: sql<number>`CAST(COUNT(DISTINCT ${quizResults.userId}) AS INTEGER)`,
      })
      .from(quizResults)
      .where(
        sql`${quizResults.completedAt} >= ${sevenDaysAgo.toISOString()} AND ${
          quizResults.quizType
        } = 'practice'`
      );
    const activeUsers = activeUsersResult[0]?.count || 0;

    // Get total study time (in minutes)
    const totalStudyTimeResult = await db
      .select({
        total: sql<number>`CAST(COALESCE(SUM(${studySessions.duration}), 0) AS INTEGER)`,
      })
      .from(studySessions);
    const totalStudyTime = totalStudyTimeResult[0]?.total || 0;

    const responseData = {
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      quizzes: {
        total: totalQuizzes,
        averageScore: averageQuizScore,
      },
      studySessions: {
        total: totalStudySessions,
        totalMinutes: totalStudyTime,
      },
      content: {
        questions: totalQuestions,
        specialties: totalSpecialties,
      },
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("[dashboard/stats] Fatal error:", error);
    console.error(
      "[dashboard/stats] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
