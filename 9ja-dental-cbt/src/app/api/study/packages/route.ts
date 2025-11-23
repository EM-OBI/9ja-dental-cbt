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

// export const runtime = "edge";

/**
 * GET /api/study/packages
 * Fetch all study packages for the current user with their materials info and progress
 */
export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate user
        const auth = await getAuth();
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        // 2. Get database instance
        const db = await getDb();

        // 3. Fetch all packages for the user
        const packages = await db
            .select({
                id: studyPackages.id,
                topic: studyPackages.topic,
                createdAt: studyPackages.createdAt,
                sourceType: studyPackages.sourceType,
            })
            .from(studyPackages)
            .where(eq(studyPackages.userId, userId))
            .orderBy(desc(studyPackages.createdAt));

        // 4. For each package, fetch materials info and progress
        const packagesWithDetails = await Promise.all(
            packages.map(async (pkg) => {
                // Check what materials exist
                const [summaries, flashcards, quizzes, progress] = await Promise.all([
                    db
                        .select({ id: studySummaries.id })
                        .from(studySummaries)
                        .where(eq(studySummaries.packageId, pkg.id))
                        .limit(1),
                    db
                        .select({ id: studyFlashcards.id })
                        .from(studyFlashcards)
                        .where(eq(studyFlashcards.packageId, pkg.id))
                        .limit(1),
                    db
                        .select({ id: studyQuizzes.id })
                        .from(studyQuizzes)
                        .where(eq(studyQuizzes.packageId, pkg.id))
                        .limit(1),
                    db
                        .select()
                        .from(studyProgress)
                        .where(eq(studyProgress.packageId, pkg.id))
                        .limit(1),
                ]);

                return {
                    id: pkg.id,
                    topic: pkg.topic,
                    createdAt: pkg.createdAt.toISOString(),
                    materials: {
                        hasSummary: summaries.length > 0,
                        hasFlashcards: flashcards.length > 0,
                        hasQuiz: quizzes.length > 0,
                    },
                    progress: progress[0]
                        ? {
                            summaryViewed: progress[0].summaryViewed || false,
                            flashcardsCompleted: progress[0].flashcardsCompleted || false,
                            quizScore: progress[0].quizScore || null,
                        }
                        : {
                            summaryViewed: false,
                            flashcardsCompleted: false,
                            quizScore: null,
                        },
                };
            })
        );

        return NextResponse.json({
            packages: packagesWithDetails,
        });
    } catch (error) {
        console.error("Error fetching packages:", error);
        return NextResponse.json(
            { error: "Failed to fetch study packages" },
            { status: 500 }
        );
    }
}
