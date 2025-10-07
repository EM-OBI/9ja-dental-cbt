import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import {
  studySummaries,
  studyFlashcards,
  studyQuizzes,
  studyProgress,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

// export const runtime = "edge";

/**
 * GET /api/study/packages/[id]
 * Fetch complete study package by progress ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;

    // 2. Get Cloudflare context
    const { env } = await getCloudflareContext();
    const db = await getDb();

    if (!env.STUDY_BUCKET) {
      return NextResponse.json(
        { error: "STUDY_BUCKET binding not available" },
        { status: 500 }
      );
    }

    const bucket = env.STUDY_BUCKET;

    // 3. Fetch progress record
    const progressRecords = await db
      .select()
      .from(studyProgress)
      .where(and(eq(studyProgress.id, id), eq(studyProgress.userId, userId)))
      .limit(1);

    if (progressRecords.length === 0) {
      return NextResponse.json(
        { error: "Study package not found" },
        { status: 404 }
      );
    }

    const progress = progressRecords[0];
    const topicSlug = progress.topicSlug;

    // 4. Fetch summary
    const summaryRecords = await db
      .select()
      .from(studySummaries)
      .where(
        and(
          eq(studySummaries.userId, userId),
          eq(studySummaries.topicSlug, topicSlug)
        )
      )
      .limit(1);

    let summaryContent = null;
    if (summaryRecords.length > 0) {
      const summaryObj = await bucket.get(summaryRecords[0].path);
      if (summaryObj) {
        summaryContent = {
          content: await summaryObj.text(),
          createdAt: summaryRecords[0].createdAt.toISOString(),
        };
      }
    }

    // 5. Fetch flashcards
    const flashcardRecords = await db
      .select()
      .from(studyFlashcards)
      .where(
        and(
          eq(studyFlashcards.userId, userId),
          eq(studyFlashcards.topicSlug, topicSlug)
        )
      )
      .limit(1);

    let flashcardsData = null;
    if (flashcardRecords.length > 0) {
      const flashcardsObj = await bucket.get(flashcardRecords[0].filePath);
      if (flashcardsObj) {
        const jsonText = await flashcardsObj.text();
        flashcardsData = JSON.parse(jsonText);
      }
    }

    // 6. Fetch quiz
    const quizRecords = await db
      .select()
      .from(studyQuizzes)
      .where(
        and(
          eq(studyQuizzes.userId, userId),
          eq(studyQuizzes.topicSlug, topicSlug)
        )
      )
      .limit(1);

    let quizData = null;
    if (quizRecords.length > 0) {
      const quizObj = await bucket.get(quizRecords[0].filePath);
      if (quizObj) {
        const jsonText = await quizObj.text();
        quizData = {
          questions: JSON.parse(jsonText),
        };
      }
    }

    // 7. Build response
    const studyPackage = {
      id: progress.id,
      topic: progress.topic,
      summary: summaryContent,
      flashcards: flashcardsData,
      quiz: quizData,
      progress: {
        summaryDone: progress.summaryDone,
        flashcardsDone: progress.flashcardsDone,
        quizScore: progress.quizScore,
      },
    };

    return NextResponse.json(studyPackage);
  } catch (error: unknown) {
    console.error("Fetch package error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch study package";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
