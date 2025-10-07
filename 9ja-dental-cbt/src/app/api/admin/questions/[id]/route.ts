import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminAccess } from "@/lib/auth-helpers";

/**
 * GET /api/admin/questions/[id]
 * Fetch a single question by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin access
  const { authorized, error } = await verifyAdminAccess(req);
  if (!authorized) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id: questionId } = await params;
    const db = await getDb();

    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Question not found",
        },
        { status: 404 }
      );
    }

    const question = result[0];

    // Parse JSON fields
    const formattedQuestion = {
      ...question,
      options:
        typeof question.options === "string"
          ? JSON.parse(question.options)
          : question.options,
      tags:
        question.tags && typeof question.tags === "string"
          ? JSON.parse(question.tags)
          : question.tags || [],
    };

    return NextResponse.json({
      success: true,
      data: formattedQuestion,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch question",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/questions/[id]
 * Update a question
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin access
  const { authorized, error } = await verifyAdminAccess(req);
  if (!authorized) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id: questionId } = await params;
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
      isActive?: boolean;
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
      isActive,
    } = body;

    // Validation
    if (!text || !options || correctAnswer === undefined || !difficulty) {
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

    // Update question
    await db
      .update(questions)
      .set({
        specialtyId: specialtyId || undefined,
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
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, questionId));

    return NextResponse.json({
      success: true,
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update question",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/questions/[id]
 * Delete a question (soft delete by setting isActive to false)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin access
  const { authorized, error } = await verifyAdminAccess(req);
  if (!authorized) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id: questionId } = await params;
    const db = await getDb();

    // Soft delete by setting isActive to false
    await db
      .update(questions)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, questionId));

    return NextResponse.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete question",
      },
      { status: 500 }
    );
  }
}
