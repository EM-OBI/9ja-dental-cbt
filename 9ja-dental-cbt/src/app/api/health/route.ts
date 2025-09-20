import { NextRequest, NextResponse } from "next/server";
import { performHealthCheck, HealthCheckResult } from "@/app/api/middleware";
import { ApiResponse, HTTP_STATUS } from "@/app/api/types";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<HealthCheckResult>>> {
  try {
    const healthResult = await performHealthCheck();

    const statusCode =
      healthResult.status === "healthy"
        ? HTTP_STATUS.OK
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

    return NextResponse.json(
      {
        success: healthResult.status === "healthy",
        data: healthResult,
        timestamp: new Date().toISOString(),
      },
      {
        status: statusCode,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "HEALTH_CHECK_FAILED",
          message: "Health check failed",
        },
        timestamp: new Date().toISOString(),
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
