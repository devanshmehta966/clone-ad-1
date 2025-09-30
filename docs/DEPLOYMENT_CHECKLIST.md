# Production Deployment Checklist

This comprehensive checklist ensures a successful and secure production deployment of the Marketing Dashboard application.

## Pre-Deployment Checklist

### ✅ Code Quality and Testing

- [ ] **All tests pass**
  ```bash
  yarn test:ci
  yarn test:integration
  yarn test:visual
  ```

- [ ] **Code quality checks pass**
  ```bash
  yarn lint
  yarn type-check
  yarn build
  ```

- [ ] **Security audit passes**
  ```bash
  yarn security:check
  yarn security:audit
  ```

- [ ] **Performance tests pass**
  ```bash
  yarn perf:test
  ```

- [ ] **Visual regression tests updated**
  ```bash
  yarn test:visual:update
  ```

### ✅ Environment Configuration

- [ ] **Production environment variables configured**
  - [ ] `NODE_ENV=production`
  - [ ] `NEXTAUTH_URL` set to production domain
  - [ ] `NEXTAUTH_SECRET` generated (32+ characters)
  - [ ] `DATABASE_URL` points to production database
  - [ ] `ENCRYPTION_KEY` generated (32 characters)
  - [ ] All OAuth credentials configured for production
  - [ ] API keys for integrations configured
  - [ ] `ALLOWED_ORIGINS` includes production domain

- [ ] **Environment validation passes**
  ```bash
  NODE_ENV=production node -e "require('./lib/env')"
  ```

- [ ] **Secrets management configured**
  - [ ] No secrets in version control
  - [ ] Secrets stored in secure vault (AWS Secrets Manager, etc.)
  - [ ] Environment-specific secrets configured

### ✅ Database Preparation

- [ ] **Production database provisioned**
  - [ ] PostgreSQL 15+ instance created
  - [ ] Connection pooling configured
  - [ ] Backup strategy implemented
  - [ ] Monitoring enabled

- [ ] **Database migrations ready**
  ```bash
  yarn db:migrate:prod
  ```

- [ ] **Database seeding (if needed)**
  ```bash
  yarn db:seed:prod
  ```

- [ ] **Database performance optimized**
  - [ ] Indexes created for frequent queries
  - [ ] Connection pool sized appropriately
  - [ ] Query performance tested

### ✅ OAuth Provider Configuration

- [ ] **Google OAuth configured**
  - [ ] Production redirect URI added: `https://yourdomain.com/api/auth/callback/google`
  - [ ] Domain verification completed
  - [ ] OAuth consent screen configured

- [ ] **Facebook OAuth configured**
  - [ ] Production redirect URI added: `https://yourdomain.com/api/auth/callback/facebook`
  - [ ] App review completed (if required)
  - [ ] Privacy policy URL configured

- [ ] **LinkedIn OAuth configured**
  - [ ] Production redirect URI added: `https://yourdomain.com/api/auth/callback/linkedin`
  - [ ] App verification completed

### ✅ API Integration Setup

- [ ] **Google Ads API configured**
  - [ ] Developer token approved for production
  - [ ] OAuth credentials configured
  - [ ] Rate limits understood and configured

- [ ] **Meta Ads API configured**
  - [ ] Business verification completed
  - [ ] App review for ads_read permission
  - [ ] Rate limits configured

- [ ] **LinkedIn Ads API configured**
  - [ ] Marketing API access approved
  - [ ] Rate limits configured

- [ ] **Google Analytics API configured**
  - [ ] Service account created (if needed)
  - [ ] Analytics properties configured

## Deployment Options

### Option 1: Vercel Deployment

#### ✅ Vercel Setup

- [ ] **Vercel project configured**
  ```bash
  yarn deploy:vercel
  ```

- [ ] **Environment variables configured in Vercel dashboard**
  - [ ] All production environment variables added
  - [ ] Database URL configured
  - [ ] OAuth credentials configured

- [ ] **Domain configured**
  - [ ] Custom domain added
  - [ ] SSL certificate configured
  - [ ] DNS records updated

- [ ] **Build settings optimized**
  - [ ] Build command: `yarn build`
  - [ ] Output directory: `.next`
  - [ ] Node.js version: 18.x

#### ✅ Vercel Post-Deployment

- [ ] **Database migrations run**
  ```bash
  # Run from Vercel CLI or dashboard
  vercel env pull .env.production
  yarn db:migrate:prod
  ```

- [ ] **Function limits checked**
  - [ ] Serverless function timeout configured
  - [ ] Memory limits appropriate
  - [ ] Edge function usage optimized

### Option 2: Docker Deployment

#### ✅ Docker Setup

- [ ] **Docker images built**
  ```bash
  yarn docker:build
  ```

- [ ] **Docker Compose configured**
  ```bash
  # Copy and configure
  cp docker-compose.prod.yml docker-compose.yml
  ```

- [ ] **Environment file configured**
  ```bash
  # Create production environment file
  cp .env.example .env.production
  # Fill in production values
  ```

- [ ] **SSL certificates configured**
  - [ ] SSL certificates obtained (Let's Encrypt, etc.)
  - [ ] Certificates mounted in nginx container
  - [ ] HTTPS redirect configured

#### ✅ Docker Deployment

- [ ] **Deploy to production**
  ```bash
  yarn docker:prod:build
  ```

- [ ] **Database migrations run**
  ```bash
  docker-compose exec app yarn db:migrate:prod
  ```

- [ ] **Health checks pass**
  ```bash
  curl https://yourdomain.com/health
  ```

### Option 3: AWS/Cloud Deployment

#### ✅ AWS Setup (if using AWS)

- [ ] **RDS PostgreSQL configured**
  - [ ] Instance provisioned
  - [ ] Security groups configured
  - [ ] Backup enabled

- [ ] **ElastiCache Redis configured** (optional)
  - [ ] Instance provisioned
  - [ ] Security groups configured

- [ ] **ECS/EKS configured**
  - [ ] Container definitions created
  - [ ] Load balancer configured
  - [ ] Auto-scaling configured

- [ ] **Secrets Manager configured**
  - [ ] All secrets stored securely
  - [ ] IAM roles configured

## Post-Deployment Verification

### ✅ Functional Testing

- [ ] **Application loads successfully**
  ```bash
  curl -I https://yourdomain.com
  # Should return 200 OK
  ```

- [ ] **Authentication works**
  - [ ] Sign up with credentials
  - [ ] Sign in with credentials
  - [ ] OAuth sign in (Google, Facebook, LinkedIn)
  - [ ] Session persistence

- [ ] **API endpoints respond**
  ```bash
  # Test key endpoints
  curl https://yourdomain.com/api/health
  curl https://yourdomain.com/api/dashboard/metrics
  ```

- [ ] **Database connectivity**
  - [ ] Data reads successfully
  - [ ] Data writes successfully
  - [ ] Migrations applied correctly

- [ ] **OAuth integrations work**
  - [ ] Can connect to Google Ads
  - [ ] Can connect to Meta Ads
  - [ ] Can connect to LinkedIn Ads
  - [ ] Token refresh works

### ✅ Performance Testing

- [ ] **Page load times acceptable**
  - [ ] First Contentful Paint < 2s
  - [ ] Largest Contentful Paint < 4s
  - [ ] Time to Interactive < 5s

- [ ] **API response times acceptable**
  - [ ] Dashboard metrics < 1s
  - [ ] Client operations < 500ms
  - [ ] Report generation < 10s

- [ ] **Database performance acceptable**
  - [ ] Query response times < 100ms
  - [ ] Connection pool not exhausted
  - [ ] No slow query alerts

### ✅ Security Verification

- [ ] **HTTPS configured correctly**
  ```bash
  curl -I https://yourdomain.com
  # Check for security headers
  ```

- [ ] **Security headers present**
  - [ ] `Strict-Transport-Security`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Content-Security-Policy`

- [ ] **Rate limiting works**
  ```bash
  # Test rate limits on auth endpoints
  for i in {1..10}; do curl https://yourdomain.com/api/auth/signin; done
  ```

- [ ] **OAuth security**
  - [ ] Redirect URIs validated
  - [ ] State parameter validated
  - [ ] PKCE implemented (where supported)

### ✅ Monitoring Setup

- [ ] **Application monitoring configured**
  - [ ] Error tracking (Sentry, etc.)
  - [ ] Performance monitoring
  - [ ] Uptime monitoring

- [ ] **Database monitoring configured**
  - [ ] Connection pool monitoring
  - [ ] Query performance monitoring
  - [ ] Backup monitoring

- [ ] **Infrastructure monitoring configured**
  - [ ] Server resource monitoring
  - [ ] Network monitoring
  - [ ] SSL certificate expiry monitoring

- [ ] **Alerting configured**
  - [ ] Error rate alerts
  - [ ] Performance degradation alerts
  - [ ] Uptime alerts
  - [ ] Security incident alerts

## Production Maintenance

### ✅ Backup Strategy

- [ ] **Database backups configured**
  - [ ] Automated daily backups
  - [ ] Point-in-time recovery enabled
  - [ ] Backup retention policy set
  - [ ] Backup restoration tested

- [ ] **Application backups configured**
  - [ ] Code repository backed up
  - [ ] Environment configuration backed up
  - [ ] SSL certificates backed up

### ✅ Update Strategy

- [ ] **Deployment pipeline configured**
  - [ ] CI/CD pipeline set up
  - [ ] Automated testing in pipeline
  - [ ] Blue-green deployment (if applicable)
  - [ ] Rollback strategy defined

- [ ] **Dependency updates**
  - [ ] Security update process defined
  - [ ] Regular dependency audits scheduled
  - [ ] Update testing process defined

### ✅ Scaling Preparation

- [ ] **Horizontal scaling configured**
  - [ ] Load balancer configured
  - [ ] Session storage externalized
  - [ ] Database connection pooling

- [ ] **Vertical scaling limits known**
  - [ ] Resource limits documented
  - [ ] Scaling triggers defined
  - [ ] Performance baselines established

## Security Hardening

### ✅ Application Security

- [ ] **Input validation enabled**
  - [ ] All API inputs validated with Zod
  - [ ] SQL injection prevention (Prisma)
  - [ ] XSS prevention enabled

- [ ] **Authentication security**
  - [ ] Password hashing with argon2id
  - [ ] Session security configured
  - [ ] Rate limiting on auth endpoints

- [ ] **API security**
  - [ ] CORS configured properly
  - [ ] API rate limiting enabled
  - [ ] Request/response sanitization

### ✅ Infrastructure Security

- [ ] **Network security**
  - [ ] Firewall rules configured
  - [ ] VPC/network isolation (if applicable)
  - [ ] DDoS protection enabled

- [ ] **Access control**
  - [ ] Principle of least privilege
  - [ ] Service accounts configured
  - [ ] SSH key management

- [ ] **Data encryption**
  - [ ] Data at rest encrypted
  - [ ] Data in transit encrypted (HTTPS)
  - [ ] Sensitive data encrypted in database

## Go-Live Checklist

### ✅ Final Pre-Launch

- [ ] **All stakeholders notified**
  - [ ] Development team ready
  - [ ] Operations team ready
  - [ ] Support team ready

- [ ] **Documentation updated**
  - [ ] Deployment documentation
  - [ ] Runbook updated
  - [ ] Support documentation

- [ ] **Rollback plan ready**
  - [ ] Rollback procedure documented
  - [ ] Database rollback plan
  - [ ] DNS rollback plan

### ✅ Launch Day

- [ ] **Deploy to production**
  ```bash
  # Final deployment
  yarn deploy:check
  yarn deploy:prod
  ```

- [ ] **Verify deployment**
  - [ ] All health checks pass
  - [ ] Critical user journeys tested
  - [ ] Performance metrics normal

- [ ] **Monitor closely**
  - [ ] Error rates normal
  - [ ] Response times acceptable
  - [ ] User feedback positive

### ✅ Post-Launch

- [ ] **24-hour monitoring**
  - [ ] No critical errors
  - [ ] Performance stable
  - [ ] User adoption tracking

- [ ] **Documentation updated**
  - [ ] Production URLs documented
  - [ ] Support procedures updated
  - [ ] Lessons learned documented

## Emergency Procedures

### 🚨 Rollback Procedure

If critical issues are discovered:

1. **Immediate rollback**
   ```bash
   # Vercel
   vercel rollback

   # Docker
   docker-compose down
   docker-compose up -d --scale app=0
   # Deploy previous version
   ```

2. **Database rollback** (if needed)
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup-pre-deployment.sql
   ```

3. **DNS rollback** (if needed)
   - Revert DNS changes
   - Update CDN configuration

### 🚨 Incident Response

1. **Assess impact**
   - Check error rates
   - Check user impact
   - Check data integrity

2. **Communicate**
   - Notify stakeholders
   - Update status page
   - Prepare user communication

3. **Fix and verify**
   - Apply hotfix
   - Test thoroughly
   - Monitor closely

## Deployment Sign-off

### ✅ Final Approval

- [ ] **Technical lead approval**
  - [ ] Code review completed
  - [ ] Architecture review completed
  - [ ] Security review completed

- [ ] **Operations approval**
  - [ ] Infrastructure ready
  - [ ] Monitoring configured
  - [ ] Support procedures ready

- [ ] **Business approval**
  - [ ] User acceptance testing completed
  - [ ] Business requirements met
  - [ ] Go-live approval granted

---

**Deployment Date:** _______________

**Deployed by:** _______________

**Approved by:** _______________

**Production URL:** _______________

**Rollback Contact:** _______________

---

## Post-Deployment Notes

Use this space to document any issues encountered during deployment and their resolutions:

```
Date: 
Issue: 
Resolution: 
Impact: 
```

Remember: A successful deployment is not just about getting the code live, but ensuring it runs reliably, securely, and performantly in production.