// Enhanced logging and monitoring utilities for the API

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  endpoint?: string;
  method?: string;
  responseTime?: number;
  statusCode?: number;
  userAgent?: string;
  ip?: string;
  traceId?: string;
}

export interface Metrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  cacheHitRate: number;
  activeUsers: number;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private createLogEntry(
    level: LogEntry["level"],
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      traceId: this.generateTraceId(),
    };
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry("info", message, context);
    this.addLog(entry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry("warn", message, context);
    this.addLog(entry);
  }

  error(message: string, context?: Record<string, unknown>): void {
    const entry = this.createLogEntry("error", message, context);
    this.addLog(entry);
    // In production, send to error tracking service (Sentry, Bugsnag, etc.)
    this.sendToErrorService(entry);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "development") {
      const entry = this.createLogEntry("debug", message, context);
      this.addLog(entry);
    }
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[${entry.level.toUpperCase()}] ${entry.message}`,
        entry.context
      );
    }
  }

  private sendToErrorService(entry: LogEntry): void {
    // In production, integrate with error tracking services
    if (process.env.NODE_ENV === "production") {
      // Example: Sentry.captureException(new Error(entry.message), { extra: entry.context });
      console.error("Production Error:", entry);
    }
  }

  getLogs(level?: LogEntry["level"], limit = 100): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = this.logs.filter((log) => log.level === level);
    }

    return filteredLogs.slice(-limit);
  }

  getMetrics(): Metrics {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentLogs = this.logs.filter(
      (log) => new Date(log.timestamp).getTime() > oneHourAgo
    );

    const requestLogs = recentLogs.filter(
      (log) => log.responseTime !== undefined
    );
    const errorLogs = recentLogs.filter((log) => log.level === "error");

    const responseTimes = requestLogs
      .map((log) => log.responseTime!)
      .filter((time) => time !== undefined);

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;

    const sortedResponseTimes = responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sortedResponseTimes.length * 0.95);
    const p95ResponseTime = sortedResponseTimes[p95Index] || 0;

    return {
      requestCount: requestLogs.length,
      errorCount: errorLogs.length,
      averageResponseTime: Math.round(averageResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      cacheHitRate: 0.85, // Mock value - would be calculated from cache stats
      activeUsers: 0, // Mock value - would be calculated from active sessions
    };
  }
}

// Singleton logger instance
export const logger = new Logger();

// Monitoring and alerting
class Monitor {
  private metrics: Record<string, number> = {};
  private alerts: Array<{
    message: string;
    timestamp: string;
    severity: "low" | "medium" | "high";
  }> = [];

  recordMetric(name: string, value: number): void {
    this.metrics[name] = value;
    this.checkThresholds(name, value);
  }

  incrementCounter(name: string): void {
    this.metrics[name] = (this.metrics[name] || 0) + 1;
  }

  recordResponseTime(endpoint: string, time: number): void {
    const metricName = `response_time_${endpoint}`;
    this.recordMetric(metricName, time);

    // Alert if response time is too high
    if (time > 1000) {
      // 1 second threshold
      this.addAlert(
        `High response time detected: ${endpoint} took ${time}ms`,
        "medium"
      );
    }
  }

  recordError(endpoint: string, error: string): void {
    this.incrementCounter(`errors_${endpoint}`);
    this.addAlert(`Error in ${endpoint}: ${error}`, "high");
  }

  private checkThresholds(name: string, value: number): void {
    // Define alerting thresholds
    const thresholds = {
      error_rate: { threshold: 0.05, message: "Error rate exceeded 5%" }, // 5% error rate
      response_time: {
        threshold: 500,
        message: "Average response time exceeded 500ms",
      },
      cache_miss_rate: {
        threshold: 0.2,
        message: "Cache miss rate exceeded 20%",
      },
    };

    const config = thresholds[name as keyof typeof thresholds];
    if (config && value > config.threshold) {
      this.addAlert(`${config.message}: ${value}`, "high");
    }
  }

  private addAlert(message: string, severity: "low" | "medium" | "high"): void {
    const alert = {
      message,
      severity,
      timestamp: new Date().toISOString(),
    };

    this.alerts.push(alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // In production, send alerts to monitoring service
    if (process.env.NODE_ENV === "production") {
      this.sendAlert(alert);
    }

    logger.warn(`Alert: ${message}`, { severity });
  }

  private sendAlert(alert: {
    message: string;
    severity: string;
    timestamp: string;
  }): void {
    // In production, integrate with alerting services (PagerDuty, Slack, etc.)
    console.warn("Production Alert:", alert);
  }

  getMetrics(): Record<string, number> {
    return { ...this.metrics };
  }

  getAlerts(severity?: "low" | "medium" | "high"): typeof this.alerts {
    if (severity) {
      return this.alerts.filter((alert) => alert.severity === severity);
    }
    return [...this.alerts];
  }

  getHealthStatus(): "healthy" | "degraded" | "unhealthy" {
    const recentAlerts = this.alerts.filter(
      (alert) =>
        new Date(alert.timestamp).getTime() > Date.now() - 5 * 60 * 1000 // Last 5 minutes
    );

    const highSeverityAlerts = recentAlerts.filter(
      (alert) => alert.severity === "high"
    );
    const mediumSeverityAlerts = recentAlerts.filter(
      (alert) => alert.severity === "medium"
    );

    if (highSeverityAlerts.length > 0) {
      return "unhealthy";
    }

    if (mediumSeverityAlerts.length > 3) {
      return "degraded";
    }

    return "healthy";
  }
}

// Singleton monitor instance
export const monitor = new Monitor();

// Performance monitoring utilities
export class PerformanceTracker {
  private static timers: Map<string, number> = new Map();

  static startTimer(label: string): void {
    this.timers.set(label, Date.now());
  }

  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      logger.warn(`Timer '${label}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);

    monitor.recordResponseTime(label, duration);
    logger.debug(`Performance: ${label} took ${duration}ms`);

    return duration;
  }

  static async measureAsync<T>(
    label: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.startTimer(label);
    try {
      const result = await operation();
      return result;
    } finally {
      this.endTimer(label);
    }
  }
}

// Request middleware wrapper for automatic logging
export function withLogging<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) {
  return async (...args: T): Promise<R> => {
    const traceId = `trace_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    logger.info(`Starting ${operationName}`, { traceId, args: args.length });

    return PerformanceTracker.measureAsync(operationName, async () => {
      try {
        const result = await fn(...args);
        logger.info(`Completed ${operationName}`, { traceId });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error(`Failed ${operationName}`, {
          traceId,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        });
        monitor.recordError(operationName, errorMessage);
        throw error;
      }
    });
  };
}

// Export configured monitoring tools
export { logger as apiLogger, monitor as apiMonitor };
