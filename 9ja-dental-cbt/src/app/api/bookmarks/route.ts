import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { bookmarks, questions, specialties } from "@/db/schema";
import { eq, and, desc, like, sql } from "drizzle-orm";
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
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limitParam = parseInt(url.searchParams.get("limit") || "10");
    const limit = Math.max(1, Math.min(50, limitParam || 10));
    const offset = (page - 1) * limit;

    const db = await getDb();

    const filters = [
      eq(bookmarks.userId, session.user.id),
      eq(bookmarks.itemType, "question" as const),
    ];

    if (category) {
      filters.push(like(specialties.name, `%${category}%`));
    }

    if (difficulty) {
      filters.push(
        eq(questions.difficulty, difficulty as "easy" | "medium" | "hard")
      );
    }

    const whereClause = filters.length > 1 ? and(...filters) : filters[0];

    const [{ count } = { count: 0 }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookmarks)
      .innerJoin(questions, eq(bookmarks.itemId, questions.id))
      .innerJoin(specialties, eq(questions.specialtyId, specialties.id))
      .where(whereClause);

    const bookmarkRows = await db
      .select({
        bookmark: bookmarks,
        question: questions,
        specialtyName: specialties.name,
      })
      .from(bookmarks)
      .innerJoin(questions, eq(bookmarks.itemId, questions.id))
      .innerJoin(specialties, eq(questions.specialtyId, specialties.id))
      .where(whereClause)
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit)
      .offset(offset);

    const bookmarksResponse = bookmarkRows.map(
      ({ bookmark, question, specialtyName }) => {
        let options: unknown[] = [];
        try {
          options = JSON.parse(question.options ?? "[]");
        } catch (parseError) {
          console.error("Failed to parse question options", parseError);
        }

        return {
          id: bookmark.id,
          userId: bookmark.userId,
          questionId: question.id,
          quizId: null,
          note: bookmark.notes ?? "",
          createdAt: bookmark.createdAt,
          question: {
            id: question.id,
            question: question.text,
            type: question.type === "mcq" ? "multiple-choice" : question.type,
            options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            category: specialtyName,
            difficulty: question.difficulty,
          },
        };
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        bookmarks: bookmarksResponse,
        total: count,
        page,
        limit,
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
