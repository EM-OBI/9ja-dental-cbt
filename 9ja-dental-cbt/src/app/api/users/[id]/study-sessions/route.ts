import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import {
  getUserStudySessions,
  createStudySession,
} from "@/services/serverData";
import { nanoid } from "nanoid";

// GET /api/users/[id]/study-sessions - Get user study sessions
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

    // Get query parameters
    const url = new URL(request.url);
    const topic = url.searchParams.get("topic") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Fetch study sessions from database
    const studySessions = await getUserStudySessions(id, {
      topic,
      status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: studySessions,
    });
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/users/[id]/study-sessions - Create a new study session
export async function POST(
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

    // Parse and validate request body
    const rawBody = await request.json();
    const body = rawBody as {
      sessionType?: string;
      specialtyId?: string;
      duration?: number;
      topicsCovered?: string[];
      questionsReviewed?: number;
      notes?: string;
      goalsSet?: Record<string, unknown>;
      goalsAchieved?: Record<string, unknown>;
      qualityRating?: number;
      startedAt?: string;
      completedAt?: string;
    };

    // Validate required fields
    if (
      !body.sessionType ||
      !body.duration ||
      !body.startedAt ||
      !body.completedAt
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: sessionType, duration, startedAt, completedAt",
        },
        { status: 400 }
      );
    }

    // Validate sessionType
    const validSessionTypes = ["focused", "review", "practice", "exam_prep"];
    if (!validSessionTypes.includes(body.sessionType)) {
      return NextResponse.json(
        {
          error:
            "Invalid sessionType. Must be one of: focused, review, practice, exam_prep",
        },
        { status: 400 }
      );
    }

    // Create the study session
    const newSession = await createStudySession({
      id: nanoid(),
      userId: id,
      sessionType: body.sessionType as
        | "focused"
        | "review"
        | "practice"
        | "exam_prep",
      specialtyId: body.specialtyId || null,
      duration: body.duration,
      topicsCovered: body.topicsCovered
        ? JSON.stringify(body.topicsCovered)
        : null,
      questionsReviewed: body.questionsReviewed || 0,
      notes: body.notes || null,
      goalsSet: body.goalsSet ? JSON.stringify(body.goalsSet) : null,
      goalsAchieved: body.goalsAchieved
        ? JSON.stringify(body.goalsAchieved)
        : null,
      qualityRating: body.qualityRating || null,
      startedAt: new Date(body.startedAt),
      completedAt: new Date(body.completedAt),
    });

    return NextResponse.json({
      success: true,
      data: newSession[0],
    });
  } catch (error) {
    console.error("Error creating study session:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
