import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db/index";
import { questions, specialties } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Debug endpoint to check questions in database
 * GET /api/debug/questions
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();

    // Get search params
    const { searchParams } = new URL(request.url);
    const specialtyId = searchParams.get("specialtyId");
    const limit = parseInt(searchParams.get("limit") || "5");

    // Count total questions
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .get();

    // Count active questions
    const activeCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(eq(questions.isActive, true))
      .get();

    // Get all specialties with question counts
    const allSpecialties = await db
      .select({
        id: specialties.id,
        name: specialties.name,
      })
      .from(specialties)
      .all();

    const specialtyQuestionCounts = await Promise.all(
      allSpecialties.map(async (specialty) => {
        const count = await db
          .select({ count: sql<number>`count(*)` })
          .from(questions)
          .where(eq(questions.specialtyId, specialty.id))
          .get();

        return {
          specialtyId: specialty.id,
          specialtyName: specialty.name,
          questionCount: count?.count || 0,
        };
      })
    );

    // Get sample questions
    let sampleQuestions;
    if (specialtyId) {
      sampleQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.specialtyId, specialtyId))
        .limit(limit)
        .all();
    } else {
      sampleQuestions = await db.select().from(questions).limit(limit).all();
    }

    // Format sample questions for display
    const formattedSamples = sampleQuestions.map((q) => ({
      id: q.id,
      text: q.text?.substring(0, 100) + "...",
      specialtyId: q.specialtyId,
      options: q.options ? JSON.parse(q.options) : null,
      correctAnswer: q.correctAnswer,
      hasExplanation: !!q.explanation,
      difficulty: q.difficulty,
      isActive: q.isActive,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalQuestions: totalCount?.count || 0,
        activeQuestions: activeCount?.count || 0,
      },
      specialties: specialtyQuestionCounts,
      sampleQuestions: formattedSamples,
      note: "Use ?specialtyId=xxx&limit=10 to filter",
    });
  } catch (error) {
    console.error("[Debug Questions API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch questions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
