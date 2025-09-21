import { NextRequest, NextResponse } from "next/server";
import {
  unifiedDatabaseService,
  ProgressSummary,
} from "@/services/unifiedDatabase";
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
} from "@/app/api/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse<ApiResponse<ProgressSummary>>> {
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

    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `summary:${clientId}`,
      RATE_LIMITS.SUMMARY_ENDPOINT
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
              RATE_LIMITS.SUMMARY_ENDPOINT.requests.toString(),
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
        `/api/v1/users/${userId}/progress/summary`,
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

    // Get summary data
    const summaryData = await unifiedDatabaseService.getUserProgressSummary(
      userId
    );

    const responseTime = Date.now() - startTime;
    logRequest(
      "GET",
      `/api/v1/users/${userId}/progress/summary`,
      userId,
      responseTime,
      200
    );

    return NextResponse.json(
      {
        success: true,
        data: summaryData,
        timestamp: new Date().toISOString(),
      },
      {
        status: HTTP_STATUS.OK,
        headers: {
          ...CORS_HEADERS,
          "Cache-Control": "public, max-age=180", // 3 minutes cache
          "X-Response-Time": `${responseTime}ms`,
          "X-RateLimit-Limit": RATE_LIMITS.SUMMARY_ENDPOINT.requests.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "0",
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logRequest(
      "GET",
      `/api/v1/users/${userId}/progress/summary`,
      userId,
      responseTime,
      500,
      error instanceof Error ? error.message : "Unknown error"
    );

    console.error("Summary API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message: "An unexpected error occurred while fetching summary data",
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
