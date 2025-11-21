# GitQuest Infrastructure Setup Guide

This guide provides step-by-step instructions for setting up production infrastructure for GitQuest.

## Overview

GitQuest uses the following infrastructure components:
- **Database**: PostgreSQL (AWS RDS recommended)
- **Cache**: Redis (AWS ElastiCache or Redis Cloud)
- **Backend**: Node.js API (AWS ECS, Heroku, or DigitalOcean)
- **Frontend**: Static React app (Vercel, Netlify, or CloudFront)
- **SSL**: Automatic via platform or Let's Encrypt

## Prerequisites

- AWS Account (or alternative cloud provider)
- Domain name for custom domain
- Stripe account for payments
- Git repository access

## 1. Database Setup (PostgreSQL)

### Option A: AWS RDS

1. **Create RDS Instance**:
   ```bash
   # Using AWS CLI
   aws rds create-db-instance \
     --db-instance-identifier gitquest-prod-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --engine-version 15.4 \
     --master-username gitquest_admin \
     --master-user-password <SECURE_PASSWORD> \
     --allocated-storage 20 \
     --storage-type gp2 \
     --vpc-security-group-ids <SECURITY_GROUP_ID> \
     --db-subnet-group-name <SUBNET_GROUP> \
     --backup-retention-period 7 \
     --preferred-backup-window "03:00-04:00" \
     --preferred-maintenance-window "mon:04:00-mon:05:00" \
     --storage-encrypted \
     --publicly-accessible false
   ```

2. **Configure Security Group**:
   - Allow inbound PostgreSQL (port 5432) from backend application security group
   - Deny all other inbound traffic

3. **Enable SSL**:
   - Download RDS SSL certificate
   - Configure connection to require SSL

4. **Create Database**:
   ```bash
   # Connect to RDS instance
   psql -h <RDS_ENDPOINT> -U gitquest_admin -d postgres
   
   # Create database
   CREATE DATABASE gitquest_production;
   ```

### Option B: Heroku Postgres

1. Add Heroku Postgres addon:
   ```bash
   heroku addons:create heroku-postgresql:mini -a gitquest-backend
   ```

2. Get connection string:
   ```bash
   heroku config:get DATABASE_URL -a gitquest-backend
   ```

### Option C: DigitalOcean Managed Database

1. Create managed PostgreSQL database in DigitalOcean control panel
2. Select appropriate plan (Basic $15/month for starter)
3. Configure trusted sources (backend droplet IP)
4. Download SSL certificate

## 2. Redis Setup (Caching)

### Option A: AWS ElastiCache

1. **Create Redis Cluster**:
   ```bash
   aws elasticache create-cache-cluster \
     --cache-cluster-id gitquest-redis \
     --cache-node-type cache.t3.micro \
     --engine redis \
     --engine-version 7.0 \
     --num-cache-nodes 1 \
     --cache-subnet-group-name <SUBNET_GROUP> \
     --security-group-ids <SECURITY_GROUP_ID>
   ```

2. **Configure Security Group**:
   - Allow inbound Redis (port 6379) from backend security group

3. **Enable Encryption**:
   - Enable encryption at rest
   - Enable encryption in transit

### Option B: Redis Cloud

1. Sign up at https://redis.com/try-free/
2. Create new database
3. Select cloud provider and region
4. Get connection URL with TLS

### Option C: Heroku Redis

```bash
heroku addons:create heroku-redis:mini -a gitquest-backend
```

## 3. Environment Variables Configuration

### Backend Environment Variables

Set these in your deployment platform:

```bash
# Database
DATABASE_HOST=<RDS_ENDPOINT>
DATABASE_NAME=gitquest_production
DATABASE_USER=gitquest_admin
DATABASE_PASSWORD=<SECURE_PASSWORD>

# JWT
JWT_SECRET=<GENERATE_WITH: openssl rand -base64 32>

# CORS
FRONTEND_URL=https://gitquest.yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis
REDIS_URL=rediss://:<PASSWORD>@<REDIS_HOST>:6379

# Monitoring
SENTRY_DSN=<YOUR_SENTRY_DSN>
```

### Frontend Environment Variables

```bash
# API
API_URL=https://api.gitquest.yourdomain.com

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
```

## 4. SSL Certificate Setup

### Option A: Platform-Managed SSL (Recommended)

Most platforms (Vercel, Netlify, Heroku) provide automatic SSL:
- Vercel: Automatic with custom domains
- Netlify: Automatic with Let's Encrypt
- Heroku: Automatic SSL for paid dynos

### Option B: AWS Certificate Manager

1. **Request Certificate**:
   ```bash
   aws acm request-certificate \
     --domain-name gitquest.yourdomain.com \
     --subject-alternative-names api.gitquest.yourdomain.com \
     --validation-method DNS
   ```

2. **Validate Domain**:
   - Add CNAME records to your DNS provider
   - Wait for validation (usually 5-30 minutes)

3. **Attach to Load Balancer**:
   - Configure ALB/NLB to use ACM certificate
   - Set up HTTPS listener on port 443

### Option C: Let's Encrypt (Manual)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d api.gitquest.yourdomain.com

# Certificates will be in /etc/letsencrypt/live/
```

## 5. Database Migration

Run migrations on production database:

```bash
# Set production database URL
export DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Run migrations
npm run migrate:latest --workspace=backend

# Seed initial data (chapters, quests, achievements)
node backend/run-seeds.js
```

## 6. Security Checklist

- [ ] Database requires SSL connections
- [ ] Database not publicly accessible
- [ ] Strong passwords for all services (min 32 characters)
- [ ] JWT secret is cryptographically random
- [ ] Redis requires authentication
- [ ] Redis uses TLS encryption
- [ ] Environment variables stored securely (not in code)
- [ ] CORS configured to allow only frontend domain
- [ ] Rate limiting enabled on API
- [ ] SQL injection protection via parameterized queries
- [ ] XSS protection via React's built-in escaping
- [ ] HTTPS enforced on all endpoints
- [ ] Security headers configured (helmet.js)

## 7. Backup Configuration

### Database Backups

**AWS RDS**:
- Automated daily backups (configured during setup)
- Retention period: 7 days minimum
- Manual snapshots before major changes

**Heroku Postgres**:
```bash
# Create manual backup
heroku pg:backups:capture -a gitquest-backend

# Schedule automatic backups (included in paid plans)
heroku pg:backups:schedule DATABASE_URL --at '02:00 America/Los_Angeles' -a gitquest-backend
```

### Redis Backups

**AWS ElastiCache**:
- Enable automatic backups
- Retention period: 1 day minimum

**Redis Cloud**:
- Automatic backups included in paid plans

## 8. Monitoring Setup

See `monitoring/README.md` for detailed monitoring configuration.

## Cost Estimates

### Minimal Production Setup (~$50-70/month)

- **Database**: AWS RDS t3.micro ($15-20/month)
- **Redis**: AWS ElastiCache t3.micro ($15/month) or Redis Cloud free tier
- **Backend**: Heroku Hobby dyno ($7/month) or DigitalOcean Droplet ($12/month)
- **Frontend**: Vercel/Netlify free tier
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt or platform-provided)

### Recommended Production Setup (~$150-200/month)

- **Database**: AWS RDS t3.small with Multi-AZ ($50-70/month)
- **Redis**: AWS ElastiCache t3.small ($30/month)
- **Backend**: AWS ECS Fargate or Heroku Standard ($50-100/month)
- **Frontend**: Vercel Pro ($20/month) or CloudFront ($5-10/month)
- **Monitoring**: Sentry ($26/month) + Datadog free tier

## Troubleshooting

### Database Connection Issues

1. Check security group rules
2. Verify SSL certificate configuration
3. Test connection from backend server:
   ```bash
   psql "postgresql://user:pass@host:5432/dbname?sslmode=require"
   ```

### Redis Connection Issues

1. Verify authentication credentials
2. Check TLS configuration
3. Test connection:
   ```bash
   redis-cli -h <host> -p 6379 --tls -a <password> ping
   ```

### SSL Certificate Issues

1. Verify DNS records point to correct servers
2. Check certificate expiration
3. Ensure certificate matches domain name

## Next Steps

After infrastructure setup:
1. Deploy backend (see `deployment/backend-deployment.md`)
2. Deploy frontend (see `deployment/frontend-deployment.md`)
3. Configure monitoring (see `monitoring/README.md`)
4. Run smoke tests
5. Set up CI/CD pipeline
