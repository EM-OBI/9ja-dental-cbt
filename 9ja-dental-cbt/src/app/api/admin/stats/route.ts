import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { questions, specialties } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifyAdminAccess } from "@/lib/auth-helpers";

/**
 * GET /api/admin/stats
 * Get database statistics
 */
export async function GET(req: NextRequest) {
  // Verify admin access
  const { authorized, error } = await verifyAdminAccess(req);
  if (!authorized) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const db = await getDb();

    // Get total questions
    const totalQuestionsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(questions);
    const totalQuestions = Number(totalQuestionsResult[0]?.count || 0);

    // Get total specialties
    const totalSpecialtiesResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(specialties)
      .where(eq(specialties.isActive, true));
    const totalSpecialties = Number(totalSpecialtiesResult[0]?.count || 0);

    // Get active/inactive questions
    const activeQuestionsResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(questions)
      .where(eq(questions.isActive, true));
    const activeQuestions = Number(activeQuestionsResult[0]?.count || 0);
    const inactiveQuestions = totalQuestions - activeQuestions;

    // Get questions by specialty
    const questionsBySpecialtyResult = await db
      .select({
        name: specialties.name,
        count: sql<number>`CAST(COUNT(${questions.id}) AS INTEGER)`,
      })
      .from(specialties)
      .leftJoin(questions, eq(specialties.id, questions.specialtyId))
      .where(eq(specialties.isActive, true))
      .groupBy(specialties.id, specialties.name)
      .orderBy(specialties.sortOrder);

    const questionsBySpecialty = questionsBySpecialtyResult.map((row) => ({
      name: row.name,
      count: Number(row.count || 0),
    }));

    // Get questions by difficulty
    const easyResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(questions)
      .where(eq(questions.difficulty, "easy"));
    const mediumResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(questions)
      .where(eq(questions.difficulty, "medium"));
    const hardResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(questions)
      .where(eq(questions.difficulty, "hard"));

    const questionsByDifficulty = {
      easy: Number(easyResult[0]?.count || 0),
      medium: Number(mediumResult[0]?.count || 0),
      hard: Number(hardResult[0]?.count || 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        totalQuestions,
        totalSpecialties,
        activeQuestions,
        inactiveQuestions,
        questionsBySpecialty,
        questionsByDifficulty,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}
