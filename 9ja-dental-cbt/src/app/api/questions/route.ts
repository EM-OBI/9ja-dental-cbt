import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { questions, specialties } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/questions
 * Fetch questions from the database
 * Optional query params:
 *   - specialtyId: Filter by specialty ID
 *   - specialtySlug: Filter by specialty slug
 *   - difficulty: Filter by difficulty (easy, medium, hard)
 *   - limit: Max number of questions to return (default: 50)
 *   - isActive: Filter by active status (default: true)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialtyId = searchParams.get("specialtyId");
    const specialtySlug = searchParams.get("specialtySlug");
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "50");
    const isActive = searchParams.get("isActive") !== "false"; // Default to true

    const db = await getDb();

    // Build query conditions
    const conditions = [];

    if (isActive) {
      conditions.push(eq(questions.isActive, true));
    }

    // Handle specialty filtering
    if (specialtySlug && !specialtyId) {
      // First, get the specialty ID from the slug
      const specialty = await db
        .select({ id: specialties.id })
        .from(specialties)
        .where(eq(specialties.slug, specialtySlug))
        .limit(1);

      if (specialty.length > 0) {
        conditions.push(eq(questions.specialtyId, specialty[0].id));
      } else {
        // Specialty not found, return empty result
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
        });
      }
    } else if (specialtyId) {
      conditions.push(eq(questions.specialtyId, specialtyId));
    }

    if (difficulty) {
      conditions.push(
        eq(questions.difficulty, difficulty as "easy" | "medium" | "hard")
      );
    }

    // Fetch questions
    const questionsList = await db
      .select({
        id: questions.id,
        text: questions.text,
        options: questions.options,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        specialty: specialties.name,
        specialtyId: questions.specialtyId,
        difficulty: questions.difficulty,
        imageUrl: questions.imageUrl,
        tags: questions.tags,
        timeEstimate: questions.timeEstimate,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .leftJoin(specialties, eq(questions.specialtyId, specialties.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit);

    // Transform the data to match the expected Question type
    const formattedQuestions = questionsList.map((q) => ({
      id: q.id,
      text: q.text,
      options:
        typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      specialty: q.specialty || "General",
      difficulty: q.difficulty,
      imageUrl: q.imageUrl || undefined,
      tags: q.tags
        ? typeof q.tags === "string"
          ? JSON.parse(q.tags)
          : q.tags
        : undefined,
      type: "mcq" as const,
      timeEstimate: q.timeEstimate || 60,
    }));

    return NextResponse.json({
      success: true,
      data: formattedQuestions,
      count: formattedQuestions.length,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch questions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
