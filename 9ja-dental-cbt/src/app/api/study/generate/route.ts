import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { nanoid } from "nanoid";
import { slugify } from "@/lib/slugify";
import { generateStudyMaterials } from "@/services/studyGeneration";
import type { JobStatusPayload, JobMetadata } from "@/types/studyJob";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      console.error("[study/generate] No session or user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = (await req.json()) as {
      topic?: string;
      questionCount?: number;
      flashcardCount?: number;
      source?: { type: string; content?: string };
    };

    console.log("[study/generate] Request body:", {
      ...body,
      source: body.source
        ? { type: body.source.type, hasContent: !!body.source.content }
        : undefined,
    });

    const { topic, questionCount = 10, flashcardCount = 15, source } = body;

    if (!topic || topic.trim().length === 0) {
      console.error("[study/generate] Missing or empty topic");
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const { env } = await getCloudflareContext();
    const db = await getDb();

    const topicSlug = slugify(topic);
    const jobId = nanoid();
    const jobKey = `job:${jobId}`;

    const metadata: JobMetadata = {
      userId,
      topic,
      topicSlug,
      questionCount,
      flashcardCount,
      documentId: jobId,
      r2Key: "",
      source,
    };

    const writeStatus = async (update: JobStatusPayload) => {
      const payload = {
        jobId,
        metadata,
        ...update,
      };

      await env.KV_DENTAL.put(jobKey, JSON.stringify(payload), {
        expirationTtl: 3600,
      });
    };

    await writeStatus({
      status: "PENDING",
      progress: 5,
      message: "Queued for generation...",
    });

    await writeStatus({
      status: "PARSING",
      progress: 15,
      message: "Preparing topic details...",
    });

    const result = await generateStudyMaterials(
      {
        env: env as unknown as Cloudflare.Env,
        db,
        userId,
        topic,
        topicSlug,
        questionCount,
        flashcardCount,
        source,
      },
      writeStatus
    );

    console.log("[study/generate] Generation successful:", {
      packageId: result.packageId,
    });

    await writeStatus({
      status: "COMPLETED",
      progress: 100,
      message: "Study materials generated successfully!",
      resultId: result.packageId,
    });

    return NextResponse.json({
      jobId,
      id: result.packageId,
    });
  } catch (error: unknown) {
    console.error("[study/generate] Error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to generate study materials";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
