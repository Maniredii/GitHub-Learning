# GitQuest Deployment Quick Start

This guide provides a quick overview of deploying GitQuest to production.

## Prerequisites

- Node.js 18+
- Docker (for backend deployment)
- Cloud platform account (AWS, Heroku, or DigitalOcean)
- Domain name
- Stripe account

## Quick Deployment (Heroku + Vercel)

This is the fastest way to get GitQuest running in production.

### 1. Install Dependencies

```bash
# Install Sentry packages
npm install @sentry/node @sentry/profiling-node --workspace=backend
npm install @sentry/react --workspace=frontend

# Install all dependencies
npm install
```

### 2. Set Up Infrastructure

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create backend app
heroku create gitquest-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini -a gitquest-backend

# Add Redis
heroku addons:create heroku-redis:mini -a gitquest-backend
```

### 3. Configure Environment Variables

```bash
# Backend
heroku config:set NODE_ENV=production -a gitquest-backend
heroku config:set JWT_SECRET=$(openssl rand -base64 32) -a gitquest-backend
heroku config:set CORS_ORIGIN=https://gitquest.yourdomain.com -a gitquest-backend
heroku config:set STRIPE_SECRET_KEY=sk_live_... -a gitquest-backend
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_... -a gitquest-backend
```

### 4. Deploy Backend

```bash
# Set Heroku stack to container
heroku stack:set container -a gitquest-backend

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate:latest --workspace=backend -a gitquest-backend

# Seed data
heroku run node backend/run-seeds.js -a gitquest-backend

# Check logs
heroku logs --tail -a gitquest-backend
```

### 5. Deploy Frontend

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend

# Set environment variables
vercel env add VITE_API_URL production
# Enter: https://gitquest-backend.herokuapp.com/api

vercel env add VITE_STRIPE_PUBLIC_KEY production
# Enter: pk_live_...

# Deploy to production
vercel --prod

# Add custom domain (optional)
vercel domains add gitquest.yourdomain.com
```

### 6. Verify Deployment

```bash
# Check backend health
curl https://gitquest-backend.herokuapp.com/health

# Check frontend
curl https://gitquest.vercel.app

# Test in browser
open https://gitquest.vercel.app
```

## Monitoring Setup (Optional but Recommended)

### 1. Set Up Sentry

```bash
# Sign up at https://sentry.io
# Create projects for frontend and backend
# Get DSN for each project

# Add to Heroku
heroku config:set SENTRY_DSN=https://...@sentry.io/... -a gitquest-backend

# Add to Vercel
vercel env add VITE_SENTRY_DSN production
# Enter: https://...@sentry.io/...
```

### 2. Set Up Uptime Monitoring

1. Sign up at https://uptimerobot.com (free)
2. Add monitor for backend: `https://gitquest-backend.herokuapp.com/health`
3. Add monitor for frontend: `https://gitquest.vercel.app`
4. Configure email alerts

## Cost Estimate

- **Heroku Postgres Mini**: $5/month
- **Heroku Redis Mini**: $3/month
- **Heroku Hobby Dyno**: $7/month
- **Vercel**: Free (Hobby plan)
- **Domain**: $10-15/year
- **Total**: ~$15/month + domain

## Scaling Up

When you need more resources:

```bash
# Upgrade database
heroku addons:upgrade heroku-postgresql:basic -a gitquest-backend

# Upgrade Redis
heroku addons:upgrade heroku-redis:premium-0 -a gitquest-backend

# Scale dynos
heroku ps:scale web=2 -a gitquest-backend

# Upgrade to Standard dyno
heroku ps:type standard-1x -a gitquest-backend
```

## Troubleshooting

### Backend won't start
```bash
# Check logs
heroku logs --tail -a gitquest-backend

# Check config
heroku config -a gitquest-backend

# Restart
heroku restart -a gitquest-backend
```

### Frontend can't connect to API
1. Check CORS_ORIGIN is set correctly
2. Verify API URL in frontend env vars
3. Check backend is running: `curl https://gitquest-backend.herokuapp.com/health`

### Database connection errors
```bash
# Check database status
heroku pg:info -a gitquest-backend

# Check connection
heroku pg:psql -a gitquest-backend
```

## Next Steps

- [ ] Set up custom domain
- [ ] Configure SSL (automatic with Heroku/Vercel)
- [ ] Set up monitoring (Sentry, UptimeRobot)
- [ ] Configure backups
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Load test your application
- [ ] Create status page

## Full Documentation

For detailed deployment guides, see:
- [Infrastructure Setup](infrastructure/README.md)
- [Backend Deployment](deployment/backend-deployment.md)
- [Frontend Deployment](deployment/frontend-deployment.md)
- [Monitoring Setup](monitoring/README.md)
- [Deployment Checklist](deployment/DEPLOYMENT_CHECKLIST.md)

## Support

- **Documentation**: See `deployment/` directory
- **Issues**: Create GitHub issue
- **Community**: [Your community link]
