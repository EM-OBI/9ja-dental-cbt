import { NextRequest } from "next/server";
import { API_ERROR_CODES, RATE_LIMITS } from "@/app/api/types";

// Authentication interface
export interface AuthResult {
  valid: boolean;
  userId?: string;
  error?: string;
}

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Mock authentication validation
export async function validateAuthToken(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid authorization header" };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Mock token validation - replace with real JWT validation
  if (token === "mock-valid-token") {
    return { valid: true, userId: "user-123" };
  }

  if (token === "mock-valid-token-2") {
    return { valid: true, userId: "user-456" };
  }

  return { valid: false, error: "Invalid token" };
}

// Rate limiting middleware
export function checkRateLimit(
  identifier: string,
  limitConfig: { requests: number; windowMs: number }
): { allowed: boolean; resetTime?: number; remaining?: number } {
  const now = Date.now();
  const key = identifier;

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Reset window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limitConfig.windowMs,
    });

    return {
      allowed: true,
      remaining: limitConfig.requests - 1,
      resetTime: now + limitConfig.windowMs,
    };
  }

  if (current.count >= limitConfig.requests) {
    return {
      allowed: false,
      resetTime: current.resetTime,
      remaining: 0,
    };
  }

  current.count++;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: limitConfig.requests - current.count,
    resetTime: current.resetTime,
  };
}

// Get client identifier for rate limiting
export function getClientIdentifier(request: NextRequest): string {
  // In production, you might want to use a combination of IP and user ID
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "unknown";

  // If authenticated, use user ID instead of IP
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token === "mock-valid-token") return "user-123";
    if (token === "mock-valid-token-2") return "user-456";
  }

  return ip;
}

// CORS headers
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400", // 24 hours
} as const;

// Security headers
export const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
} as const;

// Request validation utilities
export function validatePaginationParams(
  page?: string | null,
  limit?: string | null
): { page: number; limit: number; valid: boolean; error?: string } {
  const parsedPage = page ? parseInt(page) : 1;
  const parsedLimit = limit ? parseInt(limit) : 10;

  if (isNaN(parsedPage) || parsedPage < 1) {
    return {
      page: 1,
      limit: 10,
      valid: false,
      error: "Page must be a positive integer",
    };
  }

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
    return {
      page: 1,
      limit: 10,
      valid: false,
      error: "Limit must be between 1 and 50",
    };
  }

  return { page: parsedPage, limit: parsedLimit, valid: true };
}

// Request logging for monitoring
export function logRequest(
  method: string,
  url: string,
  userId?: string,
  responseTime?: number,
  statusCode?: number,
  error?: string
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    method,
    url,
    userId,
    responseTime,
    statusCode,
    error,
  };

  // In production, send to logging service (e.g., Winston, DataDog, etc.)
  console.log("API Request:", JSON.stringify(logData));
}

// Health check utility
export interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  checks: {
    database: boolean;
    cache?: boolean;
    external?: boolean;
  };
  timestamp: string;
  uptime: number;
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = process.hrtime.bigint();

  try {
    // Check database connectivity
    const dbHealthy = await checkDatabaseHealth();

    // Check cache connectivity (Redis, etc.)
    const cacheHealthy = await checkCacheHealth();

    const endTime = process.hrtime.bigint();
    const uptime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    const allHealthy = dbHealthy && cacheHealthy;

    return {
      status: allHealthy ? "healthy" : "unhealthy",
      checks: {
        database: dbHealthy,
        cache: cacheHealthy,
      },
      timestamp: new Date().toISOString(),
      uptime,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      checks: {
        database: false,
        cache: false,
      },
      timestamp: new Date().toISOString(),
      uptime: 0,
    };
  }
}

async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Mock database check - replace with real database ping
    await new Promise((resolve) => setTimeout(resolve, 10));
    return true;
  } catch {
    return false;
  }
}

async function checkCacheHealth(): Promise<boolean> {
  try {
    // Mock cache check - replace with real Redis ping
    await new Promise((resolve) => setTimeout(resolve, 5));
    return true;
  } catch {
    return false;
  }
}
