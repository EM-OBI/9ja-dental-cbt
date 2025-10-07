import React from "react";
import { AlertCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type ErrorSeverity = "error" | "warning" | "info";

interface ErrorAlertProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
}

const severityConfig = {
  error: {
    icon: XCircle,
    containerClass:
      "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40",
    iconClass: "text-red-600 dark:text-red-400",
    titleClass: "text-red-900 dark:text-red-300",
    messageClass: "text-red-700 dark:text-red-400",
    buttonClass:
      "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white",
  },
  warning: {
    icon: AlertTriangle,
    containerClass:
      "border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-950/40",
    iconClass: "text-yellow-600 dark:text-yellow-400",
    titleClass: "text-yellow-900 dark:text-yellow-300",
    messageClass: "text-yellow-700 dark:text-yellow-400",
    buttonClass:
      "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600 text-white",
  },
  info: {
    icon: AlertCircle,
    containerClass:
      "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/40",
    iconClass: "text-blue-600 dark:text-blue-400",
    titleClass: "text-blue-900 dark:text-blue-300",
    messageClass: "text-blue-700 dark:text-blue-400",
    buttonClass:
      "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white",
  },
};

export function ErrorAlert({
  title,
  message,
  severity = "error",
  onRetry,
  onDismiss,
  className,
  showIcon = true,
}: ErrorAlertProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-4 transition-all duration-200",
        config.containerClass,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            <Icon className={cn("h-5 w-5", config.iconClass)} />
          </div>
        )}
        <div className="flex-1 space-y-1">
          {title && (
            <h3 className={cn("text-sm font-semibold", config.titleClass)}>
              {title}
            </h3>
          )}
          <p className={cn("text-sm", config.messageClass)}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              "flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5",
              config.iconClass
            )}
            aria-label="Dismiss"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
      {onRetry && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onRetry}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              config.buttonClass
            )}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// Inline error state component (for replacing error states in pages)
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-red-100 p-3 dark:bg-red-950/40">
        <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

// API Error wrapper component
interface ApiErrorProps {
  error: Error | string | null;
  onRetry?: () => void;
  className?: string;
}

export function ApiError({ error, onRetry, className }: ApiErrorProps) {
  if (!error) return null;

  const message = typeof error === "string" ? error : error.message;

  // Classify the error type
  const isNetworkError =
    message.toLowerCase().includes("network") ||
    message.toLowerCase().includes("fetch") ||
    message.toLowerCase().includes("connection");

  const isAuthError =
    message.toLowerCase().includes("unauthorized") ||
    message.toLowerCase().includes("authentication") ||
    message.toLowerCase().includes("forbidden");

  const severity: ErrorSeverity = isAuthError
    ? "warning"
    : isNetworkError
    ? "error"
    : "info";

  const title = isNetworkError
    ? "Connection Error"
    : isAuthError
    ? "Authentication Required"
    : "Error";

  return (
    <ErrorAlert
      title={title}
      message={message}
      severity={severity}
      onRetry={onRetry}
      className={className}
    />
  );
}
