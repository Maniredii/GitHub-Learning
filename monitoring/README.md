# GitQuest Monitoring and Observability

This guide covers setting up comprehensive monitoring for GitQuest in production.

## Overview

GitQuest monitoring includes:
- **Application Performance Monitoring (APM)**: Track API response times, errors, and throughput
- **Error Tracking**: Capture and analyze frontend and backend errors
- **Uptime Monitoring**: Ensure services are accessible
- **Infrastructure Monitoring**: Track server resources (CPU, memory, disk)
- **Log Aggregation**: Centralized logging for debugging
- **Alerting**: Notifications for critical issues

## Monitoring Stack

### Recommended Setup

1. **Sentry** - Error tracking (frontend + backend)
2. **Datadog** or **New Relic** - APM and infrastructure monitoring
3. **UptimeRobot** or **Pingdom** - Uptime monitoring
4. **CloudWatch** (if using AWS) - Logs and metrics

### Alternative Setup (Budget-Friendly)

1. **Sentry** - Error tracking (free tier: 5k errors/month)
2. **Heroku Metrics** or **DigitalOcean Insights** - Basic APM
3. **UptimeRobot** - Uptime monitoring (free tier: 50 monitors)
4. **Platform logs** - Built-in logging

## 1. Error Tracking with Sentry

### Setup

```bash
# Install Sentry SDK
npm install @sentry/node @sentry/react --workspace=backend --workspace=frontend
```

### Backend Integration

Create `backend/src/config/sentry.ts`:

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        new ProfilingIntegration(),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers.authorization;
          }
        }
        return event;
      },
    });
  }
}

export { Sentry };
```

Update `backend/src/index.ts`:

```typescript
import { initSentry, Sentry } from './config/sentry';

// Initialize Sentry first
initSentry();

// ... rest of imports

const app: Application = express();

// Sentry request handler must be first middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... other middleware and routes

// Sentry error handler must be before other error handlers
app.use(Sentry.Handlers.errorHandler());

// Custom error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Frontend Integration

Create `frontend/src/config/sentry.ts`:

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.VITE_ENV || 'development',
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: import.meta.env.VITE_ENV === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.request) {
          delete event.request.cookies;
        }
        return event;
      },
    });
  }
}
```

Update `frontend/src/main.tsx`:

```typescript
import { initSentry } from './config/sentry';

// Initialize Sentry
initSentry();

// ... rest of app initialization
```

### Sentry Configuration

1. Sign up at https://sentry.io
2. Create new project for backend (Node.js)
3. Create new project for frontend (React)
4. Get DSN for each project
5. Set environment variables:
   ```bash
   # Backend
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   
   # Frontend
   VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

## 2. Application Performance Monitoring

### Option A: Datadog

#### Setup

```bash
# Install Datadog agent on server
DD_API_KEY=<your-api-key> DD_SITE="datadoghq.com" bash -c "$(curl -L https://s.datadoghq.com/scripts/install_script.sh)"

# Install Node.js tracer
npm install dd-trace --workspace=backend
```

Create `backend/src/config/datadog.ts`:

```typescript
import tracer from 'dd-trace';

export function initDatadog() {
  if (process.env.DD_API_KEY) {
    tracer.init({
      service: 'gitquest-backend',
      env: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      logInjection: true,
      runtimeMetrics: true,
    });
  }
}
```

Update `backend/src/index.ts`:

```typescript
// Must be first import
import { initDatadog } from './config/datadog';
initDatadog();

// ... rest of imports
```

#### Datadog Dashboard

Create custom dashboard with:
- API response times (p50, p95, p99)
- Error rates
- Request throughput
- Database query performance
- Memory and CPU usage

### Option B: New Relic

#### Setup

```bash
# Install New Relic agent
npm install newrelic --workspace=backend
```

Create `backend/newrelic.js`:

```javascript
'use strict'

exports.config = {
  app_name: ['GitQuest Backend'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
}
```

Update `backend/src/index.ts`:

```typescript
// Must be first import
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

// ... rest of imports
```

### Option C: Platform-Native Monitoring

#### Heroku

```bash
# Enable Heroku metrics
heroku labs:enable log-runtime-metrics -a gitquest-backend

# View metrics
heroku logs --tail -a gitquest-backend | grep "sample#"
```

#### AWS CloudWatch

Automatically enabled for ECS. View in CloudWatch console:
- Container Insights for ECS
- Custom metrics from application
- Log groups

## 3. Uptime Monitoring

### UptimeRobot (Free Tier)

1. Sign up at https://uptimerobot.com
2. Add monitors:

**Backend API Health Check:**
- Type: HTTP(s)
- URL: https://api.gitquest.yourdomain.com/health
- Interval: 5 minutes
- Alert contacts: Email, SMS

**Frontend:**
- Type: HTTP(s)
- URL: https://gitquest.yourdomain.com
- Interval: 5 minutes
- Alert contacts: Email, SMS

**Database (if publicly accessible):**
- Type: Port
- Host: <db-host>
- Port: 5432
- Interval: 5 minutes

### Pingdom (Paid)

More advanced features:
- Real user monitoring
- Transaction monitoring
- Page speed monitoring
- Multiple check locations

### StatusCake (Free Tier)

Similar to UptimeRobot with free tier.

## 4. Log Aggregation

### Option A: Datadog Logs

```typescript
// backend/src/config/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'gitquest-backend',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console(),
    // Add Datadog transport if needed
  ],
});

export default logger;
```

### Option B: CloudWatch Logs (AWS)

Automatically configured for ECS. View in CloudWatch Logs console.

### Option C: Platform Logs

```bash
# Heroku
heroku logs --tail -a gitquest-backend

# DigitalOcean
doctl apps logs <app-id> --follow

# Vercel
vercel logs <deployment-url> --follow
```

## 5. Custom Metrics

### Backend Metrics

Create `backend/src/middleware/metricsMiddleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { Sentry } from '../config/sentry';

const requestDurations: number[] = [];

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestDurations.push(duration);
    
    // Send to Sentry
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${req.method} ${req.path}`,
      level: 'info',
      data: {
        status: res.statusCode,
        duration,
      },
    });
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
}

export function getMetrics() {
  const sorted = requestDurations.sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  
  return {
    requestCount: requestDurations.length,
    p50,
    p95,
    p99,
  };
}
```

Add metrics endpoint:

```typescript
// backend/src/index.ts
app.get('/metrics', (req, res) => {
  res.json(getMetrics());
});
```

## 6. Alerting

### Critical Alerts

Set up alerts for:

1. **API Down** (5xx errors > 10% for 5 minutes)
2. **High Error Rate** (errors > 100/minute)
3. **Slow Response Times** (p95 > 2 seconds)
4. **Database Connection Failures**
5. **High Memory Usage** (> 90%)
6. **High CPU Usage** (> 80% for 10 minutes)

### Sentry Alerts

1. Go to Sentry project settings
2. Navigate to Alerts
3. Create alert rules:
   - New issue created
   - Issue frequency > threshold
   - Issue regression

### Datadog Alerts

Create monitors for:
```
avg(last_5m):avg:trace.express.request.duration{service:gitquest-backend} by {resource_name} > 2
```

### Email/SMS/Slack Notifications

Configure notification channels:
- Email for all alerts
- SMS for critical alerts
- Slack for team notifications

## 7. Health Checks

### Backend Health Check

Already implemented at `/health`:

```typescript
app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.json({
      status: 'ok',
      database: 'connected',
      cache: cacheService.isAvailable() ? 'connected' : 'unavailable',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});
```

### Readiness Check

Add `/ready` endpoint for Kubernetes/ECS:

```typescript
app.get('/ready', async (req, res) => {
  // Check if app is ready to receive traffic
  const checks = {
    database: false,
    cache: false,
  };
  
  try {
    await db.raw('SELECT 1');
    checks.database = true;
  } catch (error) {
    // Database not ready
  }
  
  checks.cache = cacheService.isAvailable();
  
  if (checks.database) {
    res.json({ status: 'ready', checks });
  } else {
    res.status(503).json({ status: 'not ready', checks });
  }
});
```

## 8. Monitoring Dashboard

### Create Status Page

Use services like:
- **StatusPage.io** (Atlassian)
- **Statuspal**
- **Cachet** (self-hosted)

Display:
- API status
- Frontend status
- Database status
- Recent incidents
- Scheduled maintenance

### Internal Dashboard

Create admin dashboard showing:
- Active users
- API request rate
- Error rate
- Response times
- Database performance
- Cache hit rate

## 9. Performance Budgets

Set and monitor:
- **API Response Time**: p95 < 500ms
- **Frontend Load Time**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **Lighthouse Score**: > 90
- **Error Rate**: < 0.1%
- **Uptime**: > 99.9%

## 10. Monitoring Checklist

- [ ] Sentry configured for frontend and backend
- [ ] APM tool configured (Datadog/New Relic)
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up
- [ ] Custom metrics tracked
- [ ] Alerts configured for critical issues
- [ ] Health check endpoints implemented
- [ ] Status page created
- [ ] Performance budgets defined
- [ ] Monitoring dashboard accessible
- [ ] Alert notification channels configured
- [ ] On-call rotation established
- [ ] Incident response plan documented

## Cost Estimates

### Minimal Setup (Free/Low Cost)
- **Sentry**: Free tier (5k errors/month)
- **UptimeRobot**: Free tier (50 monitors)
- **Platform logs**: Included
- **Total**: $0-10/month

### Recommended Setup
- **Sentry**: Team plan ($26/month)
- **Datadog**: Pro plan ($15/host/month)
- **UptimeRobot**: Pro plan ($7/month)
- **StatusPage**: Starter ($29/month)
- **Total**: ~$80-100/month

## Troubleshooting

### High Error Rates

1. Check Sentry for error details
2. Review recent deployments
3. Check database performance
4. Review API logs
5. Check external service status

### Slow Response Times

1. Check APM traces
2. Identify slow database queries
3. Check cache hit rates
4. Review recent code changes
5. Check server resources

### Monitoring Not Working

1. Verify API keys are set
2. Check network connectivity
3. Review monitoring service status
4. Check logs for initialization errors

## Next Steps

After monitoring setup:
1. Test alerts by triggering test errors
2. Create runbooks for common issues
3. Set up on-call rotation
4. Document incident response procedures
5. Schedule regular monitoring reviews
