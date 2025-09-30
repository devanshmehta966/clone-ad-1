import { logger } from './logger'
import { APIError } from '../types/api'

interface ErrorMetrics {
  errorCount: number
  errorRate: number
  lastError?: Date
  errorsByCode: Record<string, number>
  errorsByEndpoint: Record<string, number>
}

interface AlertRule {
  id: string
  name: string
  condition: (metrics: ErrorMetrics) => boolean
  message: string
  cooldownMs: number
  lastTriggered?: Date
}

class ErrorMonitor {
  private metrics: ErrorMetrics = {
    errorCount: 0,
    errorRate: 0,
    errorsByCode: {},
    errorsByEndpoint: {}
  }

  private requestCount = 0
  private windowStart = Date.now()
  private readonly windowMs = 60000 // 1 minute window
  
  private alertRules: AlertRule[] = [
    {
      id: 'high_error_rate',
      name: 'High Error Rate',
      condition: (metrics) => metrics.errorRate > 0.1, // 10% error rate
      message: 'Error rate exceeded 10% in the last minute',
      cooldownMs: 300000 // 5 minutes
    },
    {
      id: 'many_auth_errors',
      name: 'Authentication Issues',
      condition: (metrics) => (metrics.errorsByCode['UNAUTHORIZED'] || 0) > 10,
      message: 'High number of authentication errors detected',
      cooldownMs: 600000 // 10 minutes
    },
    {
      id: 'database_errors',
      name: 'Database Issues',
      condition: (metrics) => (metrics.errorsByCode['DATABASE_ERROR'] || 0) > 5,
      message: 'Multiple database errors detected',
      cooldownMs: 300000 // 5 minutes
    },
    {
      id: 'external_api_errors',
      name: 'External API Issues',
      condition: (metrics) => (metrics.errorsByCode['EXTERNAL_API_ERROR'] || 0) > 3,
      message: 'External API integration errors detected',
      cooldownMs: 600000 // 10 minutes
    }
  ]

  /**
   * Record a successful request
   */
  recordRequest(): void {
    this.requestCount++
    this.updateMetrics()
  }

  /**
   * Record an error
   */
  recordError(error: APIError, endpoint?: string): void {
    this.metrics.errorCount++
    this.metrics.lastError = new Date()
    
    // Track by error code
    this.metrics.errorsByCode[error.code] = (this.metrics.errorsByCode[error.code] || 0) + 1
    
    // Track by endpoint
    if (endpoint) {
      this.metrics.errorsByEndpoint[endpoint] = (this.metrics.errorsByEndpoint[endpoint] || 0) + 1
    }
    
    this.requestCount++
    this.updateMetrics()
    this.checkAlerts()
    
    // Log error for monitoring
    logger.error('Error recorded by monitor', error, {
      endpoint,
      errorCode: error.code,
      currentErrorRate: this.metrics.errorRate
    })
  }

  /**
   * Update metrics and reset window if needed
   */
  private updateMetrics(): void {
    const now = Date.now()
    
    // Reset window if needed
    if (now - this.windowStart > this.windowMs) {
      this.resetWindow()
      return
    }
    
    // Calculate error rate
    this.metrics.errorRate = this.requestCount > 0 ? this.metrics.errorCount / this.requestCount : 0
  }

  /**
   * Reset the monitoring window
   */
  private resetWindow(): void {
    this.metrics = {
      errorCount: 0,
      errorRate: 0,
      lastError: this.metrics.lastError,
      errorsByCode: {},
      errorsByEndpoint: {}
    }
    this.requestCount = 0
    this.windowStart = Date.now()
  }

  /**
   * Check alert rules and trigger if needed
   */
  private checkAlerts(): void {
    const now = Date.now()
    
    for (const rule of this.alertRules) {
      // Skip if in cooldown period
      if (rule.lastTriggered && (now - rule.lastTriggered.getTime()) < rule.cooldownMs) {
        continue
      }
      
      // Check condition
      if (rule.condition(this.metrics)) {
        this.triggerAlert(rule)
        rule.lastTriggered = new Date()
      }
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(rule: AlertRule): void {
    logger.warn(`ALERT: ${rule.name}`, {
      alertId: rule.id,
      message: rule.message,
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    })
    
    // In production, you would send this to your alerting system
    // Examples:
    // - Send to Slack webhook
    // - Send email notification
    // - Send to PagerDuty
    // - Send to monitoring service (DataDog, New Relic, etc.)
    
    if (process.env.NODE_ENV === 'production') {
      this.sendProductionAlert(rule)
    }
  }

  /**
   * Send alert to production monitoring systems
   */
  private async sendProductionAlert(rule: AlertRule): Promise<void> {
    try {
      // Example: Send to Slack
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackAlert(rule)
      }
      
      // Example: Send email
      if (process.env.ALERT_EMAIL) {
        await this.sendEmailAlert(rule)
      }
      
      // Example: Send to monitoring service
      if (process.env.MONITORING_API_KEY) {
        await this.sendMonitoringAlert(rule)
      }
    } catch (error) {
      logger.error('Failed to send production alert', error as Error, {
        alertId: rule.id,
        alertName: rule.name
      })
    }
  }

  /**
   * Send alert to Slack
   */
  private async sendSlackAlert(rule: AlertRule): Promise<void> {
    const webhook = process.env.SLACK_WEBHOOK_URL
    if (!webhook) return
    
    const payload = {
      text: `🚨 ${rule.name}`,
      attachments: [
        {
          color: 'danger',
          fields: [
            {
              title: 'Alert',
              value: rule.message,
              short: false
            },
            {
              title: 'Error Rate',
              value: `${(this.metrics.errorRate * 100).toFixed(2)}%`,
              short: true
            },
            {
              title: 'Error Count',
              value: this.metrics.errorCount.toString(),
              short: true
            },
            {
              title: 'Time',
              value: new Date().toISOString(),
              short: true
            }
          ]
        }
      ]
    }
    
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(rule: AlertRule): Promise<void> {
    // Implementation would depend on your email service
    // This is a placeholder for the email sending logic
    logger.info('Email alert would be sent', {
      to: process.env.ALERT_EMAIL,
      subject: `Alert: ${rule.name}`,
      message: rule.message
    })
  }

  /**
   * Send to monitoring service
   */
  private async sendMonitoringAlert(rule: AlertRule): Promise<void> {
    // Implementation would depend on your monitoring service
    // Examples: DataDog, New Relic, Sentry, etc.
    logger.info('Monitoring service alert would be sent', {
      service: 'monitoring',
      alertId: rule.id,
      metrics: this.metrics
    })
  }

  /**
   * Get current metrics
   */
  getMetrics(): ErrorMetrics {
    return { ...this.metrics }
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule)
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): void {
    this.alertRules = this.alertRules.filter(rule => rule.id !== ruleId)
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical'
    metrics: ErrorMetrics
    activeAlerts: string[]
  } {
    const now = Date.now()
    const activeAlerts = this.alertRules
      .filter(rule => rule.lastTriggered && (now - rule.lastTriggered.getTime()) < rule.cooldownMs)
      .map(rule => rule.name)
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    
    if (this.metrics.errorRate > 0.2) {
      status = 'critical'
    } else if (this.metrics.errorRate > 0.05 || activeAlerts.length > 0) {
      status = 'warning'
    }
    
    return {
      status,
      metrics: this.getMetrics(),
      activeAlerts
    }
  }
}

// Export singleton instance
export const errorMonitor = new ErrorMonitor()

// Export types
export type { ErrorMetrics, AlertRule }