import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { desc, eq } from "drizzle-orm";
import { quizResults, user, quizzes, specialties } from "@/db/schema";

// GET /api/users/[id]/quiz-attempts - Get user's quiz attempts/results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is accessing their own data
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get limit from query params (default: 10, max: 100)
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);

    console.log(
      `[quiz-attempts] Fetching quiz attempts for user: ${id}, limit: ${limit}`
    );

    const db = await getDb();

    // Fetch quiz results with related data
    const results = await db
      .select({
        id: quizResults.id,
        sessionId: quizResults.sessionId,
        userId: quizResults.userId,
        quizId: quizResults.quizId,
        quizType: quizResults.quizType,
        specialtyId: quizResults.specialtyId,
        score: quizResults.score,
        correctAnswers: quizResults.correctAnswers,
        totalQuestions: quizResults.totalQuestions,
        timeTaken: quizResults.timeTaken,
        answersData: quizResults.answersData,
        passed: quizResults.passed,
        pointsEarned: quizResults.pointsEarned,
        xpEarned: quizResults.xpEarned,
        completedAt: quizResults.completedAt,
        // Join with quiz for title
        quizTitle: quizzes.title,
        // Join with specialty for name
        specialtyName: specialties.name,
        // Join with user for name
        userName: user.name,
      })
      .from(quizResults)
      .leftJoin(quizzes, eq(quizResults.quizId, quizzes.id))
      .leftJoin(specialties, eq(quizResults.specialtyId, specialties.id))
      .leftJoin(user, eq(quizResults.userId, user.id))
      .where(eq(quizResults.userId, id))
      .orderBy(desc(quizResults.completedAt))
      .limit(limit);

    console.log(`[quiz-attempts] Found ${results.length} quiz attempts`);

    // Transform to QuizAttempt format
    const quizAttempts = results.map((result) => {
      // Parse answers data
      let answers = [];
      try {
        answers = result.answersData ? JSON.parse(result.answersData) : [];
      } catch (e) {
        console.error(
          `[quiz-attempts] Failed to parse answers for result ${result.id}`,
          e
        );
      }

      return {
        id: result.id,
        userId: result.userId,
        quizId: result.quizId || `quiz-${result.sessionId}`,
        quizTitle: result.quizTitle || "Unknown Quiz",
        quizType: result.quizType,
        specialtyName: result.specialtyName || "General",
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        timeSpent: result.timeTaken,
        passed: result.passed,
        pointsEarned: result.pointsEarned || 0,
        xpEarned: result.xpEarned || 0,
        completedAt: result.completedAt,
        answers,
      };
    });

    return NextResponse.json({
      success: true,
      data: quizAttempts,
    });
  } catch (error) {
    console.error("[quiz-attempts] Error fetching quiz attempts:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch quiz attempts",
      },
      { status: 500 }
    );
  }
}
