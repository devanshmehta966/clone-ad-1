# Stage D - Local Development & Testing Guide

**Generated:** 2025-01-16  
**Purpose:** Complete local development setup for OAuth integrations with comprehensive testing

## Prerequisites

### Required Tools
- Deno 1.37+ (for edge function testing)
- Supabase CLI 1.100+
- Git (for version control)
- VS Code with Supabase extension (recommended)

### Environment Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Install Deno
curl -fsSL https://deno.land/install.sh | sh

# Verify installations
supabase --version
deno --version
```

## Local Development Environment

### 1. Supabase Local Setup
```bash
# Start local Supabase (PostgreSQL + Edge Functions)
supabase start

# Reset database to clean state
supabase db reset

# Apply migrations
supabase migration up
```

### 2. Environment Variables
Create `.env.local` for local testing:

```bash
# Supabase (automatically set by CLI)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from_supabase_status>
SUPABASE_SERVICE_ROLE_KEY=<from_supabase_status>

# OAuth Integration Secrets (required for testing)
INTEGRATIONS_API_ENABLED=true
OAUTH_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# OAuth Provider Credentials (use test/dev credentials)
GOOGLE_OAUTH_CLIENT_ID=your_google_test_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_test_client_secret
META_APP_ID=your_meta_test_app_id
META_APP_SECRET=your_meta_test_app_secret
LINKEDIN_CLIENT_ID=your_linkedin_test_client_id  
LINKEDIN_CLIENT_SECRET=your_linkedin_test_client_secret
```

### 3. Load Environment Variables
```bash
# Load into current session
source .env.local

# Or set in Supabase functions
supabase secrets set --env-file .env.local
```

## Testing Framework

### Unit Tests
Test individual components and utilities:

```bash
# Run crypto tests
deno test --allow-env supabase/functions/_tests/crypto.test.ts

# Run OAuth provider tests
deno test --allow-env supabase/functions/_tests/oauth-providers.test.ts

# Run all unit tests
deno test --allow-env supabase/functions/_tests/*.test.ts
```

### Integration Tests
Test complete OAuth flows:

```bash
# Run OAuth integration tests
deno test --allow-net --allow-env supabase/functions/_tests/oauth-integration.test.ts

# Run with verbose output
deno test --allow-net --allow-env -v supabase/functions/_tests/oauth-integration.test.ts
```

### E2E Tests
Test complete user flows:

```bash
# Run E2E tests
deno test --allow-net --allow-env supabase/functions/_tests/e2e-oauth.test.ts

# Run all tests
deno test --allow-net --allow-env --allow-read supabase/functions/_tests/
```

### Test Runner
Use the comprehensive test runner:

```bash
# Run complete test suite
deno run --allow-net --allow-env --allow-read supabase/functions/_tests/run-tests.ts

# Generate coverage report
deno test --allow-net --allow-env --coverage=coverage supabase/functions/_tests/
deno coverage coverage
```

## Development Workflow

### 1. Feature Development Cycle
```bash
# 1. Start local development
supabase start
npm run dev  # Start frontend

# 2. Make changes to edge functions
# Edit files in supabase/functions/

# 3. Deploy functions locally  
supabase functions deploy --local

# 4. Run tests
deno test --allow-net --allow-env supabase/functions/_tests/

# 5. Test in browser
# Navigate to http://localhost:3000/settings
# Test OAuth integration UI
```

### 2. Database Changes
```bash
# Create new migration
supabase migration new add_oauth_feature

# Apply locally
supabase db reset

# Test migration
deno test --allow-net --allow-env supabase/functions/_tests/
```

### 3. Debugging Edge Functions
```bash
# View function logs
supabase functions logs oauth-start --local

# Debug with console.log
# Add debugging to function code, then:
supabase functions deploy oauth-start --local
```

## OAuth Provider Setup for Testing

### Google (Test Environment)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create test project: "OAuth Integration Tests"
3. Enable Google Ads API & Analytics API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:54321/functions/v1/oauth-callback`

### Meta/Facebook (Test Environment)
1. Go to [Meta Developers](https://developers.facebook.com/)
2. Create test app: "OAuth Integration Tests"
3. Add Facebook Login product
4. Configure OAuth redirect URIs: `http://localhost:54321/functions/v1/oauth-callback`
5. Add test users in App Roles > Test Users

### LinkedIn (Test Environment)
1. Go to [LinkedIn Developers](https://developer.linkedin.com/)
2. Create test app: "OAuth Integration Tests"
3. Add Marketing Developer Platform product
4. Configure OAuth redirect URIs: `http://localhost:54321/functions/v1/oauth-callback`
5. Request access to r_ads_reporting scope

## Testing Scenarios

### Happy Path Testing
1. **OAuth Connection Flow**
   ```bash
   # Test complete connection
   curl -X POST http://localhost:54321/functions/v1/oauth-start \
     -H "Authorization: Bearer $TEST_USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"provider": "google-ads"}'
   ```

2. **Integration Status Check**
   ```bash
   # Check status after connection
   curl http://localhost:54321/functions/v1/integrations-status \
     -H "Authorization: Bearer $TEST_USER_TOKEN"
   ```

### Error Path Testing
1. **Feature Flag Disabled**
   ```bash
   # Disable feature flag
   export INTEGRATIONS_API_ENABLED=false
   
   # Test should return 403
   curl -X POST http://localhost:54321/functions/v1/oauth-start \
     -H "Authorization: Bearer $TEST_USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"provider": "google-ads"}'
   ```

2. **Invalid Provider**
   ```bash
   # Test with invalid provider
   curl -X POST http://localhost:54321/functions/v1/oauth-start \
     -H "Authorization: Bearer $TEST_USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"provider": "invalid-provider"}'
   ```

### Load Testing
```bash
# Test concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:54321/functions/v1/oauth-start \
    -H "Authorization: Bearer $TEST_USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"provider": "google-ads"}' &
done
wait
```

## Debugging Common Issues

### 1. Edge Function Errors
```bash
# View recent logs
supabase functions logs --local

# Check function deployment
supabase functions list --local
```

### 2. Database Connection Issues
```bash
# Check database status
supabase status

# Reset if needed
supabase db reset
```

### 3. OAuth Provider Errors
- **Invalid redirect URI**: Check OAuth app configuration
- **Scope errors**: Verify requested scopes are approved
- **Client ID/Secret**: Ensure test credentials are correct

### 4. Token Encryption Issues
```bash
# Verify encryption key format (must be 64 hex chars)
echo $OAUTH_ENCRYPTION_KEY | wc -c  # Should be 65 (including newline)

# Test encryption directly
deno test --allow-env supabase/functions/_tests/crypto.test.ts
```

## Performance Benchmarking

### Response Time Targets
- OAuth Start: < 500ms
- Integration Status: < 200ms  
- OAuth Callback: < 1000ms
- Token Operations: < 100ms

### Benchmarking Script
```bash
# Create benchmark script
cat > benchmark-oauth.sh << 'EOF'
#!/bin/bash
echo "Benchmarking OAuth endpoints..."

# OAuth start
time curl -s -X POST http://localhost:54321/functions/v1/oauth-start \
  -H "Authorization: Bearer $TEST_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider": "google-ads"}' > /dev/null

# Integration status  
time curl -s http://localhost:54321/functions/v1/integrations-status \
  -H "Authorization: Bearer $TEST_USER_TOKEN" > /dev/null

EOF

chmod +x benchmark-oauth.sh
./benchmark-oauth.sh
```

## Pre-Production Checklist

### Code Quality
- [ ] All tests pass
- [ ] No console.error in production code
- [ ] Proper error handling for all edge cases
- [ ] Input validation on all endpoints

### Security
- [ ] Tokens are encrypted before storage
- [ ] State parameters are cryptographically secure
- [ ] RLS policies are properly configured
- [ ] No sensitive data in logs

### Performance  
- [ ] Response times meet targets
- [ ] No memory leaks in edge functions
- [ ] Database queries are optimized
- [ ] Proper indexes are in place

### Documentation
- [ ] API documentation is complete
- [ ] Error codes are documented  
- [ ] Deployment guide is ready
- [ ] Rollback procedures are defined

## Troubleshooting Guide

### Common Error Codes
- `FEATURE_DISABLED`: Set `INTEGRATIONS_API_ENABLED=true`
- `CONFIGURATION_ERROR`: Check OAuth provider setup
- `INVALID_PROVIDER`: Use supported providers only
- `TOKEN_EXCHANGE_FAILED`: Check OAuth credentials
- `ENCRYPTION_ERROR`: Verify encryption key format

### Support Resources
- Supabase Documentation: https://supabase.com/docs
- OAuth 2.0 Spec: https://tools.ietf.org/html/rfc6749
- Provider Documentation:
  - Google: https://developers.google.com/identity/protocols/oauth2
  - Meta: https://developers.facebook.com/docs/facebook-login
  - LinkedIn: https://docs.microsoft.com/en-us/linkedin/shared/authentication

---

**Next:** Proceed to Stage E - Deliverables & Review for production deployment preparation.