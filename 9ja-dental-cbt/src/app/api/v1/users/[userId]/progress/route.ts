import { NextRequest, NextResponse } from "next/server";
import { unifiedDatabaseService } from "@/services/unifiedDatabase";
import {
  ApiResponse,
  API_ERROR_CODES,
  HTTP_STATUS,
  validateUserId,
  validateQueryParams,
  ProgressQueryParams,
} from "@/app/api/types";
import { UnifiedProgressData } from "@/types/progress";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
): Promise<NextResponse<ApiResponse<UnifiedProgressData>>> {
  const startTime = Date.now();

  try {
    // Extract and validate userId
    const { userId } = await params;

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

    // Extract and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams: ProgressQueryParams = {
      includeHistory: searchParams.get("includeHistory") === "true",
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
    };

    if (!validateQueryParams(queryParams)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: API_ERROR_CODES.VALIDATION_ERROR,
            message:
              "Invalid query parameters. Limit must be between 1 and 50.",
          },
          timestamp: new Date().toISOString(),
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // TODO: Add authentication check
    // const authResult = await validateAuthToken(request);
    // if (!authResult.valid) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: {
    //         code: API_ERROR_CODES.UNAUTHORIZED,
    //         message: 'Invalid or missing authentication token',
    //       },
    //       timestamp: new Date().toISOString(),
    //     },
    //     { status: HTTP_STATUS.UNAUTHORIZED }
    //   );
    // }

    // Check if user exists
    const userExists = await unifiedDatabaseService.userExists(userId);
    if (!userExists) {
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

    // Get user progress data
    const progressData = await unifiedDatabaseService.getUserProgress(userId, {
      includeHistory: queryParams.includeHistory,
      limit: queryParams.limit,
    });

    // Log performance metrics
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.log(`Progress API: ${userId} - ${responseTime}ms`);

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: progressData,
        timestamp: new Date().toISOString(),
      },
      {
        status: HTTP_STATUS.OK,
        headers: {
          "Cache-Control": "public, max-age=300", // 5 minutes cache
          "X-Response-Time": `${responseTime}ms`,
        },
      }
    );
  } catch (error) {
    // Log error for monitoring
    console.error("Progress API Error:", error);

    // Handle known errors
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: API_ERROR_CODES.USER_NOT_FOUND,
              message: error.message,
            },
            timestamp: new Date().toISOString(),
          },
          { status: HTTP_STATUS.NOT_FOUND }
        );
      }
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: API_ERROR_CODES.INTERNAL_ERROR,
          message: "An unexpected error occurred while fetching progress data",
          details:
            process.env.NODE_ENV === "development"
              ? {
                  error:
                    error instanceof Error ? error.message : "Unknown error",
                }
              : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
