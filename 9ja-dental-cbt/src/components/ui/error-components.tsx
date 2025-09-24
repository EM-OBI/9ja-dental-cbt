"use client";

import React from "react";
import {
  AppError,
  ErrorType,
  ErrorHandler,
  classifyError,
  ErrorInput,
} from "@/utils/errorHandler";

// React hook for error handling
export function useErrorHandler() {
  const errorHandler = React.useMemo(() => {
    return ErrorHandler.getInstance();
  }, []);

  const handleError = React.useCallback(
    (error: ErrorInput, showNotification = true) => {
      return errorHandler.handleError(error, showNotification);
    },
    [errorHandler]
  );

  const handleAsyncError = React.useCallback(
    async (asyncFn: () => Promise<unknown>): Promise<unknown> => {
      try {
        return await asyncFn();
      } catch (error) {
        throw handleError(error);
      }
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
    getRecentErrors: () => errorHandler.getRecentErrors(),
    clearErrors: () => errorHandler.clearErrors(),
  };
}

// Toast notification component for errors
export function ErrorToast({
  error,
  onClose,
}: {
  error: AppError;
  onClose: () => void;
}) {
  const getToastStyles = () => {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case ErrorType.NETWORK:
      case ErrorType.SERVER:
        return "bg-red-50 border-red-200 text-red-800";
      case ErrorType.VALIDATION:
        return "bg-orange-50 border-orange-200 text-orange-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 p-4 border rounded-lg shadow-lg z-50 max-w-md ${getToastStyles()}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold mb-1">
            {error.type.charAt(0) + error.type.slice(1).toLowerCase()} Error
          </h4>
          <p className="text-sm">{error.message}</p>
          {error.details && (
            <details className="mt-2">
              <summary className="text-xs cursor-pointer">
                Technical Details
              </summary>
              <pre className="text-xs mt-1 bg-black bg-opacity-10 p-2 rounded overflow-auto">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-lg leading-none hover:bg-black hover:bg-opacity-10 rounded px-2 py-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// React Error Boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: AppError; reset: () => void }>;
  }>,
  ErrorBoundaryState
> {
  constructor(
    props: React.PropsWithChildren<{
      fallback?: React.ComponentType<{ error: AppError; reset: () => void }>;
    }>
  ) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = classifyError(error);
    return {
      hasError: true,
      error: appError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorHandler = ErrorHandler.getInstance();
    errorHandler.handleError(
      {
        ...error,
        details: errorInfo,
      },
      true
    );
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({
  error,
  reset,
}: {
  error: AppError;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go to homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error toast provider context
const ErrorToastContext = React.createContext<{
  showError: (error: AppError) => void;
  hideError: () => void;
}>({
  showError: () => {},
  hideError: () => {},
});

export function ErrorToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentError, setCurrentError] = React.useState<AppError | null>(null);

  const showError = React.useCallback((error: AppError) => {
    setCurrentError(error);
    // Auto-hide after 5 seconds
    setTimeout(() => setCurrentError(null), 5000);
  }, []);

  const hideError = React.useCallback(() => {
    setCurrentError(null);
  }, []);

  // Listen for custom error events
  React.useEffect(() => {
    const handleAppError = (event: CustomEvent) => {
      showError(event.detail);
    };

    window.addEventListener("app-error", handleAppError as EventListener);
    return () =>
      window.removeEventListener("app-error", handleAppError as EventListener);
  }, [showError]);

  return (
    <ErrorToastContext.Provider value={{ showError, hideError }}>
      {children}
      {currentError && <ErrorToast error={currentError} onClose={hideError} />}
    </ErrorToastContext.Provider>
  );
}

export function useErrorToast() {
  return React.useContext(ErrorToastContext);
}
