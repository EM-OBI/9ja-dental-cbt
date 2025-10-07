import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
// GET /api/quiz-sessions/[id] - Get specific quiz session details
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

    const { id: sessionId } = await params;

    // TODO: Implement actual quiz session retrieval from database
    // For now, return mock session data
    const mockSession = {
      id: sessionId,
      quizId: "quiz-1",
      quizTitle: "Conservative Dentistry Fundamentals",
      userId: session.user.id,
      status: "active" as const,
      startedAt: new Date("2024-01-16T14:00:00Z"),
      questions: [
        {
          id: "q1",
          question: "What is the primary cause of dental caries?",
          type: "multiple-choice" as const,
          options: [
            "Genetic factors",
            "Bacterial action on sugars",
            "Physical trauma",
            "Chemical erosion",
          ],
          points: 1,
        },
        {
          id: "q2",
          question:
            "Which material is commonly used for direct posterior restorations?",
          type: "multiple-choice" as const,
          options: [
            "Amalgam",
            "Composite resin",
            "Gold foil",
            "All of the above",
          ],
          points: 1,
        },
      ],
      answers: {
        q1: "Bacterial action on sugars",
      },
      currentQuestionIndex: 1,
      timeRemaining: 2400,
      config: {
        timeLimit: 45,
        shuffleQuestions: true,
        shuffleOptions: true,
        showFeedback: false,
        allowReview: true,
      },
    };

    // Check if user owns this session
    if (mockSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: mockSession,
    });
  } catch (error) {
    console.error("Error fetching quiz session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/quiz-sessions/[id] - Submit answer for current question
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

    const { id: sessionId } = await params;
    const body = (await request.json()) as {
      questionId?: string;
      answer?: string;
      timeRemaining?: number;
      currentQuestionIndex?: number;
    };
    const { questionId, answer, timeRemaining, currentQuestionIndex } = body;

    if (!questionId || !answer) {
      return NextResponse.json(
        { error: "Question ID and answer are required" },
        { status: 400 }
      );
    }

    // TODO: Implement actual answer submission to database
    // For now, return success with updated session state
    const updatedSession = {
      id: sessionId,
      answers: {
        [questionId]: answer,
      },
      currentQuestionIndex: currentQuestionIndex || 0,
      timeRemaining: timeRemaining || 2400,
      lastAnsweredAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: updatedSession,
      message: "Answer submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/quiz-sessions/[id] - Complete quiz session and calculate results
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;
    const body = (await request.json()) as {
      answers?: Record<string, string>;
      timeSpent?: number;
    };
    const { answers, timeSpent } = body;

    // TODO: Implement actual quiz completion logic with scoring
    // For now, return mock completion data
    const completedSession = {
      id: sessionId,
      status: "completed" as const,
      completedAt: new Date(),
      timeSpent: timeSpent || 2100,
      answers: answers || {},
      score: 85, // Mock score calculation
      totalQuestions: 3,
      correctAnswers: 2,
      results: [
        {
          questionId: "q1",
          userAnswer: "Bacterial action on sugars",
          correctAnswer: "Bacterial action on sugars",
          isCorrect: true,
          points: 1,
          explanation:
            "Dental caries is primarily caused by bacterial fermentation of dietary sugars.",
        },
        {
          questionId: "q2",
          userAnswer: "Amalgam",
          correctAnswer: "All of the above",
          isCorrect: false,
          points: 0,
          explanation:
            "Amalgam, composite resin, and gold foil are all materials that can be used for direct posterior restorations.",
        },
        {
          questionId: "q3",
          userAnswer: "1.5mm",
          correctAnswer: "1.5mm",
          isCorrect: true,
          points: 1,
          explanation:
            "The ideal depth for cavity preparation in enamel is typically 1.5mm.",
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: completedSession,
      message: "Quiz completed successfully",
    });
  } catch (error) {
    console.error("Error completing quiz session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
