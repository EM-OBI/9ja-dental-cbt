import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { quizSessions, quizzes, quizQuestions, questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// POST /api/quiz-sessions - Start a new quiz session
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { quizId?: string };
    const { quizId } = body;

    if (!quizId) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get quiz details
    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (!quiz.length) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get quiz questions
    const quizQuestionsData = await db
      .select({
        question: questions,
        sortOrder: quizQuestions.sortOrder,
      })
      .from(quizQuestions)
      .innerJoin(questions, eq(quizQuestions.questionId, questions.id))
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(quizQuestions.sortOrder);

    // Create new quiz session
    const sessionId = nanoid();
    const questionsData = quizQuestionsData.map((item) => ({
      id: item.question.id,
      text: item.question.text,
      options: JSON.parse(item.question.options),
      points: item.question.points,
      difficulty: item.question.difficulty,
      sortOrder: item.sortOrder,
    }));

    const newSessionData = {
      id: sessionId,
      userId: session.user.id,
      quizId: quizId,
      quizType: quiz[0].quizType || "practice",
      specialtyId: quiz[0].specialtyId,
      totalQuestions: quizQuestionsData.length,
      questionsData: JSON.stringify(questionsData),
      timeLimit: quiz[0].timeLimit ? quiz[0].timeLimit * 60 : null, // Convert to seconds
    };

    await db.insert(quizSessions).values(newSessionData);

    const newSession = {
      id: sessionId,
      quizId: quizId,
      userId: session.user.id,
      status: "active" as const,
      startedAt: new Date(),
      questions: questionsData,
      answers: {},
      currentQuestionIndex: 0,
      timeRemaining: newSessionData.timeLimit,
      config: {
        timeLimit: quiz[0].timeLimit || 0,
        totalQuestions: quizQuestionsData.length,
        quizType: quiz[0].quizType,
      },
    };

    return NextResponse.json({
      success: true,
      data: newSession,
      message: "Quiz session started successfully",
    });
  } catch (error) {
    console.error("Error creating quiz session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/quiz-sessions - Get user's quiz sessions with pagination
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // TODO: Implement actual quiz session retrieval from database
    // For now, return mock session data
    const mockSessions = [
      {
        id: "session-1",
        quizId: "quiz-1",
        quizTitle: "Conservative Dentistry Fundamentals",
        userId: session.user.id,
        status: "completed" as const,
        startedAt: new Date("2024-01-15T10:00:00Z"),
        completedAt: new Date("2024-01-15T10:35:00Z"),
        score: 85,
        totalQuestions: 25,
        correctAnswers: 21,
        timeSpent: 2100, // 35 minutes
        answers: {},
      },
      {
        id: "session-2",
        quizId: "quiz-2",
        quizTitle: "Prosthodontics Advanced",
        userId: session.user.id,
        status: "active" as const,
        startedAt: new Date("2024-01-16T14:00:00Z"),
        currentQuestionIndex: 5,
        timeRemaining: 2400,
        answers: {},
      },
      {
        id: "session-3",
        quizId: "quiz-3",
        quizTitle: "Oral Surgery Basics",
        userId: session.user.id,
        status: "completed" as const,
        startedAt: new Date("2024-01-14T09:00:00Z"),
        completedAt: new Date("2024-01-14T09:25:00Z"),
        score: 92,
        totalQuestions: 20,
        correctAnswers: 18,
        timeSpent: 1500, // 25 minutes
        answers: {},
      },
    ];

    // Apply status filter
    let filteredSessions = mockSessions;
    if (status) {
      filteredSessions = filteredSessions.filter(
        (session) => session.status === status
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedSessions = filteredSessions.slice(
      startIndex,
      startIndex + limit
    );

    return NextResponse.json({
      success: true,
      data: {
        sessions: paginatedSessions,
        total: filteredSessions.length,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching quiz sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
