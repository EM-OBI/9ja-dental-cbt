import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { nanoid } from "nanoid";

// export const runtime = "edge";

/**
 * POST /api/study/upload/init
 * Initialize PDF upload and return pre-signed R2 URL
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
      fileName?: string;
      topic?: string;
      questionCount?: number;
      flashcardCount?: number;
    };

    const { fileName, topic, questionCount, flashcardCount } = body;

    if (!fileName || !topic) {
      return NextResponse.json(
        { error: "Missing required fields: fileName, topic" },
        { status: 400 }
      );
    }

    // 3. Get Cloudflare context
    const { env } = await getCloudflareContext();

    // 4. Generate IDs
    const jobId = nanoid();
    const documentId = nanoid();
    const r2Key = `${userId}/${documentId}.pdf`;

    // 5. Generate upload URL
    // For simplicity, we'll return a direct upload endpoint
    // In production, use R2's createSignedUrl or implement via Workers API
    const uploadUrl = `/api/study/upload/${documentId}`;

    // 6. Store job status in KV
    const initialStatus = {
      status: "PENDING",
      progress: 5,
      message: "Awaiting file upload...",
      metadata: {
        userId,
        topic,
        questionCount: questionCount || 10,
        flashcardCount: flashcardCount || 15,
        r2Key,
        documentId,
      },
    };

    await env.KV_DENTAL.put(
      `job:${jobId}`,
      JSON.stringify(initialStatus),
      { expirationTtl: 3600 } // 1 hour
    );

    return NextResponse.json({
      jobId,
      documentId,
      uploadUrl,
    });
  } catch (error: unknown) {
    console.error("Upload init error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to initialize upload";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
