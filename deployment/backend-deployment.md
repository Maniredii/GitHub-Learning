# Backend Deployment Guide

This guide covers deploying the GitQuest backend API to various platforms.

## Prerequisites

- Infrastructure set up (database, Redis)
- Environment variables configured
- Docker installed (for container-based deployments)
- Domain name configured

## Build Docker Image

```bash
# From project root
cd backend

# Build image
docker build -t gitquest-backend:latest -f Dockerfile ..

# Test locally
docker run -p 3000:3000 \
  -e DATABASE_HOST=localhost \
  -e DATABASE_NAME=gitquest \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=password \
  -e JWT_SECRET=test-secret \
  -e REDIS_URL=redis://localhost:6379 \
  gitquest-backend:latest

# Test health check
curl http://localhost:3000/health
```

## Deployment Options

### Option 1: Heroku

#### Setup

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create gitquest-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Add Redis
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set CORS_ORIGIN=https://gitquest.yourdomain.com
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate:latest --workspace=backend

# Seed data
heroku run node backend/run-seeds.js

# Check logs
heroku logs --tail
```

#### Auto-scaling

```bash
# Enable auto-scaling (requires Performance dynos)
heroku ps:autoscale:enable web --min 2 --max 10 --p95-response-time 500ms
```

#### Custom Domain

```bash
# Add domain
heroku domains:add api.gitquest.yourdomain.com

# Get DNS target
heroku domains

# Add CNAME record in your DNS provider:
# api.gitquest.yourdomain.com -> <heroku-dns-target>

# Enable automated SSL
heroku certs:auto:enable
```

### Option 2: AWS ECS (Elastic Container Service)

#### Setup

```bash
# Install AWS CLI and ECS CLI
# https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# Configure AWS credentials
aws configure

# Create ECR repository
aws ecr create-repository --repository-name gitquest-backend --region us-east-1

# Get ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push image
docker tag gitquest-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/gitquest-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/gitquest-backend:latest
```

#### Create ECS Task Definition

Create `ecs-task-definition.json`:

```json
{
  "family": "gitquest-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "gitquest-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/gitquest-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:account-id:secret:gitquest/db-host"
        },
        {
          "name": "DATABASE_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:account-id:secret:gitquest/db-password"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:account-id:secret:gitquest/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/gitquest-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### Deploy to ECS

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create ECS cluster
aws ecs create-cluster --cluster-name gitquest-production

# Create service
aws ecs create-service \
  --cluster gitquest-production \
  --service-name gitquest-backend \
  --task-definition gitquest-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=gitquest-backend,containerPort=3000"

# Enable auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/gitquest-production/gitquest-backend \
  --min-capacity 2 \
  --max-capacity 10

aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/gitquest-production/gitquest-backend \
  --policy-name cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

### Option 3: DigitalOcean App Platform

#### Setup via Web UI

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repository
4. Select `backend` directory
5. Configure:
   - **Type**: Web Service
   - **Build Command**: `npm run build --workspace=backend`
   - **Run Command**: `npm start --workspace=backend`
   - **HTTP Port**: 3000
   - **Instance Size**: Basic ($12/month)
   - **Instance Count**: 2

6. Add environment variables:
   ```
   NODE_ENV=production
   DATABASE_HOST=<db-host>
   DATABASE_NAME=gitquest_production
   DATABASE_USER=<db-user>
   DATABASE_PASSWORD=<db-password>
   JWT_SECRET=<jwt-secret>
   REDIS_URL=<redis-url>
   STRIPE_SECRET_KEY=<stripe-key>
   STRIPE_WEBHOOK_SECRET=<webhook-secret>
   CORS_ORIGIN=https://gitquest.yourdomain.com
   ```

7. Add health check:
   - **Path**: `/health`
   - **Port**: 3000

8. Deploy

#### Setup via CLI

```bash
# Install doctl
# https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate
doctl auth init

# Create app spec
cat > app-spec.yaml <<EOF
name: gitquest-backend
services:
- name: api
  github:
    repo: your-username/gitquest
    branch: main
    deploy_on_push: true
  source_dir: /backend
  build_command: npm run build --workspace=backend
  run_command: npm start --workspace=backend
  http_port: 3000
  instance_count: 2
  instance_size_slug: basic-xs
  health_check:
    http_path: /health
    port: 3000
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_HOST
    value: \${db.HOSTNAME}
  - key: DATABASE_NAME
    value: \${db.DATABASE}
  - key: DATABASE_USER
    value: \${db.USERNAME}
  - key: DATABASE_PASSWORD
    value: \${db.PASSWORD}
  - key: JWT_SECRET
    type: SECRET
    value: <jwt-secret>
databases:
- name: db
  engine: PG
  version: "15"
  size: db-s-1vcpu-1gb
EOF

# Create app
doctl apps create --spec app-spec.yaml

# Get app ID
doctl apps list

# View logs
doctl apps logs <app-id> --follow
```

## Database Migrations

Run migrations after deployment:

```bash
# Heroku
heroku run npm run migrate:latest --workspace=backend

# AWS ECS (via ECS Exec)
aws ecs execute-command \
  --cluster gitquest-production \
  --task <task-id> \
  --container gitquest-backend \
  --interactive \
  --command "npm run migrate:latest --workspace=backend"

# DigitalOcean (via console)
doctl apps exec <app-id> --component api -- npm run migrate:latest --workspace=backend
```

## Rollback

### Heroku

```bash
# View releases
heroku releases

# Rollback to previous release
heroku rollback v123
```

### AWS ECS

```bash
# Update service to previous task definition
aws ecs update-service \
  --cluster gitquest-production \
  --service gitquest-backend \
  --task-definition gitquest-backend:123
```

### DigitalOcean

```bash
# View deployments
doctl apps list-deployments <app-id>

# Rollback
doctl apps create-deployment <app-id> --deployment-id <previous-deployment-id>
```

## Monitoring

### Health Checks

```bash
# Check health endpoint
curl https://api.gitquest.yourdomain.com/health

# Expected response:
{
  "status": "ok",
  "message": "GitQuest API is running",
  "database": "connected",
  "cache": "connected"
}
```

### Logs

```bash
# Heroku
heroku logs --tail --app gitquest-backend

# AWS CloudWatch
aws logs tail /ecs/gitquest-backend --follow

# DigitalOcean
doctl apps logs <app-id> --follow
```

## Performance Tuning

### Node.js Configuration

Set these environment variables for production:

```bash
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=512"
UV_THREADPOOL_SIZE=128
```

### Database Connection Pooling

Already configured in `backend/src/database/db.ts`:
- Min connections: 2
- Max connections: 10

Adjust based on your instance size and load.

### Redis Caching

Ensure Redis is properly configured for optimal performance:
- Enable persistence (AOF or RDB)
- Set appropriate maxmemory policy
- Monitor memory usage

## Troubleshooting

### Container Won't Start

1. Check logs for errors
2. Verify environment variables are set
3. Test database connectivity
4. Ensure migrations have run

### High Memory Usage

1. Check for memory leaks
2. Reduce connection pool size
3. Increase instance size
4. Enable horizontal scaling

### Slow Response Times

1. Check database query performance
2. Verify Redis caching is working
3. Enable CDN for static assets
4. Increase instance count

### Database Connection Errors

1. Verify security group rules
2. Check SSL configuration
3. Verify credentials
4. Test connection from container

## Security Checklist

- [ ] All environment variables stored securely
- [ ] Database requires SSL
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Secrets rotated regularly
- [ ] Logs don't contain sensitive data
- [ ] Health check doesn't expose sensitive info

## Next Steps

After backend deployment:
1. Test all API endpoints
2. Run smoke tests
3. Deploy frontend
4. Configure monitoring
5. Set up CI/CD pipeline
