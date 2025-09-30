# OAuth Integration System - Backend Implementation

## Overview

The OAuth Integration System provides secure authentication and token management for third-party marketing platforms including Google Ads, Meta Ads (Facebook), and LinkedIn Ads.

## Architecture

### Core Components

1. **OAuthService** (`lib/services/oauth.service.ts`)
   - Handles OAuth flow initiation and callback processing
   - Manages token encryption, storage, and refresh
   - Provides integration health checking
   - Implements secure token revocation

2. **IntegrationsService** (`lib/services/integrations.service.ts`)
   - Manages integration lifecycle (connect, sync, disconnect)
   - Handles integration status and health monitoring
   - Coordinates with OAuthService for token management

3. **IntegrationsController** (`lib/controllers/integrations.controller.ts`)
   - Provides API endpoints for integration management
   - Handles request validation and error responses
   - Implements proper authentication and rate limiting

4. **OAuthLogger** (`lib/utils/oauth-logger.ts`)
   - Centralized logging for OAuth operations
   - Security event tracking
   - Structured logging with context

## API Endpoints

### Integration Management

- `GET /api/integrations` - List user integrations
- `POST /api/integrations/oauth/start` - Initiate OAuth flow
- `POST /api/integrations/oauth/callback` - Handle OAuth callback
- `GET /api/integrations/oauth/callback` - Handle OAuth callback (GET method)

### Integration Operations

- `GET /api/integrations/[id]` - Get integration status
- `DELETE /api/integrations/[id]` - Disconnect integration
- `POST /api/integrations/[id]/sync` - Trigger integration sync

### Health Monitoring

- `GET /api/integrations/[id]/health` - Check single integration health
- `GET /api/integrations/health` - Check all integrations health

## Security Features

### Token Security
- **Encryption**: All tokens encrypted using AES-256-GCM
- **Secure Storage**: Encrypted tokens stored in database
- **Token Rotation**: Automatic refresh token handling
- **Revocation**: Proper token revocation on disconnect

### Authentication & Authorization
- **Session Validation**: All endpoints require valid user session
- **Rate Limiting**: Protection against abuse
- **State Validation**: CSRF protection via state parameter
- **Scope Validation**: Proper OAuth scope management

### Security Monitoring
- **Invalid State Detection**: Logs suspicious OAuth attempts
- **Token Expiry Tracking**: Monitors token health
- **Failed Refresh Logging**: Tracks authentication issues
- **Rate Limit Monitoring**: Detects potential attacks

## OAuth Flow

### 1. Initiation
```typescript
POST /api/integrations/oauth/start
{
  "provider": "google" | "facebook" | "linkedin"
}
```

1. Generate secure state parameter
2. Store state with expiration (10 minutes)
3. Build provider-specific OAuth URL
4. Return authorization URL to client

### 2. Callback Handling
```typescript
POST /api/integrations/oauth/callback
{
  "code": "authorization_code",
  "state": "secure_state_parameter",
  "provider": "google" | "facebook" | "linkedin"
}
```

1. Validate state parameter
2. Exchange authorization code for tokens
3. Fetch account information
4. Encrypt and store tokens
5. Mark integration as active

### 3. Token Refresh
- Automatic refresh when token expires within 5 minutes
- Handles refresh token rotation
- Updates integration status on failure
- Marks for re-authentication if refresh token invalid

## Provider Configurations

### Google (Ads & Analytics)
- **Auth URL**: `https://accounts.google.com/o/oauth2/v2/auth`
- **Token URL**: `https://oauth2.googleapis.com/token`
- **Scopes**: `adwords`, `analytics.readonly`
- **Special**: Requires `access_type=offline` and `prompt=consent`

### Facebook/Meta Ads
- **Auth URL**: `https://www.facebook.com/v18.0/dialog/oauth`
- **Token URL**: `https://graph.facebook.com/v18.0/oauth/access_token`
- **Scopes**: `ads_read`, `business_management`

### LinkedIn Ads
- **Auth URL**: `https://www.linkedin.com/oauth/v2/authorization`
- **Token URL**: `https://www.linkedin.com/oauth/v2/accessToken`
- **Scopes**: `r_ads`, `r_ads_reporting`

## Health Monitoring

### Health Check Criteria
- **Integration Active**: Must be marked as active
- **Token Availability**: Access token must exist
- **Token Validity**: Token must not be expired (or refresh token available)
- **Sync Status**: No error status
- **Recent Activity**: Sync within last 7 days (warning)

### Health Status Types
- `HEALTHY`: All checks pass
- `UNHEALTHY`: One or more issues detected
- `ERROR`: Health check failed
- `NOT_FOUND`: Integration doesn't exist

## Error Handling

### Common Error Codes
- `OAUTH_INIT_FAILED`: OAuth initiation failed
- `INVALID_STATE`: Invalid or expired state parameter
- `TOKEN_EXCHANGE_FAILED`: Authorization code exchange failed
- `TOKEN_REFRESH_FAILED`: Token refresh failed
- `REFRESH_TOKEN_INVALID`: Refresh token invalid, re-auth required
- `INTEGRATION_NOT_FOUND`: Integration not found
- `PROVIDER_NOT_CONFIGURED`: Provider missing configuration

### Error Response Format
```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { /* Additional context */ },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Environment Variables

Required environment variables for OAuth providers:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Encryption
ENCRYPTION_KEY=your_32_byte_hex_encryption_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Usage Examples

### Starting OAuth Flow
```typescript
const response = await fetch('/api/integrations/oauth/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ provider: 'google' })
});

const { authUrl } = await response.json();
window.location.href = authUrl; // Redirect to OAuth provider
```

### Checking Integration Health
```typescript
const response = await fetch('/api/integrations/health');
const { summary, integrations } = await response.json();

console.log(`${summary.healthyIntegrations}/${summary.totalIntegrations} integrations healthy`);
```

### Handling Integration Sync
```typescript
const response = await fetch(`/api/integrations/${integrationId}/sync`, {
  method: 'POST'
});

if (response.ok) {
  console.log('Sync started successfully');
} else {
  const error = await response.json();
  console.error('Sync failed:', error.error.message);
}
```

## Logging

All OAuth operations are logged with structured context:

```typescript
// OAuth flow events
OAuthLogger.logOAuthFlow('initiate', 'google', userId);
OAuthLogger.logOAuthSuccess('callback', 'google', userId, integrationId);
OAuthLogger.logOAuthError('refresh', 'google', error, userId, integrationId);

// Token events
OAuthLogger.logTokenEvent('issued', 'google', integrationId);
OAuthLogger.logTokenEvent('expired', 'google', integrationId);

// Security events
OAuthLogger.logSecurityEvent('invalid_state', { provider, state });
```

## Testing

### Manual Testing
1. Start OAuth flow via API endpoint
2. Complete OAuth authorization in browser
3. Verify integration created and active
4. Test token refresh functionality
5. Test health check endpoints
6. Test integration disconnection

### Health Check Testing
```bash
# Check single integration
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/integrations/$INTEGRATION_ID/health

# Check all integrations
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/integrations/health
```

## Troubleshooting

### Common Issues

1. **Invalid State Parameter**
   - Check state expiration (10 minutes)
   - Verify state storage in database
   - Check for CSRF attacks

2. **Token Exchange Failure**
   - Verify OAuth provider credentials
   - Check redirect URI configuration
   - Validate authorization code

3. **Token Refresh Failure**
   - Check refresh token validity
   - Verify provider token endpoint
   - Handle refresh token rotation

4. **Health Check Issues**
   - Verify database connectivity
   - Check token decryption
   - Validate integration status

### Debug Logging

Enable debug logging in development:
```bash
NODE_ENV=development
```

This will show detailed OAuth flow information in console logs.