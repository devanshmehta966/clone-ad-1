# Utility Scripts

This directory contains utility scripts for the marketing dashboard application.

## Available Scripts

### Security Testing
```bash
yarn security:test
```
Runs security tests to check for vulnerabilities and security best practices.

### Performance Testing
```bash
yarn perf:test
```
Runs performance tests to measure application performance metrics.

### Database Initialization
```bash
# Initialize database with schema
yarn db:push

# Seed database with sample data
yarn db:seed
```

## Scripts Overview

| Script | Purpose | Usage |
|--------|---------|-------|
| `security-test.js` | Security vulnerability testing | `yarn security:test` |
| `test-performance.js` | Performance benchmarking | `yarn perf:test` |
| `init-db.sql` | Database initialization SQL | Used by Docker setup |

## Prerequisites

1. Ensure environment variables are set:
   ```bash
   DATABASE_URL=postgresql://username:password@localhost:5432/database
   NEXTAUTH_SECRET=your-secret-key
   ```

2. Ensure database is running:
   ```bash
   docker-compose up -d
   ```

3. Apply Prisma schema:
   ```bash
   yarn db:push
   ```

## Output Files

- `security-test-report.json` - Security test results
- `performance-test-report.json` - Performance test results

## Development Workflow

1. **Database Setup**: Use `init-db.sql` for initial database setup
2. **Security**: Run `security-test.js` before deployments
3. **Performance**: Use `test-performance.js` to monitor performance regressions