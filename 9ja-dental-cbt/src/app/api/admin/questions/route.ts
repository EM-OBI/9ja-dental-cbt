import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { questions, specialties } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyAdminAccess } from "@/lib/auth-helpers";

/**
 * GET /api/admin/questions
 * Fetch all questions (including inactive) for admin management
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
    const { searchParams } = new URL(req.url);
    const specialtyId = searchParams.get("specialtyId");
    const difficulty = searchParams.get("difficulty");
    const includeAll = searchParams.get("includeAll") === "true";

    const db = await getDb();

    // Build WHERE conditions
    const conditions = [];
    if (!includeAll) {
      conditions.push(eq(questions.isActive, true));
    }
    if (specialtyId && specialtyId !== "all") {
      conditions.push(eq(questions.specialtyId, specialtyId));
    }
    if (
      difficulty &&
      difficulty !== "all" &&
      (difficulty === "easy" ||
        difficulty === "medium" ||
        difficulty === "hard")
    ) {
      conditions.push(
        eq(questions.difficulty, difficulty as "easy" | "medium" | "hard")
      );
    }

    // Fetch questions with specialty names
    const result = await db
      .select({
        id: questions.id,
        specialtyId: questions.specialtyId,
        specialtyName: specialties.name,
        text: questions.text,
        options: questions.options,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        difficulty: questions.difficulty,
        type: questions.type,
        timeEstimate: questions.timeEstimate,
        tags: questions.tags,
        imageUrl: questions.imageUrl,
        reference: questions.reference,
        isActive: questions.isActive,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
      })
      .from(questions)
      .leftJoin(specialties, eq(questions.specialtyId, specialties.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(questions.createdAt);

    // Parse JSON fields
    const formattedQuestions = result.map((q) => ({
      ...q,
      options:
        typeof q.options === "string" ? JSON.parse(q.options) : q.options,
      tags:
        q.tags && typeof q.tags === "string"
          ? JSON.parse(q.tags)
          : q.tags || [],
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
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/questions
 * Create a new question
 */
export async function POST(req: NextRequest) {
  // Verify admin access
  const { authorized, error } = await verifyAdminAccess(req);
  if (!authorized) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as {
      specialtyId?: string;
      text: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
      difficulty: "easy" | "medium" | "hard";
      type?: "mcq" | "true-false" | "image-based";
      timeEstimate?: number;
      tags?: string[];
      imageUrl?: string;
      reference?: string;
    };
    const {
      specialtyId,
      text,
      options,
      correctAnswer,
      explanation,
      difficulty,
      type,
      timeEstimate,
      tags,
      imageUrl,
      reference,
    } = body;

    // Validation
    if (
      !specialtyId ||
      !text ||
      !options ||
      correctAnswer === undefined ||
      !difficulty
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Must provide at least 2 options",
        },
        { status: 400 }
      );
    }

    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid correct answer index",
        },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Generate question ID
    const questionId = `q_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Insert question
    await db.insert(questions).values({
      id: questionId,
      specialtyId,
      text,
      options: JSON.stringify(options),
      correctAnswer,
      explanation: explanation || null,
      difficulty,
      type: type || "mcq",
      timeEstimate: timeEstimate || 60,
      tags: tags && tags.length > 0 ? JSON.stringify(tags) : null,
      imageUrl: imageUrl || null,
      reference: reference || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { id: questionId },
      message: "Question created successfully",
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create question",
      },
      { status: 500 }
    );
  }
}
