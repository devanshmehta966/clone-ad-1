# OAuth Integration Endpoints

**Generated:** 2025-01-16  
**Purpose:** Complete API reference for OAuth integration endpoints

## Overview

The OAuth integration system provides secure authentication and data synchronization for marketing platforms. All endpoints are deployed as Supabase Edge Functions with appropriate JWT verification.

## Endpoint Configuration

### Authentication Requirements
- **Protected Endpoints**: Require `Authorization: Bearer <jwt_token>` header
- **Public Endpoints**: No authentication required (used by external OAuth providers)

## Core OAuth Endpoints

### 1. Start OAuth Flow
**Endpoint:** `POST /functions/v1/oauth-start`  
**Authentication:** Required ✅  
**Purpose:** Initialize OAuth flow for a provider

#### Request
```typescript
{
  provider: 'google-ads' | 'google-analytics' | 'meta-ads' | 'linkedin-ads';
  redirectUrl?: string; // Optional, defaults to request origin
}
```

#### Response
```typescript
{
  authUrl: string;        // OAuth provider authorization URL
  state: string;          // Secure state parameter for CSRF protection
  redirectUrl: string;    // Where user will return after OAuth
}
```

#### Error Codes
- `FEATURE_DISABLED` (403): OAuth integrations disabled
- `INVALID_PROVIDER` (400): Unsupported provider
- `CONFIGURATION_ERROR` (400): OAuth credentials not configured
- `UNAUTHORIZED` (401): Invalid or missing JWT

#### Example
```bash
curl -X POST https://feungttbwufmpqsxohij.supabase.co/functions/v1/oauth-start \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google-ads",
    "redirectUrl": "https://myapp.com"
  }'
```

### 2. OAuth Callback Handler
**Endpoint:** `GET /functions/v1/oauth-callback`  
**Authentication:** Public ❌  
**Purpose:** Handle OAuth provider callbacks and token exchange

#### Query Parameters
- `code`: Authorization code from OAuth provider
- `state`: State parameter for CSRF validation
- `provider`: OAuth provider name
- `error`: Error code (if authorization failed)
- `error_description`: Error description

#### Response
- **Success**: HTTP 302 redirect to `{origin}?oauth_result=success&provider={provider}`
- **Error**: HTTP 302 redirect to `{origin}?oauth_result=error&message={encoded_message}`

#### Example URL
```
https://feungttbwufmpqsxohij.supabase.co/functions/v1/oauth-callback?code=4/abc123&state=xyz789&provider=google-ads
```

### 3. Disconnect Integration
**Endpoint:** `POST /functions/v1/oauth-disconnect`  
**Authentication:** Required ✅  
**Purpose:** Disconnect and revoke OAuth integration

#### Request
```typescript
{
  provider: string; // Provider to disconnect
}
```

#### Response
```typescript
{
  success: boolean;
  provider: string;
  message: string;
}
```

#### Error Codes
- `NOT_CONNECTED` (404): No active integration found
- `REVOCATION_FAILED` (500): Failed to revoke tokens
- `DISCONNECT_FAILED` (500): Database update failed

#### Example
```bash
curl -X POST https://feungttbwufmpqsxohij.supabase.co/functions/v1/oauth-disconnect \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"provider": "google-ads"}'
```

## Integration Management Endpoints

### 4. Integration Status
**Endpoint:** `GET /functions/v1/integrations-status`  
**Authentication:** Required ✅  
**Purpose:** Get current status of all user integrations

#### Response
```typescript
{
  integrations: Array<{
    provider: string;
    connected: boolean;
    lastSync?: string;      // ISO timestamp
    status: 'healthy' | 'error' | 'syncing' | 'idle' | 'disconnected';
    accounts?: Array<{
      id: string;
      name: string;
    }>;
    lastError?: string;
    scopes?: string[];
  }>;
  timestamp: string;        // ISO timestamp
}
```

#### Example
```bash
curl https://feungttbwufmpqsxohij.supabase.co/functions/v1/integrations-status \
  -H "Authorization: Bearer <jwt_token>"
```

### 5. Manual Sync Trigger
**Endpoint:** `POST /functions/v1/sync-integrations`  
**Authentication:** Required ✅  
**Purpose:** Trigger manual data synchronization

#### Request
```typescript
{
  provider?: string; // Optional: sync specific provider, omit for all
}
```

#### Response
```typescript
{
  jobId: string;
  status: 'completed' | 'partial';
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: Array<{
    platform: string;
    success: boolean;
    error?: string;
  }>;
  timestamp: string;
}
```

#### Error Codes
- `NO_INTEGRATIONS` (404): No active integrations found
- `SYNC_IN_PROGRESS` (409): Sync already running
- `RATE_LIMITED` (429): Too many sync requests

#### Example
```bash
curl -X POST https://feungttbwufmpqsxohij.supabase.co/functions/v1/sync-integrations \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"provider": "google-ads"}'
```

### 6. System Health Check
**Endpoint:** `GET /functions/v1/integrations-health`  
**Authentication:** Public ❌  
**Purpose:** Monitor system health and service availability

#### Response
```typescript
{
  healthy: boolean;
  services: Record<string, {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime?: number;  // milliseconds
    lastCheck: string;      // ISO timestamp
    error?: string;
  }>;
  timestamp: string;
  features: {
    integrations: boolean;  // Feature flag status
    database: boolean;
    functions: boolean;
  };
}
```

#### Example
```bash
curl https://feungttbwufmpqsxohij.supabase.co/functions/v1/integrations-health
```

## Data Sync Endpoints

### Provider-Specific Sync Functions
All sync functions require authentication and follow similar patterns:

#### Google Ads Sync
**Endpoint:** `POST /functions/v1/google-ads-sync`  
**Purpose:** Sync Google Ads campaigns and performance data

#### Google Analytics Sync  
**Endpoint:** `POST /functions/v1/google-analytics-sync`  
**Purpose:** Sync website analytics and conversion data

#### Meta Ads Sync
**Endpoint:** `POST /functions/v1/meta-ads-sync`  
**Purpose:** Sync Facebook/Instagram ad campaigns

#### LinkedIn Ads Sync
**Endpoint:** `POST /functions/v1/linkedin-ads-sync`  
**Purpose:** Sync LinkedIn advertising campaigns

#### Common Sync Request Format
```typescript
{
  action: 'sync_data' | 'sync_campaigns' | 'create_campaign';
  // Additional parameters vary by provider and action
}
```

## Security Configuration

### JWT Verification Settings
```toml
# supabase/config.toml

# Protected Endpoints (require user authentication)
[functions.oauth-start]
verify_jwt = true

[functions.oauth-disconnect]  
verify_jwt = true

[functions.integrations-status]
verify_jwt = true

[functions.sync-integrations]
verify_jwt = true

# Provider sync functions
[functions.google-ads-sync]
verify_jwt = true

[functions.google-analytics-sync]
verify_jwt = true

[functions.meta-ads-sync]
verify_jwt = true

[functions.linkedin-ads-sync]
verify_jwt = true

# Public Endpoints (no authentication required)
[functions.oauth-callback]
verify_jwt = false  # Called by external OAuth providers

[functions.integrations-health]
verify_jwt = false  # Public health monitoring
```

## Error Response Format

All endpoints return consistent error responses:

```typescript
{
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: object;       // Additional error context
  }
}
```

### Common Error Codes
- `FEATURE_DISABLED`: OAuth integrations not enabled
- `UNAUTHORIZED`: Missing or invalid authentication
- `INVALID_PROVIDER`: Unsupported OAuth provider
- `CONFIGURATION_ERROR`: Missing OAuth credentials
- `TOKEN_EXPIRED`: OAuth token needs refresh
- `PERMISSION_DENIED`: Insufficient OAuth scopes
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

### Default Limits (per user)
- OAuth operations: 10 requests/minute
- Sync operations: 5 requests/minute  
- Status checks: 60 requests/minute
- Health checks: No limit (public endpoint)

### Rate Limit Headers
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8  
X-RateLimit-Reset: 1642684800
```

## Testing Endpoints

### Feature Flag Control
Set `INTEGRATIONS_API_ENABLED=false` to disable OAuth functionality and test graceful degradation.

### Health Check Monitoring
Use the `/integrations-health` endpoint for uptime monitoring and alerting.

### Local Development
All endpoints are available locally at `http://localhost:54321/functions/v1/{endpoint}` when running `supabase start`.

## SDKs and Client Libraries

### JavaScript/TypeScript
```typescript
import { supabase } from '@/integrations/supabase/client';

// Start OAuth flow
const { data, error } = await supabase.functions.invoke('oauth-start', {
  body: { provider: 'google-ads' }
});

// Check integration status
const { data: status } = await supabase.functions.invoke('integrations-status');

// Trigger manual sync
const { data: syncResult } = await supabase.functions.invoke('sync-integrations', {
  body: { provider: 'google-ads' }
});
```

### cURL Examples
See individual endpoint documentation above for complete cURL examples.

---

**Related Documentation:**
- [Implementation Plan](./implementation-plan.md)
- [Local Development Guide](./local-development.md)
- [Security Guidelines](../security/oauth-security.md)