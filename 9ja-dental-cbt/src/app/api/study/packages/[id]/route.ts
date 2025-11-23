import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import {
  studyPackages,
  studySummaries,
  studyFlashcards,
  studyQuizzes,
  studyProgress,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

// export const runtime = "edge";

/**
 * GET /api/study/packages/[id]
 * Fetch complete study package by package ID
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
    const { id: packageId } = await params;

    // 2. Get Cloudflare context
    const { env } = await getCloudflareContext();
    const db = await getDb();

    if (!env.MY_BUCKET) {
      return NextResponse.json(
        { error: "MY_BUCKET binding not available" },
        { status: 500 }
      );
    }

    const bucket = env.MY_BUCKET;

    // 3. Fetch package record
    const packageRecords = await db
      .select()
      .from(studyPackages)
      .where(
        and(eq(studyPackages.id, packageId), eq(studyPackages.userId, userId))
      )
      .limit(1);

    if (packageRecords.length === 0) {
      return NextResponse.json(
        { error: "Study package not found" },
        { status: 404 }
      );
    }

    const pkg = packageRecords[0];

    // 4. Fetch summary
    const summaryRecords = await db
      .select()
      .from(studySummaries)
      .where(eq(studySummaries.packageId, packageId))
      .limit(1);

    let summaryContent = null;
    if (summaryRecords.length > 0) {
      const summaryObj = await bucket.get(summaryRecords[0].r2Path);
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
      .where(eq(studyFlashcards.packageId, packageId))
      .limit(1);

    let flashcardsData = null;
    if (flashcardRecords.length > 0) {
      const flashcardsObj = await bucket.get(flashcardRecords[0].r2Path);
      if (flashcardsObj) {
        const jsonText = await flashcardsObj.text();
        flashcardsData = JSON.parse(jsonText);
      }
    }

    // 6. Fetch quiz
    const quizRecords = await db
      .select()
      .from(studyQuizzes)
      .where(eq(studyQuizzes.packageId, packageId))
      .limit(1);

    let quizData = null;
    if (quizRecords.length > 0) {
      const quizObj = await bucket.get(quizRecords[0].r2Path);
      if (quizObj) {
        const jsonText = await quizObj.text();
        quizData = {
          questions: JSON.parse(jsonText),
        };
      }
    }

    // 7. Fetch progress
    const progressRecords = await db
      .select()
      .from(studyProgress)
      .where(eq(studyProgress.packageId, packageId))
      .limit(1);

    const progress = progressRecords[0];

    // 8. Build response
    const studyPackage = {
      id: pkg.id,
      topic: pkg.topic,
      summary: summaryContent,
      flashcards: flashcardsData,
      quiz: quizData,
      progress: {
        summaryViewed: progress?.summaryViewed || false,
        flashcardsCompleted: progress?.flashcardsCompleted || false,
        quizScore: progress?.quizScore || null,
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
