import { NextRequest, NextResponse } from "next/server";
import { logger, monitor } from "@/app/api/monitoring";
import { ApiResponse, HTTP_STATUS } from "@/app/api/types";

interface MonitoringData {
  metrics: Record<string, number>;
  alerts: Array<{ message: string; timestamp: string; severity: string }>;
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
    context?: Record<string, unknown>;
  }>;
  healthStatus: "healthy" | "degraded" | "unhealthy";
  uptime: number;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<MonitoringData>>> {
  try {
    // Only allow monitoring access in development or with proper authorization
    if (process.env.NODE_ENV === "production") {
      const authHeader = request.headers.get("authorization");
      const monitoringKey = process.env.MONITORING_API_KEY;

      if (
        !authHeader ||
        !monitoringKey ||
        authHeader !== `Bearer ${monitoringKey}`
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Monitoring access requires valid authorization",
            },
            timestamp: new Date().toISOString(),
          },
          { status: HTTP_STATUS.UNAUTHORIZED }
        );
      }
    }

    const metrics = monitor.getMetrics();
    const alerts = monitor.getAlerts();
    const logs = logger.getLogs();
    const healthStatus = monitor.getHealthStatus();
    const uptime = process.uptime() * 1000; // Convert to milliseconds

    const monitoringData: MonitoringData = {
      metrics,
      alerts,
      logs: logs.map((log) => ({
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        context: log.context,
      })),
      healthStatus,
      uptime,
    };

    return NextResponse.json(
      {
        success: true,
        data: monitoringData,
        timestamp: new Date().toISOString(),
      },
      {
        status: HTTP_STATUS.OK,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Monitoring endpoint error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MONITORING_ERROR",
          message: "Failed to retrieve monitoring data",
        },
        timestamp: new Date().toISOString(),
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// GET /api/monitoring/metrics - Returns just metrics data
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { level = "info", limit = 50 } = body;

    const logs = logger.getLogs(level, limit);

    return NextResponse.json({
      success: true,
      data: { logs },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Invalid request body",
        },
        timestamp: new Date().toISOString(),
      },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}
