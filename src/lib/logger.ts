type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>, userId?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId,
      requestId: this.getRequestId(),
    };
  }

  private getRequestId(): string | undefined {
    // In a real app, this would be from AsyncLocalStorage or similar
    // For now, we'll use a simple random ID
    return Math.random().toString(36).substring(2, 15);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, userId?: string): void {
    // Don't log in test environment unless explicitly enabled
    if (this.isTest && !process.env.ENABLE_TEST_LOGGING) {
      return;
    }

    const logEntry = this.formatMessage(level, message, context, userId);

    if (this.isDevelopment) {
      // Pretty printing for development
      const contextStr = context ? ` | Context: ${JSON.stringify(context, null, 2)}` : '';
      const userStr = userId ? ` | User: ${userId}` : '';
      console.log(`[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}${userStr}${contextStr}`);
    } else {
      // JSON format for production (easier for log aggregation)
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, context?: Record<string, any>, userId?: string): void {
    if (this.isDevelopment) {
      this.log('debug', message, context, userId);
    }
  }

  info(message: string, context?: Record<string, any>, userId?: string): void {
    this.log('info', message, context, userId);
  }

  warn(message: string, context?: Record<string, any>, userId?: string): void {
    this.log('warn', message, context, userId);
  }

  error(message: string, context?: Record<string, any>, userId?: string): void {
    this.log('error', message, context, userId);
  }

  // Audit specific methods
  audit(action: string, details: Record<string, any>, userId?: string): void {
    this.info(`AUDIT: ${action}`, { 
      ...details, 
      isAudit: true 
    }, userId);
  }

  // Auth specific methods
  authSuccess(action: string, userId: string, details?: Record<string, any>): void {
    this.info(`AUTH_SUCCESS: ${action}`, {
      ...details,
      isAuth: true,
      success: true
    }, userId);
  }

  authFailure(action: string, email?: string, reason?: string, details?: Record<string, any>): void {
    this.warn(`AUTH_FAILURE: ${action}`, {
      email,
      reason,
      ...details,
      isAuth: true,
      success: false
    });
  }

  // API specific methods
  apiRequest(method: string, path: string, userId?: string, duration?: number): void {
    this.info(`API_REQUEST: ${method} ${path}`, {
      method,
      path,
      duration,
      isAPI: true
    }, userId);
  }

  apiError(method: string, path: string, error: Error, userId?: string): void {
    this.error(`API_ERROR: ${method} ${path}`, {
      method,
      path,
      error: error.message,
      stack: error.stack,
      isAPI: true
    }, userId);
  }

  // Database specific methods
  dbQuery(query: string, duration?: number, userId?: string): void {
    this.debug(`DB_QUERY: ${query}`, {
      query,
      duration,
      isDB: true
    }, userId);
  }

  dbError(query: string, error: Error, userId?: string): void {
    this.error(`DB_ERROR: ${query}`, {
      query,
      error: error.message,
      stack: error.stack,
      isDB: true
    }, userId);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogEntry };

// Utility function for API route logging
export function withLogging<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    const start = Date.now();
    try {
      logger.debug(`Starting ${name}`, { args: args.length });
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result
          .then((res) => {
            logger.debug(`Completed ${name}`, { duration: Date.now() - start });
            return res;
          })
          .catch((error) => {
            logger.error(`Failed ${name}`, { 
              error: error.message,
              duration: Date.now() - start 
            });
            throw error;
          });
      }
      
      logger.debug(`Completed ${name}`, { duration: Date.now() - start });
      return result;
    } catch (error) {
      logger.error(`Failed ${name}`, { 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - start 
      });
      throw error;
    }
  }) as T;
}