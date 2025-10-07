import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import {
  studySummaries,
  studyFlashcards,
  studyQuizzes,
  studyProgress,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/study/materials
 * Fetch user's study materials from the database
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

    // 2. Fetch all study progress entries for this user
    const userStudyProgress = await db
      .select()
      .from(studyProgress)
      .where(eq(studyProgress.userId, userId))
      .orderBy(desc(studyProgress.updatedAt));

    // 3. For each progress entry, fetch associated materials
    const materialsWithDetails = await Promise.all(
      userStudyProgress.map(async (progress) => {
        const [summaries, flashcards, quizzes] = await Promise.all([
          db
            .select()
            .from(studySummaries)
            .where(eq(studySummaries.topicSlug, progress.topicSlug))
            .limit(1),
          db
            .select()
            .from(studyFlashcards)
            .where(eq(studyFlashcards.topicSlug, progress.topicSlug)),
          db
            .select()
            .from(studyQuizzes)
            .where(eq(studyQuizzes.topicSlug, progress.topicSlug))
            .limit(1),
        ]);

        const summary = summaries[0];
        const quiz = quizzes[0];

        // Transform to StudyMaterial format
        return {
          id: progress.id,
          title: progress.topic,
          type: summary ? "pdf" : "article",
          url: summary?.path || `/study/${progress.topicSlug}`,
          specialty: progress.topic, // Could map to actual specialty if needed
          difficulty: "medium" as const, // Default difficulty
          uploadDate: new Date(progress.updatedAt).toISOString().split("T")[0],
          size: 0, // Not tracked currently
          pages: 0, // Not tracked in current schema
          isBookmarked: false, // TODO: Implement bookmarks
          progress:
            progress.summaryDone && progress.flashcardsDone
              ? 100
              : progress.summaryDone || progress.flashcardsDone
              ? 50
              : 0,
          lastAccessed: new Date(progress.updatedAt)
            .toISOString()
            .split("T")[0],
          notes: [],
          tags: [progress.topicSlug],
          // Additional metadata
          hasSummary: !!summary,
          hasFlashcards: flashcards.length > 0,
          flashcardCount: flashcards.length > 0 ? flashcards[0].count : 0,
          hasQuiz: !!quiz,
          quizScore: progress.quizScore || 0,
          masteryLevel:
            progress.summaryDone && progress.flashcardsDone ? 1.0 : 0.5,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: materialsWithDetails,
      count: materialsWithDetails.length,
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
