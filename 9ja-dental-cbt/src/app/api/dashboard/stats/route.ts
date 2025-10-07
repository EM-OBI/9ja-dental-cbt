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
    const db = await getDb();
    // Get total users
    const totalUsersResult = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(user);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get total quiz results
    const totalQuizzesResult = await db
      .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
      .from(quizResults);
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

    // Get average quiz score
    const avgScoreResult = await db
      .select({
        avg: sql<number>`CAST(COALESCE(AVG(${quizResults.score}), 0) AS INTEGER)`,
      })
      .from(quizResults);
    const averageQuizScore = avgScoreResult[0]?.avg || 0;

    // Get active users (users who completed a quiz in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsersResult = await db
      .select({
        count: sql<number>`CAST(COUNT(DISTINCT ${quizResults.userId}) AS INTEGER)`,
      })
      .from(quizResults)
      .where(sql`${quizResults.completedAt} >= ${sevenDaysAgo.toISOString()}`);
    const activeUsers = activeUsersResult[0]?.count || 0;

    // Get total study time (in minutes)
    const totalStudyTimeResult = await db
      .select({
        total: sql<number>`CAST(COALESCE(SUM(${studySessions.duration}), 0) AS INTEGER)`,
      })
      .from(studySessions);
    const totalStudyTime = totalStudyTimeResult[0]?.total || 0;

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
