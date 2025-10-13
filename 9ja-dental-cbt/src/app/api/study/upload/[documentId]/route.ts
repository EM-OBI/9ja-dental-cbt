import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { extractText, getDocumentProxy } from "unpdf";
import type { JobMetadata, JobStatusPayload } from "@/types/studyJob";
import { generateStudyMaterials } from "@/services/studyGeneration";
import { getDb } from "@/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  let env: CloudflareEnv | null = null;
  let jobKey: string | null = null;
  let jobId: string | null = null;
  try {
    const { documentId } = await params;
    const resolvedJobId =
      req.headers.get("x-job-id") ?? req.nextUrl.searchParams.get("jobId");
    jobId = resolvedJobId;

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing job identifier" },
        { status: 400 }
      );
    }

    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const context = await getCloudflareContext();
    env = context.env;
    if (!env) {
      throw new Error("Cloudflare bindings unavailable");
    }
    const currentEnv = env;

    jobKey = `job:${jobId}`;
    const jobJson = await currentEnv.KV_DENTAL.get(jobKey);

    if (!jobJson) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const jobStatus = JSON.parse(jobJson) as JobStatusPayload & {
      jobId?: string;
      metadata?: JobMetadata;
    };

    if (!jobStatus.metadata) {
      return NextResponse.json(
        { error: "Job metadata missing" },
        { status: 422 }
      );
    }

    const metadata = jobStatus.metadata;

    if (metadata.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (metadata.documentId !== documentId) {
      return NextResponse.json({ error: "Document mismatch" }, { status: 409 });
    }

    const pdfBuffer = await req.arrayBuffer();

    if (pdfBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "Uploaded file is empty" },
        { status: 400 }
      );
    }

    await currentEnv.MY_BUCKET.put(metadata.r2Key, pdfBuffer, {
      httpMetadata: {
        contentType: "application/pdf",
      },
      customMetadata: {
        jobId,
        userId,
        topic: metadata.topic,
        topicSlug: metadata.topicSlug,
        questionCount: String(metadata.questionCount),
        flashcardCount: String(metadata.flashcardCount),
        documentId: metadata.documentId,
      },
    });

    if (!jobKey) {
      throw new Error("Job key missing");
    }

    const keyForStatus = jobKey;
    const envForStatus = currentEnv;

    const writeStatus = async (update: JobStatusPayload) => {
      const payload = {
        jobId,
        metadata,
        ...update,
      };

      await envForStatus.KV_DENTAL.put(keyForStatus, JSON.stringify(payload), {
        expirationTtl: 3600,
      });
    };

    await writeStatus({
      status: "UPLOADED",
      progress: 30,
      message: "File uploaded. Processing...",
    });

    await writeStatus({
      status: "PARSING",
      progress: 40,
      message: "Extracting text from PDF...",
    });

    const document = await getDocumentProxy(new Uint8Array(pdfBuffer));
    const extracted = await extractText(document, { mergePages: true });
    const extractedText = extracted.text?.trim();

    if (!extractedText) {
      throw new Error("Unable to extract text from PDF");
    }

    const MAX_PDF_TEXT_LENGTH = 50_000;
    const truncatedText =
      extractedText.length > MAX_PDF_TEXT_LENGTH
        ? extractedText.slice(0, MAX_PDF_TEXT_LENGTH)
        : extractedText;

    // Cache the extracted content in KV for future reference
    const contentCacheKey = `pdf-content:${documentId}`;
    await currentEnv.KV_DENTAL.put(
      contentCacheKey,
      JSON.stringify({
        documentId,
        topic: metadata.topic,
        topicSlug: metadata.topicSlug,
        extractedAt: new Date().toISOString(),
        textLength: extractedText.length,
        truncatedLength: truncatedText.length,
        content: truncatedText,
      }),
      { expirationTtl: 86400 } // Cache for 24 hours
    );

    const db = await getDb();

    console.log("[PDF Upload] Starting study materials generation...", {
      topic: metadata.topic,
      questionCount: metadata.questionCount,
      flashcardCount: metadata.flashcardCount,
      contentLength: truncatedText.length,
    });

    const result = await generateStudyMaterials(
      {
        env: currentEnv as Cloudflare.Env,
        db,
        userId,
        topic: metadata.topic,
        topicSlug: metadata.topicSlug,
        questionCount: metadata.questionCount,
        flashcardCount: metadata.flashcardCount,
        source: { type: "pdf", content: truncatedText, path: metadata.r2Key },
      },
      writeStatus
    );

    console.log("[PDF Upload] Study materials generated successfully", {
      resultId: result.packageId,
    });

    await writeStatus({
      status: "COMPLETED",
      progress: 100,
      message: "Study materials generated successfully!",
      resultId: result.packageId,
    });

    return NextResponse.json({
      success: true,
      jobId,
      r2Key: metadata.r2Key,
      resultId: result.packageId,
    });
  } catch (error: unknown) {
    console.error("Upload completion error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload file";
    if (jobId) {
      if (!env) {
        const context = await getCloudflareContext();
        env = context.env;
      }
      if (env) {
        const key = jobKey ?? `job:${jobId}`;
        await env.KV_DENTAL.put(
          key,
          JSON.stringify({
            jobId,
            status: "FAILED",
            progress: 100,
            message: errorMessage,
            error: errorMessage,
          }),
          { expirationTtl: 3600 }
        );
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
