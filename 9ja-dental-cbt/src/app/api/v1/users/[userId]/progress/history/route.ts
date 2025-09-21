import { NextRequest, NextResponse } from "next/server";
import { unifiedDatabaseService } from "@/services/unifiedDatabase";
import {
  ApiResponse,
  API_ERROR_CODES,
  HTTP_STATUS,
  validateUserId,
  RATE_LIMITS,
} from "@/app/api/types";
import {
  checkRateLimit,
  getClientIdentifier,
  CORS_HEADERS,
  logRequest,
  validatePaginationParams,
} from "@/app/api/middleware";
import { PerformanceChart } from "@/types/progress";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse<ApiResponse<PerformanceChart[]>>> {
  const startTime = Date.now();
  const { userId } = await params;

  try {
    // Validate user ID
    if (!validateUserId(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: "Invalid user ID format",
          },
          timestamp: new Date().toISOString(),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const paginationResult = validatePaginationParams(null, limitParam);

    if (!paginationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message: paginationResult.error || "Invalid pagination parameters",
          },
          timestamp: new Date().toISOString(),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `history:${clientId}`,
      RATE_LIMITS.PROGRESS_ENDPOINT
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.RATE_LIMITED,
            message: "Too many requests. Please try again later.",
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: HTTP_STATUS.TOO_MANY_REQUESTS,
          headers: {
            "X-RateLimit-Limit":
              RATE_LIMITS.PROGRESS_ENDPOINT.requests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(
              rateLimitResult.resetTime! / 1000
            ).toString(),
          },
        }
      );
    }

    // Check if user exists
    const userExists = await unifiedDatabaseService.userExists(userId);
    if (!userExists) {
      logRequest(
        "GET",
        `/api/v1/users/${userId}/progress/history`,
        userId,
        Date.now() - startTime,
        404
      );

      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.USER_NOT_FOUND,
            message: `User with ID ${userId} not found`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Get history data
    const historyData = await unifiedDatabaseService.getUserProgressHistory(
      userId,
      paginationResult.limit
    );

    const responseTime = Date.now() - startTime;
    logRequest(
      "GET",
      `/api/v1/users/${userId}/progress/history`,
      userId,
      responseTime,
      200
    );

    return NextResponse.json(
      {
        success: true,
        data: historyData,
        timestamp: new Date().toISOString(),
      },
      {
        status: HTTP_STATUS.OK,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "public, max-age=900", // 15 minutes cache for history
          "X-Response-Time": `${responseTime}ms`,
          "X-RateLimit-Limit":
            RATE_LIMITS.PROGRESS_ENDPOINT.requests.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "0",
          "X-Total-Records": historyData.length.toString(),
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logRequest(
      "GET",
      `/api/v1/users/${userId}/progress/history`,
      userId,
      responseTime,
      500,
      error instanceof Error ? error.message : "Unknown error"
    );

    console.error("History API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message: "An unexpected error occurred while fetching history data",
        },
        timestamp: new Date().toISOString(),
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}
