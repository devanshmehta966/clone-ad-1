# Stage B - OAuth Integrations Implementation Plan

**Generated:** 2025-01-16  
**Purpose:** File-level implementation plan for OAuth integrations with minimal changes to existing UI

## 1. Feature Flag Implementation

### Files to Create/Modify
- **`supabase/functions/_shared/feature-flags.ts`** (new)
  - Purpose: Centralized feature flag management
  - Contains: `INTEGRATIONS_API_ENABLED` flag checker

### Implementation Details
```typescript
export const isIntegrationsEnabled = (): boolean => {
  return Deno.env.get('INTEGRATIONS_API_ENABLED') === 'true';
};
```

## 2. Database Schema & Migrations

### Database Changes Required
- **Existing:** `oauth_integrations` table already exists (referenced in edge functions)
- **Action:** Verify schema matches requirements, add missing columns if needed

### Migration: Enhance oauth_integrations table
```sql
-- Add missing columns to existing oauth_integrations table
ALTER TABLE public.oauth_integrations 
ADD COLUMN IF NOT EXISTS scopes TEXT[],
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_error TEXT,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'idle';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_integrations_user_platform 
ON public.oauth_integrations(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_oauth_integrations_active 
ON public.oauth_integrations(is_active) WHERE is_active = true;
```

## 3. Token Encryption & Security

### Files to Create
- **`supabase/functions/_shared/crypto.ts`** (new)
  - Purpose: AEAD encryption/decryption for OAuth tokens
  - Uses: Web Crypto API with AES-GCM
  - Key source: `OAUTH_ENCRYPTION_KEY` environment variable

### Implementation Details
```typescript
export async function encryptToken(token: string): Promise<string>;
export async function decryptToken(encryptedToken: string): Promise<string>;
```

### Secrets to Add
- `OAUTH_ENCRYPTION_KEY` - 256-bit encryption key for token storage
- `GOOGLE_OAUTH_CLIENT_ID` - Google OAuth client ID  
- `GOOGLE_OAUTH_CLIENT_SECRET` - Google OAuth client secret
- `META_APP_ID` - Meta/Facebook app ID
- `META_APP_SECRET` - Meta/Facebook app secret
- `LINKEDIN_CLIENT_ID` - LinkedIn OAuth client ID
- `LINKEDIN_CLIENT_SECRET` - LinkedIn OAuth client secret

## 4. OAuth Flow Implementation

### Files to Create
- **`supabase/functions/oauth-start/index.ts`** (new)
  - Purpose: Initialize OAuth flow for any provider
  - Route: `/functions/v1/oauth-start`
  - Input: `{ provider: string, redirectUrl?: string }`
  - Output: `{ authUrl: string, state: string }`

- **`supabase/functions/oauth-callback/index.ts`** (new)
  - Purpose: Handle OAuth callback and token exchange
  - Route: `/functions/v1/oauth-callback`
  - Input: Query params (code, state, provider)
  - Output: `{ success: boolean, integration: object }`

- **`supabase/functions/oauth-disconnect/index.ts`** (new)
  - Purpose: Disconnect integration and revoke tokens
  - Route: `/functions/v1/oauth-disconnect`
  - Input: `{ provider: string }`
  - Output: `{ success: boolean }`

### Provider-Specific Configuration
- **`supabase/functions/_shared/oauth-providers.ts`** (new)
  - Purpose: OAuth URLs, scopes, and configuration per provider
  - Contains: Google Ads, GA4, Meta Ads, LinkedIn configurations

```typescript
export const OAUTH_CONFIGS = {
  'google-ads': {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/adwords'],
    // ...
  },
  // ... other providers
};
```

## 5. Data Sync Jobs Implementation

### Files to Create
- **`supabase/functions/sync-integrations/index.ts`** (new)
  - Purpose: Manual "sync now" endpoint
  - Route: `/functions/v1/sync-integrations`
  - Input: `{ provider?: string }` (optional, syncs all if omitted)
  - Output: `{ jobId: string, status: string }`

- **`supabase/functions/daily-sync/index.ts`** (new)
  - Purpose: Scheduled daily sync job (called by pg_cron)
  - Route: `/functions/v1/daily-sync`
  - Triggered: Daily at 2 AM UTC
  - Process: Sync all active integrations, store daily rollups

### Enhanced Edge Functions (Modify Existing)
- **`supabase/functions/google-ads-sync/index.ts`** (modify)
  - Add real Google Ads API calls
  - Replace mock data generation with actual API responses
  - Add error handling and retry logic

- **`supabase/functions/google-analytics-sync/index.ts`** (modify)
  - Add real GA4 API calls
  - Replace mock data with actual analytics data
  - Add data transformation logic

- **`supabase/functions/meta-ads-sync/index.ts`** (modify)
  - Add real Meta Marketing API calls
  - Replace mock campaigns with actual ad account data
  - Add campaign management endpoints

- **`supabase/functions/linkedin-ads-sync/index.ts`** (modify)
  - Add real LinkedIn Marketing API calls
  - Replace mock B2B data with actual campaign metrics
  - Add audience and campaign creation endpoints

### Cron Job Setup
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily sync at 2 AM UTC
SELECT cron.schedule(
  'daily-integrations-sync',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://feungttbwufmpqsxohij.supabase.co/functions/v1/daily-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.anon_key') || '"}'::jsonb,
    body := '{"source": "cron"}'::jsonb
  ) as request_id;
  $$
);
```

## 6. Status & Health Endpoints

### Files to Create
- **`supabase/functions/integrations-status/index.ts`** (new)
  - Purpose: Get integration status for dashboard
  - Route: `/functions/v1/integrations-status`
  - Output: `{ integrations: Array<{provider, status, lastSync, accounts}> }`

- **`supabase/functions/integrations-health/index.ts`** (new)
  - Purpose: Health check for all integrations
  - Route: `/functions/v1/integrations-health`
  - Output: `{ healthy: boolean, services: object }`

## 7. Frontend Integration (Minimal UI Changes)

### Files to Modify
- **`src/components/integrations/OAuthIntegrations.tsx`** (lines 102-134)
  - Replace mock `handleConnect()` with real OAuth flow
  - Replace mock `handleDisconnect()` with API calls
  - Add error handling for OAuth failures
  - Keep existing UI design unchanged

### Changes Required
```typescript
// Replace lines 102-134 with:
const handleConnect = async (provider: string) => {
  try {
    const { data } = await supabase.functions.invoke('oauth-start', {
      body: { provider, redirectUrl: window.location.origin }
    });
    window.location.href = data.authUrl;
  } catch (error) {
    toast.error(`Failed to connect ${provider}`);
  }
};

const handleDisconnect = async (provider: string) => {
  try {
    await supabase.functions.invoke('oauth-disconnect', {
      body: { provider }
    });
    // Update local state
    setConnections(prev => ({ ...prev, [provider]: { connected: false } }));
    toast.success(`${provider} disconnected successfully`);
  } catch (error) {
    toast.error(`Failed to disconnect ${provider}`);
  }
};
```

- **`src/contexts/DashboardContext.tsx`** (lines 90-235)
  - Replace hardcoded integration status with API calls
  - Add integration status fetching on mount
  - Add sync status updates

### Context Changes
```typescript
// Add to useEffect (around line 200):
const fetchIntegrationStatus = async () => {
  try {
    const { data } = await supabase.functions.invoke('integrations-status');
    setIntegrations(data.integrations);
  } catch (error) {
    console.error('Failed to fetch integration status:', error);
  }
};
```

## 8. API Contract Specification

### Endpoints (Maintaining Existing UI Contract)

#### OAuth Management
- `POST /functions/v1/oauth-start`
  - Input: `{ provider: string, redirectUrl?: string }`
  - Output: `{ authUrl: string, state: string }`
  - Errors: `INVALID_PROVIDER`, `CONFIGURATION_ERROR`

- `GET /functions/v1/oauth-callback?code=...&state=...&provider=...`
  - Output: Redirect to dashboard with success/error params
  - Errors: `INVALID_CODE`, `STATE_MISMATCH`, `TOKEN_EXCHANGE_FAILED`

- `POST /functions/v1/oauth-disconnect`
  - Input: `{ provider: string }`
  - Output: `{ success: boolean }`
  - Errors: `NOT_CONNECTED`, `REVOCATION_FAILED`

#### Data Synchronization
- `POST /functions/v1/sync-integrations`
  - Input: `{ provider?: string }`
  - Output: `{ jobId: string, status: 'started' | 'queued' }`
  - Errors: `NOT_CONNECTED`, `SYNC_IN_PROGRESS`, `RATE_LIMITED`

#### Status & Health
- `GET /functions/v1/integrations-status`
  - Output: 
    ```json
    {
      "integrations": [
        {
          "provider": "google-ads",
          "connected": true,
          "lastSync": "2025-01-16T10:30:00Z",
          "status": "healthy",
          "accounts": [{"id": "123", "name": "Main Account"}],
          "lastError": null
        }
      ]
    }
    ```

- `GET /functions/v1/integrations-health`
  - Output: `{ healthy: boolean, services: object, timestamp: string }`

### Error Response Format
```json
{
  "error": {
    "code": "TOKEN_EXPIRED|PERMISSION_DENIED|RATE_LIMITED|INVALID_SCOPE",
    "message": "Human readable error message",
    "details": { "provider": "google-ads", "retryAfter": 300 }
  }
}
```

## 9. Security Implementation

### Token Storage Security
- **Encryption:** AES-GCM with 256-bit keys
- **Key Management:** Environment variables only
- **Token Rotation:** Automatic refresh token usage
- **Audit Trail:** Log all token operations (without token values)

### CSRF Protection
- **State Parameter:** Cryptographically secure random state in OAuth flow
- **Session Validation:** Verify state matches stored session
- **Origin Validation:** Check referrer headers

### API Security
- **Authentication:** All endpoints require Supabase JWT
- **Authorization:** RLS policies enforce user isolation
- **Rate Limiting:** Built into Supabase edge functions
- **Input Validation:** Strict schema validation on all inputs

## 10. Provider-Specific Scopes

### Google Ads
- `https://www.googleapis.com/auth/adwords` - Ad performance read access

### Google Analytics 4
- `https://www.googleapis.com/auth/analytics.readonly` - Analytics read access

### Meta/Facebook Ads
- `ads_read` - Read ad account data
- `business_management` - Access business assets

### LinkedIn Ads
- `r_ads_reporting` - Read campaign reporting data
- `r_organization_social` - Access organization data

## 11. Observability & Logging

### Logging Strategy
- **Correlation IDs:** UUID per request for tracing
- **Log Levels:** INFO for operations, ERROR for failures, DEBUG for development
- **Sensitive Data:** Never log tokens, mask account IDs
- **Structured Logs:** JSON format with consistent fields

### Monitoring Points
- OAuth flow completion rates
- Sync job success/failure rates
- API response times per provider
- Token refresh success rates
- Daily active integrations

## 12. Migration & Rollback Plan

### Database Migration
- Enhance existing `oauth_integrations` table
- Add new indexes for performance
- Backward compatible changes only

### Feature Flag Rollback
- Set `INTEGRATIONS_API_ENABLED=false` to disable new features
- Existing UI falls back to mock behavior
- No data loss or corruption

### Edge Function Rollback
- Keep existing edge functions as backup
- New functions are additive, not replacements
- Can disable individual providers independently

## 13. Testing Strategy (Stage D Preview)

### Unit Tests
- Token encryption/decryption
- OAuth state generation/validation
- API input validation
- Error response formatting

### Integration Tests
- OAuth callback flow (with stubbed providers)
- Database operations with RLS
- Job scheduling and execution

### E2E Tests
- Complete OAuth connection flow
- Data sync verification
- Error handling scenarios

## 14. Implementation Order

### Phase 1: Foundation
1. Feature flag implementation
2. Database schema verification/enhancement
3. Token encryption utilities
4. OAuth provider configurations

### Phase 2: Core OAuth
1. OAuth start/callback/disconnect endpoints
2. Provider-specific API integrations
3. Error handling and logging

### Phase 3: Data Sync
1. Manual sync endpoints
2. Daily sync job implementation
3. Enhanced edge functions with real API calls

### Phase 4: UI Integration
1. Update OAuthIntegrations component
2. Enhance DashboardContext
3. Add error states and loading indicators

### Phase 5: Monitoring & Health
1. Status and health endpoints
2. Cron job setup
3. Observability implementation

---

**Next Stage:** Proceed to Stage C - Safe Implementation with feature flag behind `INTEGRATIONS_API_ENABLED=false` by default.
