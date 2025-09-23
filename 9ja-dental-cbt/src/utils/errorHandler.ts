// Error handling system utilities for the frontend application
import { ApiError } from "@/types/backendTypes";

// Error types
export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

export interface AppError {
  type: ErrorType;
  message: string;
  status?: number;
  code?: string;
  details?: any;
  timestamp: Date;
}

// Error classification
export function classifyError(error: any): AppError {
  const timestamp = new Date();

  // Network errors
  if (
    error.name === "TypeError" ||
    error.message?.includes("Failed to fetch")
  ) {
    return {
      type: ErrorType.NETWORK,
      message:
        "Network connection failed. Please check your internet connection.",
      timestamp,
    };
  }

  // API errors with status codes
  if (error.status) {
    switch (error.status) {
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: "Your session has expired. Please log in again.",
          status: error.status,
          code: error.code,
          timestamp,
        };

      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          message: "You do not have permission to perform this action.",
          status: error.status,
          code: error.code,
          timestamp,
        };

      case 404:
        return {
          type: ErrorType.NOT_FOUND,
          message: "The requested resource was not found.",
          status: error.status,
          code: error.code,
          timestamp,
        };

      case 422:
        return {
          type: ErrorType.VALIDATION,
          message:
            error.message || "Invalid data provided. Please check your input.",
          status: error.status,
          code: error.code,
          details: error.details,
          timestamp,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER,
          message: "Server error occurred. Please try again later.",
          status: error.status,
          code: error.code,
          timestamp,
        };

      default:
        return {
          type: ErrorType.UNKNOWN,
          message: error.message || "An unexpected error occurred.",
          status: error.status,
          code: error.code,
          timestamp,
        };
    }
  }

  // Generic errors with message
  if (error.message) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      timestamp,
    };
  }

  // Fallback for unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: "An unexpected error occurred. Please try again.",
    timestamp,
  };
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle errors with appropriate user feedback
  handleError(error: any, showNotification = true): AppError {
    const appError = classifyError(error);

    // Log error
    this.logError(appError);

    // Show user notification if requested
    if (showNotification) {
      this.showErrorNotification(appError);
    }

    // Handle specific error types
    this.handleSpecificError(appError);

    return appError;
  }

  // Log error for debugging
  private logError(error: AppError): void {
    console.error("App Error:", error);

    // Add to error log
    this.errorLog.unshift(error);

    // Maintain log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // In production, you might want to send to error reporting service
    if (process.env.NODE_ENV === "production") {
      this.reportError(error);
    }
  }

  // Show user-friendly notification
  private showErrorNotification(error: AppError): void {
    // This would integrate with your notification system
    // For now, we'll use console.warn as a placeholder
    console.warn("Error notification:", error.message);

    // You could also dispatch a custom event that a toast component listens to
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app-error", {
          detail: error,
        })
      );
    }
  }

  // Handle specific error types with custom logic
  private handleSpecificError(error: AppError): void {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        // Clear local storage and redirect to login
        localStorage.removeItem("auth-token");
        localStorage.removeItem("user-data");
        if (typeof window !== "undefined") {
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }
        break;

      case ErrorType.NETWORK:
        // Could implement offline mode or retry logic
        break;

      case ErrorType.SERVER:
        // Could implement service status checking
        break;
    }
  }

  // Report error to external service (in production)
  private reportError(error: AppError): void {
    // In a real app, you'd send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Example: Sentry.captureException(error);
    }
  }

  // Get recent errors for debugging
  getRecentErrors(): AppError[] {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrors(): void {
    this.errorLog = [];
  }

  // Check if error should retry automatically
  shouldRetry(error: AppError): boolean {
    return (
      error.type === ErrorType.NETWORK ||
      (error.type === ErrorType.SERVER && error.status === 503)
    );
  }
}

// Utility function for handling API calls with error handling
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  customErrorMessage?: string
): Promise<T> {
  const errorHandler = ErrorHandler.getInstance();

  try {
    return await apiCall();
  } catch (error) {
    const appError = errorHandler.handleError(error, true);
    if (customErrorMessage) {
      appError.message = customErrorMessage;
    }
    throw appError;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();
