# GitQuest Deployment Guide

This directory contains all deployment-related documentation and configuration files for GitQuest.

## Quick Start

1. **Infrastructure Setup**: Follow [../infrastructure/README.md](../infrastructure/README.md)
2. **Backend Deployment**: Follow [backend-deployment.md](backend-deployment.md)
3. **Frontend Deployment**: Follow [frontend-deployment.md](frontend-deployment.md)
4. **Monitoring Setup**: Follow [../monitoring/README.md](../monitoring/README.md)
5. **Use Checklist**: Follow [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

## Files in This Directory

### Documentation
- **README.md** (this file) - Overview of deployment process
- **backend-deployment.md** - Detailed backend deployment guide
- **frontend-deployment.md** - Detailed frontend deployment guide
- **DEPLOYMENT_CHECKLIST.md** - Pre/post deployment checklist

### Configuration Files
- **heroku.yml** - Heroku container deployment configuration
- **docker-compose.prod.yml** - Production-like Docker Compose setup for testing
- **.github/workflows/deploy-backend.yml** - GitHub Actions workflow for backend
- **.github/workflows/deploy-frontend.yml** - GitHub Actions workflow for frontend

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CDN (Vercel/Netlify)                      │
│                   Frontend Static Assets                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Load Balancer (ALB/Platform)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend API Instances                         │
│              (Auto-scaling 2-10 instances)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌───────────────────────┐   ┌───────────────────────┐
│  PostgreSQL Database  │   │    Redis Cache        │
│   (AWS RDS/Managed)   │   │  (ElastiCache/Cloud)  │
└───────────────────────┘   └───────────────────────┘
```

## Deployment Options

### Option 1: Heroku (Easiest)
- **Pros**: Simple setup, automatic SSL, easy scaling
- **Cons**: More expensive at scale
- **Best for**: MVP, small to medium traffic
- **Cost**: ~$50-100/month

### Option 2: AWS (Most Flexible)
- **Pros**: Full control, cost-effective at scale
- **Cons**: More complex setup
- **Best for**: Production, high traffic
- **Cost**: ~$150-200/month

### Option 3: DigitalOcean (Balanced)
- **Pros**: Good balance of simplicity and control
- **Cons**: Less features than AWS
- **Best for**: Growing applications
- **Cost**: ~$70-120/month

### Option 4: Vercel + Heroku (Recommended for MVP)
- **Frontend**: Vercel (free tier)
- **Backend**: Heroku (hobby tier)
- **Database**: Heroku Postgres
- **Redis**: Heroku Redis
- **Cost**: ~$50/month

## Environment Variables

### Backend Required
```bash
NODE_ENV=production
DATABASE_HOST=<db-host>
DATABASE_NAME=gitquest_production
DATABASE_USER=<db-user>
DATABASE_PASSWORD=<secure-password>
JWT_SECRET=<random-32-char-string>
CORS_ORIGIN=https://gitquest.yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
REDIS_URL=redis://...
```

### Frontend Required
```bash
VITE_API_URL=https://api.gitquest.yourdomain.com
VITE_ENV=production
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### Optional (Monitoring)
```bash
# Backend
SENTRY_DSN=https://...@sentry.io/...
DD_API_KEY=<datadog-api-key>
NEW_RELIC_LICENSE_KEY=<newrelic-key>

# Frontend
VITE_SENTRY_DSN=https://...@sentry.io/...
```

## Deployment Workflow

### Manual Deployment

1. **Test Locally**
   ```bash
   # Backend
   cd backend
   npm run build
   npm start
   
   # Frontend
   cd frontend
   npm run build
   npm run preview
   ```

2. **Deploy Backend**
   ```bash
   # Build Docker image
   docker build -t gitquest-backend -f backend/Dockerfile .
   
   # Push to registry
   docker tag gitquest-backend <registry>/gitquest-backend
   docker push <registry>/gitquest-backend
   
   # Deploy to platform
   # (Platform-specific commands)
   ```

3. **Run Migrations**
   ```bash
   # On production server
   npm run migrate:latest --workspace=backend
   node backend/run-seeds.js
   ```

4. **Deploy Frontend**
   ```bash
   cd frontend
   npm run build
   
   # Deploy to Vercel
   vercel --prod
   
   # Or deploy to Netlify
   netlify deploy --prod
   ```

5. **Verify Deployment**
   ```bash
   # Check health
   curl https://api.gitquest.yourdomain.com/health
   
   # Check frontend
   curl https://gitquest.yourdomain.com
   ```

### Automated Deployment (CI/CD)

GitHub Actions workflows are configured for automatic deployment:

1. **Backend**: `.github/workflows/deploy-backend.yml`
   - Triggers on push to `main` branch (backend changes)
   - Builds Docker image
   - Pushes to ECR
   - Deploys to ECS

2. **Frontend**: `.github/workflows/deploy-frontend.yml`
   - Triggers on push to `main` branch (frontend changes)
   - Builds production bundle
   - Deploys to S3
   - Invalidates CloudFront cache

**Setup Required**:
- Add GitHub secrets for AWS credentials
- Configure repository settings
- Test with staging environment first

## Database Migrations

### Running Migrations

```bash
# Development
npm run migrate:latest --workspace=backend

# Production (Heroku)
heroku run npm run migrate:latest --workspace=backend -a gitquest-backend

# Production (AWS ECS)
aws ecs execute-command \
  --cluster gitquest-production \
  --task <task-id> \
  --container gitquest-backend \
  --interactive \
  --command "npm run migrate:latest --workspace=backend"
```

### Creating Migrations

```bash
npm run migrate:make migration_name --workspace=backend
```

### Rollback Migrations

```bash
npm run migrate:rollback --workspace=backend
```

## Monitoring

### Health Checks

- **Backend**: `https://api.gitquest.yourdomain.com/health`
- **Readiness**: `https://api.gitquest.yourdomain.com/ready`
- **Metrics**: `https://api.gitquest.yourdomain.com/metrics`

### Monitoring Tools

1. **Sentry** - Error tracking
   - Frontend: https://sentry.io/organizations/.../projects/gitquest-frontend
   - Backend: https://sentry.io/organizations/.../projects/gitquest-backend

2. **Datadog/New Relic** - APM
   - Dashboard: [Your APM URL]

3. **UptimeRobot** - Uptime monitoring
   - Status: [Your status page URL]

## Rollback Procedures

### Backend Rollback

```bash
# Heroku
heroku rollback -a gitquest-backend

# AWS ECS
aws ecs update-service \
  --cluster gitquest-production \
  --service gitquest-backend \
  --task-definition gitquest-backend:<previous-version>
```

### Frontend Rollback

```bash
# Vercel
vercel rollback <deployment-url>

# Netlify
netlify deploy:restore <deploy-id>
```

### Database Rollback

```bash
# Rollback last migration
npm run migrate:rollback --workspace=backend

# Restore from backup (if needed)
# Follow platform-specific procedures
```

## Troubleshooting

### Backend Won't Start

1. Check logs: `heroku logs --tail -a gitquest-backend`
2. Verify environment variables are set
3. Test database connection
4. Check for migration errors

### Frontend Not Loading

1. Check browser console for errors
2. Verify API URL is correct
3. Check CORS configuration
4. Clear CDN cache

### Database Connection Errors

1. Verify database is running
2. Check security group rules
3. Verify SSL configuration
4. Test connection from backend server

### High Error Rates

1. Check Sentry for error details
2. Review recent deployments
3. Check database performance
4. Review API logs

## Security Checklist

- [ ] All secrets stored securely (not in code)
- [ ] HTTPS enforced
- [ ] Database requires SSL
- [ ] Database not publicly accessible
- [ ] Strong passwords (32+ characters)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular security updates
- [ ] Backups enabled and tested

## Performance Optimization

- [ ] Database indexes created
- [ ] Redis caching enabled
- [ ] CDN configured for static assets
- [ ] Gzip/Brotli compression enabled
- [ ] Image optimization
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Service worker for offline support

## Cost Optimization

- [ ] Right-size instances (don't over-provision)
- [ ] Use auto-scaling (scale down during low traffic)
- [ ] Enable database connection pooling
- [ ] Use CDN for static assets (reduce bandwidth)
- [ ] Monitor and optimize slow queries
- [ ] Use reserved instances for predictable workloads
- [ ] Set up budget alerts

## Support

- **Documentation**: See individual deployment guides
- **Issues**: Create GitHub issue
- **Emergency**: Contact on-call engineer (see incident-response.md)

## Next Steps

After successful deployment:

1. ✅ Monitor error rates and performance
2. ✅ Set up alerts for critical issues
3. ✅ Create status page for users
4. ✅ Document any deployment issues
5. ✅ Schedule regular maintenance windows
6. ✅ Plan for disaster recovery
7. ✅ Set up staging environment
8. ✅ Implement CI/CD pipeline
9. ✅ Conduct load testing
10. ✅ Create runbooks for common issues

## Resources

- [Infrastructure Setup](../infrastructure/README.md)
- [Backend Deployment](backend-deployment.md)
- [Frontend Deployment](frontend-deployment.md)
- [Monitoring Setup](../monitoring/README.md)
- [Incident Response](../monitoring/incident-response.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)
