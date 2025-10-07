import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// export const runtime = "edge";

/**
 * GET /api/study/jobs/[jobId]/status
 * Poll job status from KV
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Get Cloudflare context
    const { env } = await getCloudflareContext();

    // Fetch job status from KV
    const statusJson = await env.KV_DENTAL.get(`job:${jobId}`);

    if (!statusJson) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const status = JSON.parse(statusJson);

    return NextResponse.json(status);
  } catch (error: unknown) {
    console.error("Job status error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch job status";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
