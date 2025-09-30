import { NextRequest } from 'next/server'
import { APIResponseBuilder } from '../../../../lib/utils/api-wrapper'
import { errorMonitor } from '../../../../lib/utils/error-monitoring'
import { logger } from '../../../../lib/utils/logger'
import { prisma } from '../../../../lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check database connectivity
    const dbHealthy = await checkDatabase()
    
    // Get error monitoring status
    const errorStatus = errorMonitor.getHealthStatus()
    
    // Check external services (if any)
    const externalServices = await checkExternalServices()
    
    const duration = Date.now() - startTime
    
    const health = {
      status: 'healthy' as 'healthy' | 'warning' | 'critical',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
      checks: {
        database: {
          status: dbHealthy ? 'healthy' : 'critical',
          responseTime: duration
        },
        errorMonitoring: {
          status: errorStatus.status,
          metrics: errorStatus.metrics,
          activeAlerts: errorStatus.activeAlerts
        },
        externalServices
      }
    }
    
    // Determine overall status
    if (!dbHealthy || errorStatus.status === 'critical') {
      health.status = 'critical'
    } else if (errorStatus.status === 'warning' || Object.values(externalServices).some(s => s.status === 'warning')) {
      health.status = 'warning'
    }
    
    // Log health check
    logger.info('Health check performed', {
      status: health.status,
      duration,
      dbHealthy,
      errorRate: errorStatus.metrics.errorRate
    })
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'warning' ? 200 : 503
    
    return APIResponseBuilder.success(health, statusCode)
    
  } catch (error) {
    logger.error('Health check failed', error as Error)
    
    return APIResponseBuilder.error(
      'HEALTH_CHECK_FAILED',
      'Health check could not be completed',
      503,
      process.env.NODE_ENV === 'development' ? error : undefined
    )
  }
}

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    logger.error('Database health check failed', error as Error)
    return false
  }
}

async function checkExternalServices(): Promise<Record<string, { status: string; responseTime?: number }>> {
  const services: Record<string, { status: string; responseTime?: number }> = {}
  
  // Check Google APIs (if configured)
  if (process.env.GOOGLE_CLIENT_ID) {
    services.googleApis = await checkService('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=invalid', 'Google APIs')
  }
  
  // Check Meta APIs (if configured)
  if (process.env.FACEBOOK_CLIENT_ID) {
    services.metaApis = await checkService('https://graph.facebook.com/v18.0/me?access_token=invalid', 'Meta APIs')
  }
  
  // Check LinkedIn APIs (if configured)
  if (process.env.LINKEDIN_CLIENT_ID) {
    services.linkedinApis = await checkService('https://api.linkedin.com/v2/me', 'LinkedIn APIs')
  }
  
  return services
}

async function checkService(url: string, name: string): Promise<{ status: string; responseTime?: number }> {
  const startTime = Date.now()
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    const responseTime = Date.now() - startTime
    
    // For external APIs, we expect 401 (unauthorized) as a healthy response
    // since we're not sending valid credentials
    const isHealthy = response.status === 401 || (response.status >= 200 && response.status < 500)
    
    return {
      status: isHealthy ? 'healthy' : 'warning',
      responseTime
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    logger.warn(`External service check failed: ${name}`, {
      service: name,
      url,
      error: (error as Error).message,
      responseTime
    })
    
    return {
      status: 'warning',
      responseTime
    }
  }
}