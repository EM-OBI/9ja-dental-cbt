// API Response Types for Backend
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface ProgressQueryParams {
  includeHistory?: boolean;
  limit?: number;
}

// Error codes as defined in specification
export const API_ERROR_CODES = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  INVALID_REQUEST: "INVALID_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Rate limiting configuration
export const RATE_LIMITS = {
  PROGRESS_ENDPOINT: { requests: 60, windowMs: 60 * 1000 }, // 60 requests per minute
  REFRESH_ENDPOINT: { requests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  SUMMARY_ENDPOINT: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  PROGRESS_TTL: 5 * 60, // 5 minutes
  LEADERBOARD_TTL: 15 * 60, // 15 minutes
  SPECIALTY_STATS_TTL: 60 * 60, // 1 hour
} as const;

// Validation schemas
export interface UserIdParams {
  userId: string;
}

export const validateUserId = (userId: string): boolean => {
  return typeof userId === "string" && userId.length > 0 && userId.length <= 50;
};

export const validateQueryParams = (params: ProgressQueryParams): boolean => {
  if (params.limit && (params.limit < 1 || params.limit > 50)) {
    return false;
  }
  return true;
};
