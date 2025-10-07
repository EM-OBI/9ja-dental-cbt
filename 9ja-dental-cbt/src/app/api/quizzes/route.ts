import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { quizzes, specialties } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
// GET /api/quizzes - Get all quizzes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const specialty = url.searchParams.get("specialty");
    const difficulty = url.searchParams.get("difficulty");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const db = await getDb();

    // Build query conditions
    const conditions = [eq(quizzes.isActive, true)];

    if (specialty) {
      const specialtyRecord = await db
        .select()
        .from(specialties)
        .where(eq(specialties.slug, specialty))
        .limit(1);

      if (specialtyRecord.length > 0) {
        conditions.push(eq(quizzes.specialtyId, specialtyRecord[0].id));
      }
    }

    if (difficulty) {
      conditions.push(
        eq(quizzes.difficulty, difficulty as "easy" | "medium" | "hard")
      );
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizzes)
      .where(and(...conditions));

    const total = countResult[0]?.count || 0;

    // Get paginated quizzes
    const quizzesList = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        totalQuestions: quizzes.totalQuestions,
        timeLimit: quizzes.timeLimit,
        difficulty: quizzes.difficulty,
        quizType: quizzes.quizType,
        tags: quizzes.tags,
        isFeatured: quizzes.isFeatured,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
        specialtyId: quizzes.specialtyId,
        specialty: specialties.name,
      })
      .from(quizzes)
      .leftJoin(specialties, eq(quizzes.specialtyId, specialties.id))
      .where(and(...conditions))
      .orderBy(desc(quizzes.isFeatured), desc(quizzes.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // Transform data to match expected format
    const formattedQuizzes = quizzesList.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      totalQuestions: quiz.totalQuestions,
      timeLimit: quiz.timeLimit,
      difficulty: quiz.difficulty,
      category: quiz.specialty || "General",
      specialty: quiz.specialty || "General",
      tags: quiz.tags ? JSON.parse(quiz.tags) : [],
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        quizzes: formattedQuizzes,
        total: total,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
