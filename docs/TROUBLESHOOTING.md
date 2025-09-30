# Troubleshooting Guide

This guide covers common issues and their solutions for the Marketing Dashboard application.

## Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [OAuth Integration Issues](#oauth-integration-issues)
- [Build and Deployment Issues](#build-and-deployment-issues)
- [Performance Issues](#performance-issues)
- [API Issues](#api-issues)
- [Environment Configuration Issues](#environment-configuration-issues)
- [Docker Issues](#docker-issues)
- [Migration Issues](#migration-issues)
- [Frequently Asked Questions](#frequently-asked-questions)

## Quick Diagnostics

### Health Check Commands

Run these commands to quickly diagnose common issues:

```bash
# Check if all services are running
yarn db:start
docker ps

# Check database connection
yarn db:generate
yarn db:migrate

# Check environment variables
node -e "console.log(process.env.DATABASE_URL ? '✓ DATABASE_URL set' : '✗ DATABASE_URL missing')"
node -e "console.log(process.env.NEXTAUTH_SECRET ? '✓ NEXTAUTH_SECRET set' : '✗ NEXTAUTH_SECRET missing')"

# Check build
yarn build

# Run tests
yarn test:unit
```

### Log Locations

- **Application logs**: Console output when running `yarn dev`
- **Database logs**: `docker logs marketing-dashboard-db`
- **Build logs**: `.next/build.log` (if exists)
- **Test logs**: `coverage/` directory after running tests

## Database Issues

### Issue: "Can't reach database server"

**Symptoms:**
- Error: `Can't reach database server at localhost:5432`
- Application fails to start
- Database operations timeout

**Solutions:**

1. **Start the database:**
   ```bash
   yarn db:start
   # or
   docker-compose up -d db
   ```

2. **Check if PostgreSQL is running:**
   ```bash
   docker ps
   # Should show postgres container running
   ```

3. **Check database logs:**
   ```bash
   docker logs marketing-dashboard-db
   ```

4. **Verify DATABASE_URL:**
   ```bash
   # Check .env.local file
   cat .env.local | grep DATABASE_URL
   ```

5. **Reset database connection:**
   ```bash
   yarn db:stop
   yarn db:start
   yarn db:migrate
   ```

### Issue: "Migration failed"

**Symptoms:**
- Error during `yarn db:migrate`
- Database schema out of sync
- Prisma client generation fails

**Solutions:**

1. **Reset database:**
   ```bash
   yarn db:reset
   ```

2. **Manual migration:**
   ```bash
   yarn db:generate
   yarn db:migrate
   yarn db:seed
   ```

3. **Check migration files:**
   ```bash
   ls prisma/migrations/
   # Ensure migration files exist and are valid
   ```

4. **Force migration (use with caution):**
   ```bash
   npx prisma migrate resolve --applied "migration_name"
   npx prisma migrate deploy
   ```

### Issue: "Prisma Client not generated"

**Symptoms:**
- Error: `Cannot find module '@prisma/client'`
- TypeScript errors about Prisma types

**Solutions:**

1. **Generate Prisma client:**
   ```bash
   yarn db:generate
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   yarn install
   yarn db:generate
   ```

3. **Check Prisma schema:**
   ```bash
   npx prisma validate
   ```

## Authentication Issues

### Issue: "NextAuth configuration error"

**Symptoms:**
- Error: `[next-auth][error][CLIENT_FETCH_ERROR]`
- Authentication redirects fail
- Session not persisting

**Solutions:**

1. **Check NEXTAUTH_URL:**
   ```bash
   # Must match your domain exactly
   echo $NEXTAUTH_URL
   # Should be: http://localhost:3000 (dev) or https://yourdomain.com (prod)
   ```

2. **Verify NEXTAUTH_SECRET:**
   ```bash
   # Must be at least 32 characters
   node -e "console.log(process.env.NEXTAUTH_SECRET?.length || 0)"
   ```

3. **Generate new secret:**
   ```bash
   openssl rand -base64 32
   # Add to .env.local as NEXTAUTH_SECRET
   ```

4. **Clear browser cookies:**
   - Open browser dev tools
   - Go to Application/Storage tab
   - Clear all cookies for localhost:3000

### Issue: "OAuth provider errors"

**Symptoms:**
- OAuth redirect fails
- "Invalid client" errors
- OAuth callback errors

**Solutions:**

1. **Verify OAuth credentials:**
   ```bash
   # Check all OAuth environment variables are set
   env | grep -E "(GOOGLE|FACEBOOK|LINKEDIN)_CLIENT"
   ```

2. **Check redirect URIs:**
   - Google: `{NEXTAUTH_URL}/api/auth/callback/google`
   - Facebook: `{NEXTAUTH_URL}/api/auth/callback/facebook`
   - LinkedIn: `{NEXTAUTH_URL}/api/auth/callback/linkedin`

3. **Test OAuth configuration:**
   ```bash
   curl -I "http://localhost:3000/api/auth/signin/google"
   # Should return 302 redirect
   ```

### Issue: "Credential authentication fails"

**Symptoms:**
- Login with email/password fails
- "Invalid credentials" error
- Password hashing errors

**Solutions:**

1. **Check user exists in database:**
   ```bash
   yarn db:studio
   # Check users table
   ```

2. **Test password hashing:**
   ```bash
   node -e "
   const argon2 = require('argon2');
   argon2.hash('testpassword').then(console.log);
   "
   ```

3. **Reset user password:**
   ```bash
   # Use Prisma Studio or create migration script
   yarn db:studio
   ```

## OAuth Integration Issues

### Issue: "Token refresh fails"

**Symptoms:**
- Integration shows as "disconnected"
- API calls return 401 errors
- Token expiration errors

**Solutions:**

1. **Check token encryption:**
   ```bash
   # Verify ENCRYPTION_KEY is set and 32 characters
   node -e "console.log(process.env.ENCRYPTION_KEY?.length || 0)"
   ```

2. **Reconnect integration:**
   - Go to Settings > Integrations
   - Disconnect and reconnect the failing integration

3. **Check integration logs:**
   ```bash
   # Look for OAuth-related errors in console
   yarn dev
   ```

### Issue: "API rate limits exceeded"

**Symptoms:**
- 429 "Too Many Requests" errors
- Data sync fails
- API calls timeout

**Solutions:**

1. **Check rate limit status:**
   ```bash
   # Monitor API response headers
   curl -I "http://localhost:3000/api/integrations/status"
   ```

2. **Implement exponential backoff:**
   - Wait before retrying failed requests
   - Reduce sync frequency

3. **Contact platform support:**
   - Request higher rate limits
   - Verify API access permissions

## Build and Deployment Issues

### Issue: "Build fails with TypeScript errors"

**Symptoms:**
- `yarn build` fails
- TypeScript compilation errors
- Missing type definitions

**Solutions:**

1. **Check TypeScript configuration:**
   ```bash
   yarn type-check
   ```

2. **Update dependencies:**
   ```bash
   yarn upgrade
   ```

3. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   yarn build
   ```

4. **Fix type errors:**
   ```bash
   # Enable strict mode gradually
   # Check tsconfig.json settings
   ```

### Issue: "Build succeeds but runtime errors"

**Symptoms:**
- Build completes successfully
- Application crashes on startup
- Runtime environment errors

**Solutions:**

1. **Check environment variables:**
   ```bash
   # Ensure all required vars are set in production
   node scripts/verify-env.js
   ```

2. **Test production build locally:**
   ```bash
   yarn build
   yarn start
   ```

3. **Check server logs:**
   ```bash
   # Look for startup errors
   docker logs marketing-dashboard-app
   ```

### Issue: "Static file serving issues"

**Symptoms:**
- Images not loading
- CSS/JS files 404
- Static assets missing

**Solutions:**

1. **Check public directory:**
   ```bash
   ls -la public/
   ```

2. **Verify Next.js configuration:**
   ```bash
   # Check next.config.js
   cat next.config.js
   ```

3. **Clear build cache:**
   ```bash
   rm -rf .next
   rm -rf out
   yarn build
   ```

## Performance Issues

### Issue: "Slow page load times"

**Symptoms:**
- Pages take >3 seconds to load
- Large bundle sizes
- Poor Core Web Vitals

**Solutions:**

1. **Analyze bundle size:**
   ```bash
   # Install bundle analyzer
   yarn add -D @next/bundle-analyzer
   ANALYZE=true yarn build
   ```

2. **Enable performance monitoring:**
   ```bash
   # Check performance metrics
   yarn perf:test
   ```

3. **Optimize images:**
   ```bash
   # Use Next.js Image component
   # Compress images before upload
   ```

4. **Implement code splitting:**
   ```javascript
   // Use dynamic imports
   const Component = dynamic(() => import('./Component'))
   ```

### Issue: "Database query performance"

**Symptoms:**
- Slow API responses
- Database timeouts
- High CPU usage

**Solutions:**

1. **Add database indexes:**
   ```sql
   -- Check slow queries
   SELECT * FROM pg_stat_statements ORDER BY total_time DESC;
   ```

2. **Optimize Prisma queries:**
   ```typescript
   // Use select to limit fields
   // Implement pagination
   // Use includes efficiently
   ```

3. **Enable query logging:**
   ```bash
   # Add to .env.local
   DEBUG="prisma:query"
   ```

## API Issues

### Issue: "API endpoints return 500 errors"

**Symptoms:**
- Internal server errors
- API calls fail unexpectedly
- Error boundaries triggered

**Solutions:**

1. **Check API logs:**
   ```bash
   # Look for error stack traces
   yarn dev
   ```

2. **Test API endpoints:**
   ```bash
   curl -X GET "http://localhost:3000/api/dashboard/metrics" \
        -H "Cookie: next-auth.session-token=your-token"
   ```

3. **Validate request data:**
   ```bash
   # Check Zod validation schemas
   # Ensure request format matches schema
   ```

### Issue: "CORS errors"

**Symptoms:**
- Cross-origin request blocked
- Preflight request fails
- API calls from frontend fail

**Solutions:**

1. **Check ALLOWED_ORIGINS:**
   ```bash
   echo $ALLOWED_ORIGINS
   ```

2. **Update CORS configuration:**
   ```javascript
   // In next.config.js
   async headers() {
     return [
       {
         source: '/api/(.*)',
         headers: [
           {
             key: 'Access-Control-Allow-Origin',
             value: process.env.ALLOWED_ORIGINS || '*'
           }
         ]
       }
     ]
   }
   ```

## Environment Configuration Issues

### Issue: "Environment variables not loading"

**Symptoms:**
- `process.env.VARIABLE` returns undefined
- Configuration errors
- Missing API keys

**Solutions:**

1. **Check file naming:**
   ```bash
   # Must be .env.local (not .env)
   ls -la .env*
   ```

2. **Verify variable format:**
   ```bash
   # No spaces around = sign
   # Use quotes for values with spaces
   VARIABLE="value with spaces"
   ```

3. **Restart development server:**
   ```bash
   # Environment changes require restart
   yarn dev
   ```

4. **Check variable scope:**
   ```javascript
   // Client-side variables must start with NEXT_PUBLIC_
   NEXT_PUBLIC_API_URL="https://api.example.com"
   ```

### Issue: "Environment validation fails"

**Symptoms:**
- Application won't start
- Zod validation errors
- Missing required variables

**Solutions:**

1. **Run environment check:**
   ```bash
   node -e "
   const { env } = require('./lib/env');
   console.log('Environment validation passed');
   "
   ```

2. **Check required variables:**
   ```bash
   # Compare .env.local with .env.example
   diff .env.local .env.example
   ```

3. **Generate missing secrets:**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32

   # Generate ENCRYPTION_KEY
   openssl rand -hex 16
   ```

## Docker Issues

### Issue: "Docker containers won't start"

**Symptoms:**
- `docker-compose up` fails
- Container exits immediately
- Port binding errors

**Solutions:**

1. **Check port conflicts:**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :5432
   ```

2. **View container logs:**
   ```bash
   docker-compose logs app
   docker-compose logs db
   ```

3. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

4. **Clean Docker cache:**
   ```bash
   docker system prune -a
   docker volume prune
   ```

### Issue: "Database connection in Docker"

**Symptoms:**
- App can't connect to database
- Connection refused errors
- Network issues

**Solutions:**

1. **Check Docker network:**
   ```bash
   docker network ls
   docker network inspect marketing-dashboard_default
   ```

2. **Use correct hostname:**
   ```bash
   # In Docker, use service name as hostname
   DATABASE_URL="postgresql://postgres:password@db:5432/marketing_dashboard"
   ```

3. **Wait for database:**
   ```bash
   # Add health checks to docker-compose.yml
   depends_on:
     db:
       condition: service_healthy
   ```

## Migration Issues

### Issue: "Supabase data export fails"

**Symptoms:**
- Export script errors
- Missing data
- Authentication failures

**Solutions:**

1. **Check Supabase credentials:**
   ```bash
   # Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   yarn migrate:export --dry-run
   ```

2. **Test Supabase connection:**
   ```bash
   curl -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        "$SUPABASE_URL/rest/v1/users?select=*&limit=1"
   ```

3. **Export data in batches:**
   ```bash
   # Modify export script to handle large datasets
   yarn migrate:export --batch-size=1000
   ```

### Issue: "Data transformation errors"

**Symptoms:**
- Transform script fails
- Data format mismatches
- Missing relationships

**Solutions:**

1. **Validate exported data:**
   ```bash
   # Check data-export/ directory
   ls -la data-export/
   node -e "console.log(JSON.parse(require('fs').readFileSync('data-export/users.json')))"
   ```

2. **Run transformation step by step:**
   ```bash
   yarn migrate:transform --table=users
   yarn migrate:transform --table=clients
   ```

3. **Check transformation logs:**
   ```bash
   # Look for transformation errors
   cat data-transformed/transformation_summary.json
   ```

## Frequently Asked Questions

### Q: How do I reset everything and start fresh?

**A:** Complete reset procedure:

```bash
# Stop all services
yarn db:stop
docker-compose down

# Remove data
rm -rf node_modules
rm -rf .next
docker volume prune -f

# Reinstall
yarn install
yarn db:start
yarn db:reset
yarn dev
```

### Q: How do I update to a new version?

**A:** Update procedure:

```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Update code
git pull origin main
yarn install

# Run migrations
yarn db:migrate
yarn db:generate

# Test
yarn test:unit
yarn build
```

### Q: How do I enable debug logging?

**A:** Add to `.env.local`:

```bash
DEBUG="true"
LOG_LEVEL="debug"
PRISMA_DEBUG="true"
```

### Q: How do I check if OAuth is configured correctly?

**A:** Test OAuth configuration:

```bash
# Test Google OAuth
curl -I "http://localhost:3000/api/auth/signin/google"

# Should return 302 redirect to Google
# Check redirect URL includes correct callback
```

### Q: How do I monitor application performance?

**A:** Performance monitoring:

```bash
# Run performance tests
yarn perf:test

# Check bundle size
ANALYZE=true yarn build

# Monitor database queries
DEBUG="prisma:query" yarn dev
```

### Q: How do I backup and restore data?

**A:** Backup/restore procedure:

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20240115.sql

# Or use Prisma
yarn db:seed
```

### Q: How do I deploy to production?

**A:** See the [Production Deployment Checklist](#production-deployment-checklist) section.

### Q: How do I troubleshoot OAuth integration issues?

**A:** OAuth debugging steps:

1. Check OAuth app configuration in provider console
2. Verify redirect URIs match exactly
3. Test OAuth flow manually
4. Check token encryption/decryption
5. Monitor API rate limits
6. Review integration logs

### Q: What should I do if the application is slow?

**A:** Performance optimization:

1. Run performance tests: `yarn perf:test`
2. Analyze bundle size: `ANALYZE=true yarn build`
3. Check database query performance
4. Optimize images and static assets
5. Implement caching strategies
6. Monitor Core Web Vitals

### Q: How do I get help if I'm still stuck?

**A:** Support resources:

1. Check this troubleshooting guide
2. Review error logs carefully
3. Search GitHub issues
4. Check Next.js documentation
5. Review Prisma documentation
6. Contact support with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Log files

## Getting Additional Help

If you're still experiencing issues after following this guide:

1. **Gather information:**
   - Error messages (full stack traces)
   - Steps to reproduce the issue
   - Environment details (OS, Node version, etc.)
   - Relevant log files

2. **Check documentation:**
   - [Next.js Documentation](https://nextjs.org/docs)
   - [Prisma Documentation](https://www.prisma.io/docs)
   - [NextAuth.js Documentation](https://next-auth.js.org)

3. **Search existing issues:**
   - GitHub repository issues
   - Stack Overflow
   - Community forums

4. **Create a support ticket:**
   - Include all gathered information
   - Provide minimal reproduction case
   - Specify urgency level

Remember: Most issues are environment-related or configuration problems. Double-check your `.env.local` file and ensure all required services are running.