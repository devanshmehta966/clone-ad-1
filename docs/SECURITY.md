# Security Implementation Guide

This document outlines the comprehensive security measures implemented in the Next.js Marketing Dashboard application.

## Table of Contents

1. [Environment Security](#environment-security)
2. [Authentication & Authorization](#authentication--authorization)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [Rate Limiting](#rate-limiting)
5. [Security Headers](#security-headers)
6. [CORS Configuration](#cors-configuration)
7. [Cookie Security](#cookie-security)
8. [API Security](#api-security)
9. [Data Protection](#data-protection)
10. [Security Testing](#security-testing)
11. [Production Checklist](#production-checklist)

## Environment Security

### Environment Variable Validation

All environment variables are validated using Zod schemas in `lib/env.ts`:

```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  // ... other variables
})
```

### Required Environment Variables

- `NEXTAUTH_SECRET`: Must be at least 32 characters
- `ENCRYPTION_KEY`: Must be at least 32 characters for OAuth token encryption
- `DATABASE_URL`: PostgreSQL connection string
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins

### Security Best Practices

- Never commit `.env` files to version control
- Use different secrets for each environment
- Rotate secrets regularly
- Use strong, randomly generated secrets

## Authentication & Authorization

### NextAuth.js Configuration

Enhanced security configuration in `lib/auth.ts`:

```typescript
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: isProduction ? 24 * 60 * 60 : 30 * 24 * 60 * 60, // 1 day in prod
    updateAge: 60 * 60, // Update every hour
  },
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
      },
    },
  },
}
```

### Password Security

- Passwords hashed using argon2id algorithm
- Minimum 8 characters required
- Rate limiting on login attempts
- Account lockout after multiple failed attempts

### OAuth Security

- Secure token storage with encryption
- Token refresh handling
- Proper scope validation
- State parameter validation

## Input Validation & Sanitization

### Zod Validation

All API inputs validated using Zod schemas:

```typescript
const userSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100)
})
```

### Input Sanitization

Automatic sanitization of string inputs:

```typescript
export class InputSanitizer {
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }
}
```

### API Validation Wrapper

Use `withValidation` wrapper for consistent validation:

```typescript
export const POST = withValidation(
  async (request) => {
    // Handler logic
  },
  {
    body: userSchema,
    requireAuth: true,
    sanitizeInputs: true
  }
)
```

## Rate Limiting

### Multiple Rate Limiters

Different rate limits for different operations:

- **Authentication**: 5 attempts per 15 minutes
- **Registration**: 3 attempts per hour
- **API calls**: 60 requests per minute (production)
- **Sensitive operations**: 10 requests per minute

### Enhanced Features

- Failed attempt tracking
- IP blocking for suspicious activity
- Automatic cleanup of expired entries
- Different limits for development/production

### Usage Example

```typescript
import { authRateLimit } from '../lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  await authRateLimit.checkRateLimit(request, isFailedAttempt)
  // ... rest of handler
}
```

## Security Headers

### Comprehensive Header Configuration

Implemented in `lib/security.ts`:

```typescript
export const securityHeaders = {
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': '...',
  'Permissions-Policy': '...',
  'Strict-Transport-Security': '...' // Production only
}
```

### Content Security Policy (CSP)

Strict CSP configuration allowing only necessary sources:

- Scripts: Self, Google, Facebook, LinkedIn
- Styles: Self, inline (for styled components), Google Fonts
- Images: Self, data URLs, HTTPS sources
- Connections: Self, API endpoints

## CORS Configuration

### Origin Validation

CORS configured to allow only specified origins:

```typescript
export function getCORSHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [env.NEXTAUTH_URL]
  
  if (origin && allowedOrigins.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true'
    }
  }
  
  return {} // No CORS headers for unauthorized origins
}
```

### Request Validation

State-changing requests validated for proper origin:

```typescript
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || [env.NEXTAUTH_URL]
  return origin ? allowedOrigins.includes(origin) : false
}
```

## Cookie Security

### Secure Cookie Configuration

Production cookies use security prefixes and flags:

- `__Secure-` prefix for HTTPS-only cookies
- `__Host-` prefix for path-restricted cookies
- `HttpOnly` flag to prevent XSS
- `Secure` flag for HTTPS-only
- `SameSite=Lax` for CSRF protection

### Session Management

- Short session duration in production (1 day)
- Automatic session refresh
- Secure session invalidation

## API Security

### Authentication Middleware

All API routes protected by authentication middleware:

```typescript
export default withAuth(
  async function middleware(req: NextRequest) {
    // Security headers, CORS, rate limiting
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Route-specific authorization logic
      }
    }
  }
)
```

### Error Handling

Consistent error responses without information leakage:

```typescript
export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message)
  }
}
```

## Data Protection

### Encryption

Sensitive data encrypted using AES-256-GCM:

```typescript
// OAuth tokens encrypted before storage
const encryptedToken = encrypt(accessToken, env.ENCRYPTION_KEY)
```

### Database Security

- Parameterized queries (Prisma default)
- Connection pooling
- Proper access controls
- Regular backups

### PII Handling

- Minimal data collection
- Secure data transmission
- Proper data retention policies
- GDPR compliance considerations

## Security Testing

### Automated Testing

Run security tests with:

```bash
yarn security:test
```

Tests include:

- Security header validation
- Rate limiting verification
- Authentication bypass attempts
- Input validation testing
- CORS configuration testing

### Manual Testing

Regular security audits should include:

- Penetration testing
- Vulnerability scanning
- Code review
- Dependency auditing

### Dependency Security

```bash
yarn security:audit
```

Regular dependency updates and vulnerability scanning.

## Production Checklist

### Environment Configuration

- [ ] All environment variables properly set
- [ ] Secrets are strong and unique
- [ ] HTTPS enabled
- [ ] Database secured
- [ ] Monitoring configured

### Security Headers

- [ ] All security headers configured
- [ ] CSP properly restrictive
- [ ] HSTS enabled
- [ ] Certificate pinning (if applicable)

### Authentication

- [ ] OAuth providers configured
- [ ] Rate limiting active
- [ ] Session security verified
- [ ] Password policies enforced

### Monitoring

- [ ] Error logging configured
- [ ] Security event monitoring
- [ ] Rate limit monitoring
- [ ] Failed authentication alerts

### Regular Maintenance

- [ ] Security patches applied
- [ ] Dependencies updated
- [ ] Secrets rotated
- [ ] Security tests passing

## Incident Response

### Security Incident Procedure

1. **Immediate Response**
   - Assess the scope of the incident
   - Contain the threat
   - Preserve evidence

2. **Investigation**
   - Analyze logs and evidence
   - Determine root cause
   - Assess impact

3. **Recovery**
   - Apply fixes
   - Restore services
   - Verify security

4. **Post-Incident**
   - Document lessons learned
   - Update security measures
   - Communicate with stakeholders

### Contact Information

- Security Team: security@company.com
- Emergency Contact: +1-XXX-XXX-XXXX
- Incident Response: incidents@company.com

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management)

---

**Note**: This security implementation follows industry best practices but should be regularly reviewed and updated based on the latest security recommendations and threat landscape.