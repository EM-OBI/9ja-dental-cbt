import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { studyFlashcards, studyPackages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// export const runtime = "edge";

/**
 * GET /api/study/flashcards
 * Fetch all flashcard sets for the current user
 */
export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate user
        const auth = await getAuth();
        const session = await auth.api.getSession({ headers: request.headers });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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

        // 3. Fetch all flashcard sets for the user, joined with package info
        const flashcardSets = await db
            .select({
                id: studyFlashcards.id,
                packageId: studyFlashcards.packageId,
                r2Path: studyFlashcards.r2Path,
                count: studyFlashcards.count,
                createdAt: studyFlashcards.createdAt,
                topic: studyPackages.topic,
            })
            .from(studyFlashcards)
            .innerJoin(studyPackages, eq(studyFlashcards.packageId, studyPackages.id))
            .where(eq(studyFlashcards.userId, session.user.id))
            .orderBy(desc(studyFlashcards.createdAt));

        // 4. Fetch the actual flashcard content from R2 for each set
        const flashcardsWithContent = await Promise.all(
            flashcardSets.map(async (set) => {
                try {
                    const object = await bucket.get(set.r2Path);
                    if (!object) {
                        console.error(`Flashcards not found in R2: ${set.r2Path}`);
                        return {
                            id: set.id,
                            topic: set.topic,
                            cardCount: set.count,
                            createdAt: set.createdAt.toISOString(),
                            cards: [],
                        };
                    }

                    const content = await object.text();
                    const flashcardsData = JSON.parse(content) as Array<{
                        front: string;
                        back: string;
                        hint?: string;
                    }>;

                    return {
                        id: set.id,
                        topic: set.topic,
                        cardCount: set.count,
                        createdAt: set.createdAt.toISOString(),
                        cards: flashcardsData,
                    };
                } catch (error) {
                    console.error(`Error fetching flashcards for ${set.id}:`, error);
                    return {
                        id: set.id,
                        topic: set.topic,
                        cardCount: set.count,
                        createdAt: set.createdAt.toISOString(),
                        cards: [],
                    };
                }
            })
        );

        return NextResponse.json({
            sets: flashcardsWithContent,
        });
    } catch (error) {
        console.error("Error fetching flashcards:", error);
        return NextResponse.json(
            { error: "Failed to fetch flashcards" },
            { status: 500 }
        );
    }
}
