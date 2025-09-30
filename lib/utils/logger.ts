import { APIError } from '../types/api'

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  userId?: string
  requestId?: string
  endpoint?: string
  method?: string
  userAgent?: string
  ip?: string
  duration?: number
  [key: string]: any
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
    status?: number
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logLevel = process.env.LOG_LEVEL || (this.isDevelopment ? 'debug' : 'info')

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG]
    const currentLevelIndex = levels.indexOf(this.logLevel as LogLevel)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex <= currentLevelIndex
  }

  private formatLogEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      }

      if (error instanceof APIError) {
        entry.error.code = error.code
        entry.error.status = error.status
      }
    }

    return entry
  }

  private output(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Pretty print for development
      const contextStr = entry.context ? ` [${JSON.stringify(entry.context)}]` : ''
      const errorStr = entry.error ? ` - ${entry.error.name}: ${entry.error.message}` : ''
      
      console.log(`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}${errorStr}`)
      
      if (entry.error?.stack && entry.level === LogLevel.ERROR) {
        console.error(entry.error.stack)
      }
    } else {
      // Structured JSON for production
      console.log(JSON.stringify(entry))
    }
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    
    const entry = this.formatLogEntry(LogLevel.ERROR, message, context, error)
    this.output(entry)
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    
    const entry = this.formatLogEntry(LogLevel.WARN, message, context)
    this.output(entry)
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    
    const entry = this.formatLogEntry(LogLevel.INFO, message, context)
    this.output(entry)
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    
    const entry = this.formatLogEntry(LogLevel.DEBUG, message, context)
    this.output(entry)
  }

  // API-specific logging methods
  apiRequest(method: string, endpoint: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${endpoint}`, {
      ...context,
      method,
      endpoint
    })
  }

  apiResponse(method: string, endpoint: string, status: number, duration: number, context?: LogContext): void {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.INFO
    const message = `API Response: ${method} ${endpoint} - ${status} (${duration}ms)`
    
    if (level === LogLevel.WARN) {
      this.warn(message, { ...context, method, endpoint, status, duration })
    } else {
      this.info(message, { ...context, method, endpoint, status, duration })
    }
  }

  apiError(method: string, endpoint: string, error: Error, context?: LogContext): void {
    this.error(`API Error: ${method} ${endpoint}`, error, {
      ...context,
      method,
      endpoint
    })
  }

  // Database logging
  dbQuery(query: string, duration?: number, context?: LogContext): void {
    this.debug(`Database Query: ${query}`, {
      ...context,
      query,
      duration
    })
  }

  dbError(query: string, error: Error, context?: LogContext): void {
    this.error(`Database Error: ${query}`, error, {
      ...context,
      query
    })
  }

  // OAuth logging
  oauthStart(provider: string, userId: string): void {
    this.info(`OAuth flow started for ${provider}`, {
      provider,
      userId,
      action: 'oauth_start'
    })
  }

  oauthCallback(provider: string, success: boolean, userId?: string, error?: Error): void {
    if (success) {
      this.info(`OAuth callback successful for ${provider}`, {
        provider,
        userId,
        action: 'oauth_callback_success'
      })
    } else {
      this.error(`OAuth callback failed for ${provider}`, error, {
        provider,
        userId,
        action: 'oauth_callback_error'
      })
    }
  }

  // Security logging
  securityEvent(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      securityEvent: event
    })
  }

  rateLimitExceeded(endpoint: string, ip: string, context?: LogContext): void {
    this.warn(`Rate limit exceeded for ${endpoint}`, {
      ...context,
      endpoint,
      ip,
      securityEvent: 'rate_limit_exceeded'
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Types are already exported above