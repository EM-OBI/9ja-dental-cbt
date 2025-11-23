import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import {
  studyPackages,
  studySummaries,
  studyFlashcards,
  studyQuizzes,
  studyProgress,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/study/materials
 * Fetch user's study materials (packages) from the database
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const db = await getDb();

    // 2. Fetch all study packages for this user
    const userPackages = await db
      .select()
      .from(studyPackages)
      .where(eq(studyPackages.userId, userId))
      .orderBy(desc(studyPackages.createdAt));

    // 3. For each package, fetch associated materials count
    const packagesWithDetails = await Promise.all(
      userPackages.map(async (pkg) => {
        const [summaries, flashcards, quizzes, progress] = await Promise.all([
          db
            .select()
            .from(studySummaries)
            .where(eq(studySummaries.packageId, pkg.id))
            .limit(1),
          db
            .select()
            .from(studyFlashcards)
            .where(eq(studyFlashcards.packageId, pkg.id))
            .limit(1),
          db
            .select()
            .from(studyQuizzes)
            .where(eq(studyQuizzes.packageId, pkg.id))
            .limit(1),
          db
            .select()
            .from(studyProgress)
            .where(eq(studyProgress.packageId, pkg.id))
            .limit(1),
        ]);

        const summary = summaries[0];
        const flashcard = flashcards[0];
        const quiz = quizzes[0];
        const prog = progress[0];

        // Transform to StudyMaterial format
        return {
          id: pkg.id,
          title: pkg.topic,
          type: "pdf" as const,
          url: summary?.r2Path || `/study/${pkg.topicSlug}`,
          specialty: pkg.topic,
          difficulty: "medium" as const,
          uploadDate: new Date(pkg.createdAt).toISOString().split("T")[0],
          size: 0,
          pages: 0,
          isBookmarked: false,
          progress:
            prog?.summaryViewed && prog?.flashcardsCompleted
              ? 100
              : prog?.summaryViewed || prog?.flashcardsCompleted
              ? 50
              : 0,
          lastAccessed: prog?.lastAccessedAt
            ? new Date(prog.lastAccessedAt).toISOString().split("T")[0]
            : new Date(pkg.createdAt).toISOString().split("T")[0],
          notes: [],
          tags: [pkg.topicSlug],
          // Additional metadata
          hasSummary: !!summary,
          hasFlashcards: !!flashcard,
          flashcardCount: flashcard?.count || 0,
          hasQuiz: !!quiz,
          quizScore: prog?.quizScore || 0,
          masteryLevel:
            prog?.summaryViewed && prog?.flashcardsCompleted ? 1.0 : 0.5,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: packagesWithDetails,
      count: packagesWithDetails.length,
    });
  } catch (error) {
    console.error("Error fetching study materials:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch study materials",
      },
      { status: 500 }
    );
  }
}
