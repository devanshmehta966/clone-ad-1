# Error Handling and Logging System

This document describes the comprehensive error handling and logging system implemented for the Next.js marketing dashboard application.

## Overview

The error handling system provides:
- Standardized error responses across all API routes
- Comprehensive logging with structured output
- React error boundaries for frontend error catching
- User-friendly error messages and recovery suggestions
- Error monitoring and alerting
- Health checks with error metrics

## Architecture

### Core Components

1. **Logger** (`lib/utils/logger.ts`)
   - Structured logging with configurable levels
   - API request/response logging
   - Security event logging
   - OAuth flow logging
   - Database operation logging

2. **Error Handler** (`lib/utils/error-handler.ts`)
   - Centralized error handling for API routes
   - Automatic error type detection and mapping
   - Prisma error handling
   - Validation error handling

3. **Error Messages** (`lib/utils/error-messages.ts`)
   - User-friendly error messages
   - Error categorization
   - Suggested actions for recovery
   - Internationalization support

4. **Error Monitoring** (`lib/utils/error-monitoring.ts`)
   - Real-time error tracking
   - Alert rules and notifications
   - Error rate monitoring
   - Health status reporting

5. **API Wrapper** (`lib/utils/api-wrapper.ts`)
   - Route handler wrapper with error handling
   - Request/response logging
   - Rate limiting integration
   - Security headers

## Usage

### API Routes

Use the `createRouteHandler` wrapper for all API routes:

```typescript
import { createRouteHandler, APIResponseBuilder } from '@/lib/utils/api-wrapper'

export const GET = createRouteHandler(
  async (request, { session }) => {
    // Your route logic here
    const data = await someService.getData(session.user.id)
    return APIResponseBuilder.success(data)
  },
  {
    requireAuth: true,
    logRequests: true,
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100
    }
  }
)
```

### Error Handling in Controllers

Update your controllers to use the new error handling:

```typescript
import { ErrorHandler } from '@/lib/utils/error-handler'
import { logger } from '@/lib/utils/logger'

export class MyController extends BaseController {
  async getData(request: NextRequest, userId: string) {
    return this.handleRequest(async () => {
      // Validate input
      if (!userId) {
        throw ErrorHandler.validationError('User ID is required')
      }
      
      // Business logic
      const data = await this.service.getData(userId)
      
      if (!data) {
        throw ErrorHandler.notFoundError('Data')
      }
      
      return data
    }, request, { userId })
  }
}
```

### React Error Boundaries

Wrap components with error boundaries:

```typescript
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

export default function MyPage() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  )
}
```

### Error Handling in React Components

Use the error handler hook:

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler'

export function MyComponent() {
  const { handleError } = useErrorHandler()
  
  const handleSubmit = async () => {
    try {
      await api.submitData()
    } catch (error) {
      handleError(error, () => handleSubmit()) // Retry function
    }
  }
}
```

### Toast Notifications

Show error toasts for user feedback:

```typescript
import { showErrorToast, showSuccessToast } from '@/components/error/ErrorToast'

// Show error with retry option
showErrorToast(
  { code: 'SYNC_FAILED', message: 'Failed to sync data' },
  { onRetry: () => retrySync() }
)

// Show success message
showSuccessToast('Data saved successfully')
```

## Error Types and Codes

### Authentication Errors
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permissions
- `INVALID_CREDENTIALS` - Wrong email/password
- `TOKEN_EXPIRED` - Session expired
- `INVALID_TOKEN` - Invalid auth token

### Validation Errors
- `VALIDATION_ERROR` - Input validation failed
- `INVALID_INPUT` - Invalid data format
- `MISSING_REQUIRED_FIELD` - Required field missing

### Resource Errors
- `NOT_FOUND` - Resource not found
- `USER_NOT_FOUND` - User not found
- `CLIENT_NOT_FOUND` - Client not found
- `REPORT_NOT_FOUND` - Report not found
- `INTEGRATION_NOT_FOUND` - Integration not found

### Conflict Errors
- `ALREADY_EXISTS` - Resource already exists
- `USER_EXISTS` - User already exists
- `CLIENT_EXISTS` - Client already exists
- `EMAIL_CONFLICT` - Email already in use

### Business Logic Errors
- `INTEGRATION_INACTIVE` - Integration not active
- `SYNC_FAILED` - Data sync failed
- `INVALID_STATE` - Invalid request state
- `EXPIRED_STATE` - Request expired

### Rate Limiting Errors
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `TOO_MANY_REQUESTS` - Too many requests

### Server Errors
- `INTERNAL_ERROR` - Internal server error
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_API_ERROR` - External API error
- `SERVICE_UNAVAILABLE` - Service unavailable

## Logging

### Log Levels
- `ERROR` - Error conditions
- `WARN` - Warning conditions
- `INFO` - Informational messages
- `DEBUG` - Debug messages

### Log Format

Development (pretty print):
```
[2024-01-15T10:30:00.000Z] INFO: API Request: GET /api/dashboard/metrics [{"userId":"user123","method":"GET","endpoint":"/api/dashboard/metrics"}]
```

Production (structured JSON):
```json
{
  "level": "info",
  "message": "API Request: GET /api/dashboard/metrics",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "context": {
    "userId": "user123",
    "method": "GET",
    "endpoint": "/api/dashboard/metrics"
  }
}
```

### Environment Variables

Configure logging with environment variables:

```env
LOG_LEVEL=info                    # Log level (error, warn, info, debug)
NODE_ENV=production              # Environment (affects log format)
```

## Error Monitoring

### Metrics Tracked
- Error count and rate
- Errors by code and endpoint
- Request success/failure ratio
- Response times

### Alert Rules
- High error rate (>10%)
- Authentication issues (>10 auth errors)
- Database errors (>5 db errors)
- External API errors (>3 api errors)

### Health Check

Check application health at `/api/health`:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "uptime": 3600,
    "version": "1.0.0",
    "environment": "production",
    "checks": {
      "database": {
        "status": "healthy",
        "responseTime": 15
      },
      "errorMonitoring": {
        "status": "healthy",
        "metrics": {
          "errorCount": 0,
          "errorRate": 0,
          "errorsByCode": {},
          "errorsByEndpoint": {}
        },
        "activeAlerts": []
      },
      "externalServices": {
        "googleApis": {
          "status": "healthy",
          "responseTime": 120
        }
      }
    }
  }
}
```

## Production Setup

### Error Reporting

Configure error reporting services:

```env
# Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Email alerts
ALERT_EMAIL=alerts@yourcompany.com

# Monitoring service
MONITORING_API_KEY=your-monitoring-api-key
```

### Log Aggregation

For production, consider using log aggregation services:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Splunk
- DataDog
- New Relic
- CloudWatch (AWS)

### Error Tracking

Integrate with error tracking services:
- Sentry
- Bugsnag
- Rollbar
- Airbrake

## Testing

### Error Scenarios

Test common error scenarios:

```typescript
// Test validation errors
expect(() => validateInput(invalidData)).toThrow(ValidationError)

// Test not found errors
const result = await api.getUser('nonexistent')
expect(result.error.code).toBe('USER_NOT_FOUND')

// Test rate limiting
for (let i = 0; i < 101; i++) {
  await api.makeRequest()
}
expect(lastResponse.status).toBe(429)
```

### Error Boundary Testing

Test React error boundaries:

```typescript
import { render } from '@testing-library/react'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

const ThrowError = () => {
  throw new Error('Test error')
}

test('error boundary catches errors', () => {
  const { getByText } = render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  )
  
  expect(getByText('Something went wrong')).toBeInTheDocument()
})
```

## Best Practices

### Error Handling
1. Always use structured error responses
2. Log errors with appropriate context
3. Provide user-friendly error messages
4. Include recovery suggestions when possible
5. Never expose sensitive information in errors

### Logging
1. Use appropriate log levels
2. Include relevant context in logs
3. Avoid logging sensitive data
4. Use structured logging in production
5. Monitor log volume and performance

### Monitoring
1. Set up alerts for critical errors
2. Monitor error rates and trends
3. Track error resolution times
4. Review error patterns regularly
5. Use health checks for system monitoring

### Security
1. Sanitize error messages for external users
2. Log security events appropriately
3. Implement rate limiting on error-prone endpoints
4. Monitor for suspicious error patterns
5. Use secure error reporting channels

## Troubleshooting

### Common Issues

1. **High Error Rates**
   - Check external service status
   - Review recent deployments
   - Examine error patterns by endpoint
   - Check database connectivity

2. **Missing Logs**
   - Verify LOG_LEVEL configuration
   - Check log output destination
   - Ensure logger is properly initialized
   - Review log rotation settings

3. **Alert Fatigue**
   - Adjust alert thresholds
   - Implement alert cooldowns
   - Group related alerts
   - Review alert relevance

4. **Performance Impact**
   - Monitor logging overhead
   - Use async logging where possible
   - Implement log sampling for high-volume endpoints
   - Review log retention policies

### Debugging

Enable debug logging:
```env
LOG_LEVEL=debug
```

Check error monitoring status:
```bash
curl http://localhost:3000/api/health
```

Review error patterns:
```javascript
// In browser console
fetch('/api/health')
  .then(r => r.json())
  .then(data => console.log(data.data.checks.errorMonitoring))
```