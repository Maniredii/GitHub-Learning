# GitQuest Production Deployment Checklist

Use this checklist to ensure all steps are completed before and after deploying to production.

## Pre-Deployment

### Infrastructure Setup
- [ ] PostgreSQL database provisioned and configured
- [ ] Redis cache provisioned and configured
- [ ] Database backups enabled (7-day retention minimum)
- [ ] SSL certificates obtained and configured
- [ ] Domain names configured (DNS records)
- [ ] Security groups/firewall rules configured
- [ ] VPC/networking configured (if using AWS)

### Environment Variables

#### Backend
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_HOST` configured
- [ ] `DATABASE_NAME` configured
- [ ] `DATABASE_USER` configured
- [ ] `DATABASE_PASSWORD` configured (strong password)
- [ ] `JWT_SECRET` configured (cryptographically random)
- [ ] `CORS_ORIGIN` configured (frontend URL)
- [ ] `STRIPE_SECRET_KEY` configured (live key)
- [ ] `STRIPE_WEBHOOK_SECRET` configured
- [ ] `REDIS_URL` configured
- [ ] `SENTRY_DSN` configured (optional but recommended)

#### Frontend
- [ ] `VITE_API_URL` configured (backend URL)
- [ ] `VITE_ENV=production`
- [ ] `VITE_STRIPE_PUBLIC_KEY` configured (live key)
- [ ] `VITE_SENTRY_DSN` configured (optional but recommended)

### Code Preparation
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Security vulnerabilities addressed
- [ ] Dependencies updated (no critical vulnerabilities)
- [ ] Build succeeds locally
- [ ] Linting passes

### Database
- [ ] Migrations tested in staging
- [ ] Seed data prepared
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] SSL connection enforced

### Monitoring Setup
- [ ] Sentry projects created (frontend + backend)
- [ ] APM tool configured (Datadog/New Relic)
- [ ] Uptime monitoring configured (UptimeRobot/Pingdom)
- [ ] Log aggregation configured
- [ ] Alert rules configured
- [ ] Alert notification channels configured
- [ ] Status page created (optional)

### Security
- [ ] Passwords are strong (32+ characters)
- [ ] Secrets stored securely (not in code)
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] Security headers configured
- [ ] Database not publicly accessible
- [ ] Redis requires authentication

## Deployment Steps

### 1. Backend Deployment

#### Build Docker Image
```bash
cd backend
docker build -t gitquest-backend:latest -f Dockerfile ..
```

#### Test Docker Image Locally
```bash
docker run -p 3000:3000 \
  -e DATABASE_HOST=localhost \
  -e DATABASE_NAME=gitquest \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=password \
  -e JWT_SECRET=test-secret \
  -e REDIS_URL=redis://localhost:6379 \
  gitquest-backend:latest

curl http://localhost:3000/health
```

#### Deploy to Platform
- [ ] Push Docker image to registry (ECR/Docker Hub)
- [ ] Deploy to platform (Heroku/AWS ECS/DigitalOcean)
- [ ] Verify deployment succeeded
- [ ] Check logs for errors

#### Run Database Migrations
```bash
# Heroku
heroku run npm run migrate:latest --workspace=backend -a gitquest-backend

# AWS ECS
aws ecs execute-command --cluster gitquest-production \
  --task <task-id> --container gitquest-backend --interactive \
  --command "npm run migrate:latest --workspace=backend"

# DigitalOcean
doctl apps exec <app-id> --component api -- npm run migrate:latest --workspace=backend
```

#### Seed Initial Data
```bash
# Run seed scripts for chapters, quests, achievements, boss battles
heroku run node backend/run-seeds.js -a gitquest-backend
```

### 2. Frontend Deployment

#### Build Production Bundle
```bash
cd frontend
npm run build
```

#### Test Build Locally
```bash
npm run preview
```

#### Deploy to Platform
- [ ] Deploy to Vercel/Netlify/CloudFront
- [ ] Verify deployment succeeded
- [ ] Check for build errors

#### Configure Custom Domain
- [ ] Add custom domain in platform settings
- [ ] Update DNS records
- [ ] Verify SSL certificate issued
- [ ] Test HTTPS access

### 3. Post-Deployment Verification

#### Backend Tests
- [ ] Health check responds: `curl https://api.gitquest.yourdomain.com/health`
- [ ] API root responds: `curl https://api.gitquest.yourdomain.com/api`
- [ ] Metrics endpoint responds: `curl https://api.gitquest.yourdomain.com/metrics`
- [ ] Database connection verified (check health response)
- [ ] Redis connection verified (check health response)
- [ ] Authentication works (test login/register)
- [ ] Git commands execute (test via API)
- [ ] Quests load correctly
- [ ] Progress tracking works
- [ ] Achievements award correctly
- [ ] Payment processing works (test mode first)

#### Frontend Tests
- [ ] Homepage loads: `https://gitquest.yourdomain.com`
- [ ] No console errors
- [ ] Registration works
- [ ] Login works
- [ ] Terminal renders correctly
- [ ] Code editor works
- [ ] Git graph displays
- [ ] Quest navigation works
- [ ] Progress map displays
- [ ] Payment modal works
- [ ] Mobile responsive (test on phone)
- [ ] Cross-browser compatible (Chrome, Firefox, Safari)

#### Performance Tests
- [ ] Lighthouse score > 90
- [ ] API response time p95 < 500ms
- [ ] Frontend load time < 3 seconds
- [ ] No memory leaks detected
- [ ] Database queries optimized

#### Security Tests
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers present
- [ ] CORS configured correctly
- [ ] Authentication required for protected routes
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] Rate limiting works

### 4. Monitoring Verification

- [ ] Sentry receiving events
- [ ] APM showing metrics
- [ ] Uptime monitors active
- [ ] Logs being collected
- [ ] Alerts configured and tested
- [ ] Status page updated (if applicable)

### 5. Documentation

- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Update API documentation
- [ ] Create runbooks for common issues
- [ ] Document rollback procedures
- [ ] Update architecture diagrams

## Post-Deployment

### Immediate (First Hour)
- [ ] Monitor error rates in Sentry
- [ ] Monitor response times in APM
- [ ] Check logs for errors
- [ ] Verify uptime monitors are green
- [ ] Test critical user flows
- [ ] Announce deployment to team

### First Day
- [ ] Monitor user feedback
- [ ] Check analytics for anomalies
- [ ] Review error rates
- [ ] Check database performance
- [ ] Verify backups are running
- [ ] Monitor resource usage

### First Week
- [ ] Review incident reports
- [ ] Analyze performance metrics
- [ ] Check for memory leaks
- [ ] Review user feedback
- [ ] Optimize slow queries
- [ ] Update documentation based on learnings

## Rollback Procedures

### Backend Rollback
```bash
# Heroku
heroku rollback -a gitquest-backend

# AWS ECS
aws ecs update-service --cluster gitquest-production \
  --service gitquest-backend \
  --task-definition gitquest-backend:<previous-version>

# DigitalOcean
doctl apps create-deployment <app-id> --deployment-id <previous-deployment-id>
```

### Frontend Rollback
```bash
# Vercel
vercel rollback <deployment-url>

# Netlify
netlify deploy:restore <deploy-id>

# CloudFront + S3
aws s3 sync s3://gitquest-frontend-backup/ s3://gitquest-frontend/
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
```

### Database Rollback
```bash
# Rollback migration
npm run migrate:rollback --workspace=backend

# Restore from backup (if needed)
# Follow platform-specific backup restoration procedures
```

## Emergency Contacts

- **Team Lead**: [phone/email]
- **DevOps**: [phone/email]
- **Database Admin**: [phone/email]
- **AWS Support**: [support plan details]
- **Heroku Support**: [support plan details]
- **Stripe Support**: [support details]

## Maintenance Windows

- **Preferred**: Sundays 2:00 AM - 4:00 AM EST
- **Notification**: 48 hours advance notice
- **Status Page**: Update before maintenance

## Success Criteria

Deployment is considered successful when:
- [ ] All health checks passing
- [ ] Error rate < 0.1%
- [ ] Response time p95 < 500ms
- [ ] No critical bugs reported
- [ ] All critical user flows working
- [ ] Monitoring showing normal metrics
- [ ] No rollback required for 24 hours

## Notes

- Always test in staging before production
- Have rollback plan ready before deploying
- Monitor closely for first hour after deployment
- Document any issues encountered
- Update this checklist based on learnings

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: _______________
**Rollback Plan**: _______________
**Notes**: _______________
