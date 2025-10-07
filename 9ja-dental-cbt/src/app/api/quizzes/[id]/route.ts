import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { quizzes, quizQuestions, questions, specialties } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/quizzes/[id] - Get specific quiz details with questions
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

    const { id: quizId } = await params;
    const db = await getDb();

    // Get quiz details
    const quiz = await db
      .select({
        id: quizzes.id,
        title: quizzes.title,
        description: quizzes.description,
        totalQuestions: quizzes.totalQuestions,
        timeLimit: quizzes.timeLimit,
        difficulty: quizzes.difficulty,
        quizType: quizzes.quizType,
        tags: quizzes.tags,
        specialtyId: quizzes.specialtyId,
        createdAt: quizzes.createdAt,
        updatedAt: quizzes.updatedAt,
        specialty: specialties.name,
      })
      .from(quizzes)
      .leftJoin(specialties, eq(quizzes.specialtyId, specialties.id))
      .where(and(eq(quizzes.id, quizId), eq(quizzes.isActive, true)))
      .limit(1);

    if (!quiz.length) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get quiz questions
    const quizQuestionsData = await db
      .select({
        id: questions.id,
        text: questions.text,
        options: questions.options,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
        points: questions.points,
        difficulty: questions.difficulty,
        sortOrder: quizQuestions.sortOrder,
      })
      .from(quizQuestions)
      .innerJoin(questions, eq(quizQuestions.questionId, questions.id))
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(quizQuestions.sortOrder);

    // Format questions
    const formattedQuestions = quizQuestionsData.map((q) => ({
      id: q.id,
      question: q.text,
      type: "multiple-choice" as const,
      options: JSON.parse(q.options),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points,
      difficulty: q.difficulty,
    }));

    const quizData = {
      id: quiz[0].id,
      title: quiz[0].title,
      description: quiz[0].description,
      totalQuestions: quiz[0].totalQuestions,
      timeLimit: quiz[0].timeLimit,
      difficulty: quiz[0].difficulty,
      category: quiz[0].specialty || "General",
      specialty: quiz[0].specialty || "General",
      tags: quiz[0].tags ? JSON.parse(quiz[0].tags) : [],
      createdAt: quiz[0].createdAt,
      updatedAt: quiz[0].updatedAt,
      questions: formattedQuestions,
    };

    return NextResponse.json({
      success: true,
      data: quizData,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[id] - Update quiz (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Note: In production, implement proper admin/instructor check
    // For now, allow all authenticated users to update
    // TODO: Implement role-based access control

    const { id: quizId } = await params;
    const updateData = (await request.json()) as {
      title?: string;
      description?: string;
      difficulty?: "easy" | "medium" | "hard";
      timeLimit?: number;
      tags?: string[];
    };

    const db = await getDb();

    // Check if quiz exists
    const existing = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Update quiz
    const updatedData: Partial<typeof quizzes.$inferInsert> = {
      ...(updateData.title && { title: updateData.title }),
      ...(updateData.description && { description: updateData.description }),
      ...(updateData.difficulty && { difficulty: updateData.difficulty }),
      ...(updateData.timeLimit && { timeLimit: updateData.timeLimit }),
      ...(updateData.tags && { tags: JSON.stringify(updateData.tags) }),
      updatedAt: new Date(),
    };

    await db.update(quizzes).set(updatedData).where(eq(quizzes.id, quizId));

    const updatedQuiz = {
      id: quizId,
      ...updateData,
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: updatedQuiz,
      message: "Quiz updated successfully",
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete quiz (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Note: In production, implement proper admin/instructor check
    // For now, allow all authenticated users to delete
    // TODO: Implement role-based access control

    const { id: quizId } = await params;
    const db = await getDb();

    // Check if quiz exists
    const existing = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await db
      .update(quizzes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(quizzes.id, quizId));

    // Or for hard delete (use with caution):
    // await db.delete(quizzes).where(eq(quizzes.id, quizId));

    return NextResponse.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
