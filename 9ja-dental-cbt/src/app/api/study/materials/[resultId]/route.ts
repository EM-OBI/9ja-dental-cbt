import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import {
  studyPackages,
  studySummaries,
  studyFlashcards,
  studyQuizzes,
} from "@/db/schema";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ resultId: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { resultId: packageId } = await context.params;
    const db = await getDb();
    const cfContext = await getCloudflareContext();
    const env = cfContext.env as Cloudflare.Env;

    console.log("[Materials API] Fetching materials for packageId:", packageId);

    // First, verify the package belongs to this user
    const [packageRecord] = await db
      .select()
      .from(studyPackages)
      .where(eq(studyPackages.id, packageId))
      .limit(1);

    if (!packageRecord) {
      console.log("[Materials API] Package not found:", packageId);
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    if (packageRecord.userId !== userId) {
      console.log("[Materials API] Package does not belong to user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("[Materials API] Package found:", packageRecord.topic);

    // Fetch all materials for this package
    const [summaryResults, flashcardResults, quizResults] = await Promise.all([
      db
        .select()
        .from(studySummaries)
        .where(eq(studySummaries.packageId, packageId))
        .limit(1),
      db
        .select()
        .from(studyFlashcards)
        .where(eq(studyFlashcards.packageId, packageId))
        .limit(1),
      db
        .select()
        .from(studyQuizzes)
        .where(eq(studyQuizzes.packageId, packageId))
        .limit(1),
    ]);

    console.log("[Materials API] Query results:", {
      summaryCount: summaryResults.length,
      flashcardCount: flashcardResults.length,
      quizCount: quizResults.length,
    });

    const materials: Record<string, unknown> = {};

    // Fetch summary content from R2
    if (summaryResults.length > 0) {
      const summary = summaryResults[0];
      console.log("[Materials API] Fetching summary from R2:", summary.r2Path);
      const object = await env.MY_BUCKET.get(summary.r2Path);

      if (!object) {
        console.error(
          "[Materials API] Summary object not found in R2:",
          summary.r2Path
        );
      } else {
        console.log("[Materials API] Summary object found, size:", object.size);
      }

      const content = object ? await object.text() : "";

      materials.summary = {
        id: summary.id,
        type: "summary",
        content: content,
        generatedAt: summary.createdAt,
        model: summary.model,
      };
      console.log("[Materials API] Summary content length:", content.length);
    } else {
      console.log("[Materials API] No summary found in database");
    }

    // Fetch flashcards content from R2
    if (flashcardResults.length > 0) {
      const flashcard = flashcardResults[0];
      console.log(
        "[Materials API] Fetching flashcards from R2:",
        flashcard.r2Path
      );
      const object = await env.MY_BUCKET.get(flashcard.r2Path);

      if (!object) {
        console.error(
          "[Materials API] Flashcards object not found in R2:",
          flashcard.r2Path
        );
      } else {
        console.log(
          "[Materials API] Flashcards object found, size:",
          object.size
        );
      }

      const content = object ? await object.text() : "[]";

      materials.flashcards = {
        id: flashcard.id,
        type: "flashcards",
        content: JSON.parse(content),
        generatedAt: flashcard.createdAt,
        model: flashcard.model,
      };
      console.log(
        "[Materials API] Flashcards count:",
        JSON.parse(content).length
      );
    } else {
      console.log("[Materials API] No flashcards found in database");
    }

    // Fetch quiz content from R2
    if (quizResults.length > 0) {
      const quiz = quizResults[0];
      console.log("[Materials API] Fetching quiz from R2:", quiz.r2Path);
      const object = await env.MY_BUCKET.get(quiz.r2Path);

      if (!object) {
        console.error(
          "[Materials API] Quiz object not found in R2:",
          quiz.r2Path
        );
      } else {
        console.log("[Materials API] Quiz object found, size:", object.size);
      }

      const content = object ? await object.text() : "{}";
      const parsed = JSON.parse(content);

      materials.quiz = {
        id: quiz.id,
        type: "quiz",
        content: parsed.questions || parsed, // Handle both formats
        generatedAt: quiz.createdAt,
        model: quiz.model,
      };
      console.log(
        "[Materials API] Quiz questions count:",
        (parsed.questions || parsed).length
      );
    } else {
      console.log("[Materials API] No quiz found in database");
    }

    console.log("[Materials API] Returning materials:", Object.keys(materials));

    return NextResponse.json({
      success: true,
      package: {
        id: packageRecord.id,
        topic: packageRecord.topic,
        createdAt: packageRecord.createdAt,
      },
      materials,
    });
  } catch (error) {
    console.error("[Materials API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}
