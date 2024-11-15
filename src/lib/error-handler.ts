type ErrorLevel = 'error' | 'warning' | 'info';

interface ErrorLog {
  message: string;
  level: ErrorLevel;
  timestamp: number;
  context?: Record<string, unknown>;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private logs: ErrorLog[] = [];
  private readonly maxLogs = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  log(message: string, level: ErrorLevel = 'error', context?: Record<string, unknown>) {
    const errorLog: ErrorLog = {
      message,
      level,
      timestamp: Date.now(),
      context,
    };

    this.logs.push(errorLog);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'error' ? console.error : level === 'warning' ? console.warn : console.info;
      consoleMethod(`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const errorHandler = ErrorHandler.getInstance();

export function logError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  errorHandler.log(message, 'error', context);
}

export function logWarning(message: string, context?: Record<string, unknown>) {
  errorHandler.log(message, 'warning', context);
}

export function logInfo(message: string, context?: Record<string, unknown>) {
  errorHandler.log(message, 'info', context);
}
