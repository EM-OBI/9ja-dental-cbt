import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { bookmarks, questions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

// POST /api/bookmarks - Add a new bookmark
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      questionId?: string;
      quizId?: string;
      note?: string;
    };
    const { questionId, quizId, note } = body;

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check if bookmark already exists
    const existingBookmark = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, session.user.id),
          eq(bookmarks.itemType, "question"),
          eq(bookmarks.itemId, questionId)
        )
      )
      .limit(1);

    if (existingBookmark.length > 0) {
      return NextResponse.json(
        { error: "Question already bookmarked" },
        { status: 400 }
      );
    }

    // Get question details
    const question = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!question.length) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Create bookmark
    const bookmarkId = nanoid();
    const bookmarkData = {
      id: bookmarkId,
      userId: session.user.id,
      itemType: "question" as const,
      itemId: questionId,
      notes: note || null,
    };

    await db.insert(bookmarks).values(bookmarkData);

    const newBookmark = {
      id: bookmarkId,
      userId: session.user.id,
      questionId: questionId,
      quizId: quizId,
      note: note || "",
      createdAt: new Date(),
      question: {
        id: question[0].id,
        question: question[0].text,
        type: "multiple-choice" as const,
        options: JSON.parse(question[0].options),
        correctAnswer: question[0].correctAnswer,
        explanation: question[0].explanation,
        difficulty: question[0].difficulty,
      },
    };

    return NextResponse.json({
      success: true,
      data: newBookmark,
      message: "Bookmark added successfully",
    });
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/bookmarks - Get user's bookmarks with pagination
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const difficulty = url.searchParams.get("difficulty");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // TODO: Implement actual bookmark retrieval from database
    // For now, return mock bookmark data
    const mockBookmarks = [
      {
        id: "bookmark-1",
        userId: session.user.id,
        questionId: "q1",
        quizId: "quiz-1",
        note: "Important concept for finals",
        createdAt: new Date("2024-01-15T10:30:00Z"),
        question: {
          id: "q1",
          question: "What is the primary cause of dental caries?",
          type: "multiple-choice" as const,
          options: [
            "Genetic factors",
            "Bacterial action on sugars",
            "Physical trauma",
            "Chemical erosion",
          ],
          correctAnswer: "Bacterial action on sugars",
          explanation:
            "Dental caries is primarily caused by bacterial fermentation of dietary sugars.",
          category: "Conservative Dentistry",
          difficulty: "medium" as const,
        },
      },
      {
        id: "bookmark-2",
        userId: session.user.id,
        questionId: "q5",
        quizId: "quiz-2",
        note: "Review for prosthodontics exam",
        createdAt: new Date("2024-01-14T15:20:00Z"),
        question: {
          id: "q5",
          question: "What is the ideal taper for crown preparation?",
          type: "multiple-choice" as const,
          options: [
            "2-5 degrees",
            "6-12 degrees",
            "15-20 degrees",
            "25-30 degrees",
          ],
          correctAnswer: "6-12 degrees",
          explanation:
            "The ideal taper for crown preparation is 6-12 degrees to provide adequate retention and resistance.",
          category: "Prosthodontics",
          difficulty: "hard" as const,
        },
      },
      {
        id: "bookmark-3",
        userId: session.user.id,
        questionId: "q3",
        quizId: "quiz-3",
        note: "Surgical technique to remember",
        createdAt: new Date("2024-01-13T09:45:00Z"),
        question: {
          id: "q3",
          question:
            "What is the most common complication after tooth extraction?",
          type: "multiple-choice" as const,
          options: ["Bleeding", "Dry socket", "Infection", "Nerve damage"],
          correctAnswer: "Dry socket",
          explanation:
            "Dry socket (alveolar osteitis) is the most common complication following tooth extraction.",
          category: "Oral Surgery",
          difficulty: "easy" as const,
        },
      },
    ];

    // Apply filters
    let filteredBookmarks = mockBookmarks;
    if (category) {
      filteredBookmarks = filteredBookmarks.filter((bookmark) =>
        bookmark.question.category
          .toLowerCase()
          .includes(category.toLowerCase())
      );
    }
    if (difficulty) {
      filteredBookmarks = filteredBookmarks.filter(
        (bookmark) => bookmark.question.difficulty === difficulty
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedBookmarks = filteredBookmarks.slice(
      startIndex,
      startIndex + limit
    );

    return NextResponse.json({
      success: true,
      data: {
        bookmarks: paginatedBookmarks,
        total: filteredBookmarks.length,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
