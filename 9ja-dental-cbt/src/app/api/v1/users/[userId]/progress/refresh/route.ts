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
} from "@/app/api/middleware";

interface RefreshResponse {
  message: string;
  refreshedAt: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse<ApiResponse<RefreshResponse>>> {
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

    // Rate limiting (stricter for refresh endpoint)
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(
      `refresh:${clientId}`,
      RATE_LIMITS.REFRESH_ENDPOINT
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.RATE_LIMITED,
            message: "Too many refresh requests. Please try again later.",
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: HTTP_STATUS.TOO_MANY_REQUESTS,
          headers: {
            "X-RateLimit-Limit":
              RATE_LIMITS.REFRESH_ENDPOINT.requests.toString(),
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
        "POST",
        `/api/v1/users/${userId}/progress/refresh`,
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

    // Trigger refresh
    await unifiedDatabaseService.refreshUserProgress(userId);

    const responseTime = Date.now() - startTime;
    logRequest(
      "POST",
      `/api/v1/users/${userId}/progress/refresh`,
      userId,
      responseTime,
      200
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          message: "Progress data refresh initiated successfully",
          refreshedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: HTTP_STATUS.OK,
        headers: {
          ...CORS_HEADERS,
          "X-Response-Time": `${responseTime}ms`,
          "X-RateLimit-Limit": RATE_LIMITS.REFRESH_ENDPOINT.requests.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "0",
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logRequest(
      "POST",
      `/api/v1/users/${userId}/progress/refresh`,
      userId,
      responseTime,
      500,
      error instanceof Error ? error.message : "Unknown error"
    );

    console.error("Refresh API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message:
            "An unexpected error occurred while refreshing progress data",
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
