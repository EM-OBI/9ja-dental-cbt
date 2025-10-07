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
import { nanoid } from "nanoid";
import { slugify } from "@/lib/slugify";

// export const runtime = "edge";

/**
 * POST /api/study/generate
 * Generate study materials using AI (without PDF upload)
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Parse request body
    const body = (await req.json()) as {
      topic?: string;
      questionCount?: number;
      flashcardCount?: number;
      source?: { type: string; content?: string };
    };

    const { topic, questionCount = 10, flashcardCount = 15, source } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // 3. Get Cloudflare context
    const { env } = await getCloudflareContext();
    const db = await getDb();

    const topicSlug = slugify(topic);

    // 4. Check if study materials already exist for this topic
    const existing = await db
      .select()
      .from(studyProgress)
      .where(
        and(
          eq(studyProgress.userId, userId),
          eq(studyProgress.topicSlug, topicSlug)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: "Study materials already exist for this topic",
          existingId: existing[0].id,
        },
        { status: 409 }
      );
    }

    // 5. Create job for async processing
    const jobId = nanoid();

    const jobStatus = {
      status: "SUMMARIZING",
      progress: 20,
      message: "Generating AI study materials...",
      metadata: {
        userId,
        topic,
        topicSlug,
        questionCount,
        flashcardCount,
        source: source || { type: "topic" },
      },
    };

    await env.KV_DENTAL.put(`job:${jobId}`, JSON.stringify(jobStatus), {
      expirationTtl: 3600,
    });

    // 6. Trigger async AI generation via queue (if available)
    // For now, we'll process synchronously for simplicity
    try {
      const result = await generateStudyMaterials({
        env: env as Cloudflare.Env,
        db,
        userId,
        topic,
        topicSlug,
        questionCount,
        flashcardCount,
        source,
      });

      // Update job status to completed
      await env.KV_DENTAL.put(
        `job:${jobId}`,
        JSON.stringify({
          status: "COMPLETED",
          progress: 100,
          message: "Study materials generated successfully!",
          result_id: result.progressId,
        }),
        { expirationTtl: 3600 }
      );

      return NextResponse.json({
        jobId,
        id: result.progressId,
        immediate: true,
      });
    } catch (genError: unknown) {
      // Update job status to failed
      const errorMessage =
        genError instanceof Error ? genError.message : "Generation failed";
      await env.KV_DENTAL.put(
        `job:${jobId}`,
        JSON.stringify({
          status: "FAILED",
          progress: 100,
          message: errorMessage,
        }),
        { expirationTtl: 3600 }
      );

      throw genError;
    }
  } catch (error: unknown) {
    console.error("Generate error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to generate study materials";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Generate study materials using AI
 */
interface GenerateStudyParams {
  env: Cloudflare.Env;
  db: Awaited<ReturnType<typeof getDb>>;
  userId: string;
  topic: string;
  topicSlug: string;
  questionCount: number;
  flashcardCount: number;
  source?: { type: string; content?: string };
}

async function generateStudyMaterials({
  env,
  db,
  userId,
  topic,
  topicSlug,
  questionCount,
  flashcardCount,
  source,
}: GenerateStudyParams) {
  if (!env.AI) {
    throw new Error("AI binding not available");
  }
  if (!env.STUDY_BUCKET) {
    throw new Error("STUDY_BUCKET binding not available");
  }

  const ai = env.AI;
  const bucket = env.STUDY_BUCKET;

  // 1. Generate Summary
  const summaryPrompt = source?.content
    ? `Provide a comprehensive summary of the following content about "${topic}":\n\n${source.content}`
    : `Provide a comprehensive summary suitable for dental students studying "${topic}". Include key concepts, definitions, and important facts.`;

  const summaryResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      { role: "system", content: "You are an expert dental educator." },
      { role: "user", content: summaryPrompt },
    ],
  });

  const summaryContent = summaryResponse.response || "Summary not available.";

  // Store summary in R2
  const summaryId = nanoid();
  const summaryPath = `summaries/${userId}/${topicSlug}/${summaryId}.md`;

  await bucket.put(summaryPath, summaryContent, {
    httpMetadata: { contentType: "text/markdown" },
  });

  // Insert summary record
  await db.insert(studySummaries).values({
    id: summaryId,
    userId,
    topic,
    topicSlug,
    path: summaryPath,
    model: "llama-3-8b-instruct",
    createdAt: new Date(),
  });

  // 2. Generate Flashcards
  const flashcardsPrompt = `Generate exactly ${flashcardCount} flashcards for dental students studying "${topic}". 
Format as JSON array: [{"question": "...", "answer": "...", "topic": "${topic}"}]
Focus on key terms, definitions, and important concepts.`;

  const flashcardsResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      {
        role: "system",
        content:
          "You are an expert dental educator. Respond only with valid JSON.",
      },
      { role: "user", content: flashcardsPrompt },
    ],
  });

  let flashcardsData = [];
  try {
    const responseText = flashcardsResponse.response || "[]";
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    flashcardsData = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (e) {
    console.error("Flashcards parsing error:", e);
    flashcardsData = [];
  }

  // Store flashcards in R2
  const flashcardsId = nanoid();
  const flashcardsPath = `flashcards/${userId}/${topicSlug}/${flashcardsId}.json`;

  await bucket.put(flashcardsPath, JSON.stringify(flashcardsData), {
    httpMetadata: { contentType: "application/json" },
  });

  // Insert flashcards record
  await db.insert(studyFlashcards).values({
    id: flashcardsId,
    userId,
    topic,
    topicSlug,
    filePath: flashcardsPath,
    count: flashcardsData.length,
    summaryId,
    model: "llama-3-8b-instruct",
    createdAt: new Date(),
  });

  // 3. Generate Quiz
  const quizPrompt = `Generate exactly ${questionCount} multiple-choice questions for dental students studying "${topic}".
Format as JSON array: [{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A", "explanation": "..."}]
Make questions challenging but fair.`;

  const quizResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      {
        role: "system",
        content:
          "You are an expert dental educator. Respond only with valid JSON.",
      },
      { role: "user", content: quizPrompt },
    ],
  });

  let quizData = [];
  try {
    const responseText = quizResponse.response || "[]";
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    quizData = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (e) {
    console.error("Quiz parsing error:", e);
    quizData = [];
  }

  // Store quiz in R2
  const quizId = nanoid();
  const quizPath = `quizzes/${userId}/${topicSlug}/${quizId}.json`;

  await bucket.put(quizPath, JSON.stringify(quizData), {
    httpMetadata: { contentType: "application/json" },
  });

  // Insert quiz record
  await db.insert(studyQuizzes).values({
    id: quizId,
    userId,
    topic,
    topicSlug,
    filePath: quizPath,
    numQuestions: quizData.length,
    flashcardId: flashcardsId,
    model: "llama-3-8b-instruct",
    createdAt: new Date(),
  });

  // 4. Create progress record
  const progressId = nanoid();
  await db.insert(studyProgress).values({
    id: progressId,
    userId,
    topic,
    topicSlug,
    summaryDone: false,
    flashcardsDone: false,
    quizScore: null,
    lastGeneratedAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    summaryId,
    flashcardsId,
    quizId,
    progressId,
  };
}
