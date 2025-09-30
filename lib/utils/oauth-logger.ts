interface LogContext {
  userId?: string
  integrationId?: string
  provider?: string
  operation?: string
  [key: string]: any
}

export class OAuthLogger {
  private static formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level}] [OAuth] ${message}${contextStr}`
  }

  static info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('INFO', message, context))
  }

  static warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('WARN', message, context))
  }

  static error(message: string, error?: any, context?: LogContext): void {
    const errorDetails = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : error
    
    const fullContext = { ...context, error: errorDetails }
    console.error(this.formatMessage('ERROR', message, fullContext))
  }

  static debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, context))
    }
  }

  static logOAuthFlow(
    operation: 'initiate' | 'callback' | 'refresh' | 'revoke' | 'health_check',
    provider: string,
    userId?: string,
    integrationId?: string,
    additionalContext?: Record<string, any>
  ): void {
    this.info(`OAuth ${operation} started`, {
      operation,
      provider,
      userId,
      integrationId,
      ...additionalContext
    })
  }

  static logOAuthSuccess(
    operation: 'initiate' | 'callback' | 'refresh' | 'revoke' | 'health_check',
    provider: string,
    userId?: string,
    integrationId?: string,
    additionalContext?: Record<string, any>
  ): void {
    this.info(`OAuth ${operation} completed successfully`, {
      operation,
      provider,
      userId,
      integrationId,
      ...additionalContext
    })
  }

  static logOAuthError(
    operation: 'initiate' | 'callback' | 'refresh' | 'revoke' | 'health_check',
    provider: string,
    error: any,
    userId?: string,
    integrationId?: string,
    additionalContext?: Record<string, any>
  ): void {
    this.error(`OAuth ${operation} failed`, error, {
      operation,
      provider,
      userId,
      integrationId,
      ...additionalContext
    })
  }

  static logTokenEvent(
    event: 'issued' | 'refreshed' | 'expired' | 'revoked' | 'invalid',
    provider: string,
    integrationId: string,
    additionalContext?: Record<string, any>
  ): void {
    this.info(`Token ${event}`, {
      event: 'token_' + event,
      provider,
      integrationId,
      ...additionalContext
    })
  }

  static logSyncEvent(
    event: 'started' | 'completed' | 'failed' | 'skipped',
    provider: string,
    integrationId: string,
    additionalContext?: Record<string, any>
  ): void {
    this.info(`Sync ${event}`, {
      event: 'sync_' + event,
      provider,
      integrationId,
      ...additionalContext
    })
  }

  static logSecurityEvent(
    event: 'rate_limit_exceeded' | 'invalid_state' | 'token_theft_attempt' | 'suspicious_activity',
    details: Record<string, any>
  ): void {
    this.warn(`Security event: ${event}`, {
      event: 'security_' + event,
      ...details
    })
  }
}