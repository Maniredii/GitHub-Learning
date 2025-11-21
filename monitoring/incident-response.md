# Incident Response Playbook

This document outlines procedures for responding to production incidents in GitQuest.

## Incident Severity Levels

### SEV-1: Critical
- Complete service outage
- Data loss or corruption
- Security breach
- **Response Time**: Immediate
- **Notification**: All hands on deck

### SEV-2: High
- Partial service degradation
- High error rates (>5%)
- Slow response times (p95 > 5s)
- **Response Time**: Within 30 minutes
- **Notification**: On-call engineer + team lead

### SEV-3: Medium
- Minor service degradation
- Elevated error rates (1-5%)
- Slow response times (p95 > 2s)
- **Response Time**: Within 2 hours
- **Notification**: On-call engineer

### SEV-4: Low
- Cosmetic issues
- Non-critical bugs
- **Response Time**: Next business day
- **Notification**: Create ticket

## Common Incidents

### 1. API Down (5xx Errors)

**Symptoms:**
- Health check failing
- 500/502/503 errors
- Users cannot access application

**Investigation Steps:**
1. Check service status:
   ```bash
   curl https://api.gitquest.yourdomain.com/health
   ```

2. Check logs:
   ```bash
   # Heroku
   heroku logs --tail -a gitquest-backend
   
   # AWS
   aws logs tail /ecs/gitquest-backend --follow
   ```

3. Check database connectivity:
   ```bash
   # From backend server
   psql $DATABASE_URL -c "SELECT 1"
   ```

4. Check Redis connectivity:
   ```bash
   redis-cli -u $REDIS_URL ping
   ```

**Resolution:**
- If database down: Check RDS/database service status
- If Redis down: Restart Redis or disable caching temporarily
- If application crash: Check logs, rollback if needed
- If resource exhaustion: Scale up instances

**Rollback:**
```bash
# Heroku
heroku rollback -a gitquest-backend

# AWS ECS
aws ecs update-service --cluster gitquest-production \
  --service gitquest-backend \
  --task-definition gitquest-backend:<previous-version>
```

### 2. Database Connection Issues

**Symptoms:**
- "Cannot connect to database" errors
- Timeouts on database queries
- Health check shows database disconnected

**Investigation Steps:**
1. Check database status in cloud console
2. Check security group rules
3. Check connection pool exhaustion
4. Check database CPU/memory usage

**Resolution:**
- Restart database if hung
- Increase connection pool size
- Scale up database instance
- Check for long-running queries

**Emergency Fix:**
```typescript
// Temporarily increase connection pool
// backend/src/database/db.ts
pool: {
  min: 5,
  max: 20  // Increase from 10
}
```

### 3. High Response Times

**Symptoms:**
- p95 response time > 2 seconds
- Users reporting slow application
- Timeout errors

**Investigation Steps:**
1. Check APM traces to identify slow endpoints
2. Check database query performance
3. Check cache hit rate
4. Check server CPU/memory usage

**Resolution:**
- Optimize slow database queries
- Add database indexes
- Increase cache TTL
- Scale horizontally (add more instances)
- Enable CDN for static assets

**Quick Wins:**
```typescript
// Add database index
await db.schema.alterTable('quests', (table) => {
  table.index('chapter_id');
});

// Increase cache TTL
const CACHE_TTL = 3600; // 1 hour instead of 5 minutes
```

### 4. Memory Leak

**Symptoms:**
- Memory usage continuously increasing
- Application crashes with OOM errors
- Slow performance over time

**Investigation Steps:**
1. Check memory usage trends in monitoring
2. Take heap snapshot
3. Analyze memory profile
4. Check for unclosed connections

**Resolution:**
- Restart application (temporary fix)
- Fix memory leak in code
- Increase memory allocation
- Implement connection pooling properly

**Emergency Fix:**
```bash
# Restart application
heroku restart -a gitquest-backend

# Or scale down and up
heroku ps:scale web=0 -a gitquest-backend
heroku ps:scale web=2 -a gitquest-backend
```

### 5. Frontend Not Loading

**Symptoms:**
- Blank page
- JavaScript errors in console
- Assets not loading

**Investigation Steps:**
1. Check CDN status (Vercel/Netlify)
2. Check browser console for errors
3. Check if API is accessible
4. Check DNS resolution

**Resolution:**
- Clear CDN cache
- Rollback frontend deployment
- Check CORS configuration
- Verify environment variables

**Rollback:**
```bash
# Vercel
vercel rollback <deployment-url>

# Netlify
netlify deploy:restore <deploy-id>
```

### 6. Payment Processing Failure

**Symptoms:**
- Users cannot purchase premium
- Stripe webhook errors
- Payment confirmation not received

**Investigation Steps:**
1. Check Stripe dashboard for errors
2. Check webhook endpoint logs
3. Verify webhook signature
4. Check payment controller logs

**Resolution:**
- Verify Stripe webhook secret
- Check webhook endpoint is accessible
- Manually process failed payments
- Contact Stripe support if needed

**Manual Payment Processing:**
```typescript
// Run in backend console
const paymentService = require('./services/paymentService');
await paymentService.processPayment(userId, paymentIntentId);
```

### 7. Database Migration Failure

**Symptoms:**
- Application won't start after deployment
- Database schema errors
- Migration rollback needed

**Investigation Steps:**
1. Check migration logs
2. Verify database state
3. Check for conflicting migrations

**Resolution:**
```bash
# Rollback migration
npm run migrate:rollback --workspace=backend

# Fix migration file
# Re-run migration
npm run migrate:latest --workspace=backend
```

## Incident Response Process

### 1. Detection
- Alert received (Sentry, Datadog, UptimeRobot)
- User report
- Monitoring dashboard

### 2. Acknowledgment
- Acknowledge alert in monitoring system
- Post in #incidents Slack channel
- Assign incident commander

### 3. Investigation
- Gather information
- Check logs and metrics
- Identify root cause
- Determine severity

### 4. Communication
- Update status page
- Notify stakeholders
- Post updates every 30 minutes

### 5. Resolution
- Implement fix
- Verify fix in production
- Monitor for recurrence

### 6. Post-Mortem
- Document incident
- Identify root cause
- Create action items
- Schedule follow-up

## Communication Templates

### Status Page Update

```
[INVESTIGATING] We are currently investigating reports of [issue description].
Updates will be provided as we learn more.

[IDENTIFIED] We have identified the issue as [root cause].
We are working on a fix.

[MONITORING] A fix has been deployed. We are monitoring the situation.

[RESOLVED] The issue has been resolved. All systems are operational.
```

### Slack Update

```
🚨 INCIDENT: [Title]
Severity: SEV-[1/2/3/4]
Status: [Investigating/Identified/Monitoring/Resolved]
Impact: [Description of user impact]
ETA: [Estimated time to resolution]
Incident Commander: @[name]
```

## On-Call Rotation

### Responsibilities
- Monitor alerts 24/7 during on-call period
- Respond to incidents within SLA
- Escalate if needed
- Document incidents

### Escalation Path
1. On-call engineer (15 minutes)
2. Team lead (30 minutes)
3. Engineering manager (1 hour)
4. CTO (2 hours)

### Handoff Checklist
- [ ] Review open incidents
- [ ] Check monitoring dashboards
- [ ] Review recent deployments
- [ ] Share contact information
- [ ] Test alert notifications

## Tools and Access

### Required Access
- [ ] AWS Console (if using AWS)
- [ ] Heroku Dashboard (if using Heroku)
- [ ] Database access
- [ ] Sentry
- [ ] Datadog/New Relic
- [ ] Slack #incidents channel
- [ ] Status page admin
- [ ] GitHub repository

### Emergency Contacts
- **Team Lead**: [phone/email]
- **Database Admin**: [phone/email]
- **DevOps**: [phone/email]
- **AWS Support**: [support plan details]

## Post-Incident Review Template

```markdown
# Incident Post-Mortem: [Title]

**Date**: [Date]
**Duration**: [Start time] - [End time]
**Severity**: SEV-[1/2/3/4]
**Incident Commander**: [Name]

## Summary
[Brief description of what happened]

## Impact
- Users affected: [number/percentage]
- Services affected: [list]
- Revenue impact: [if applicable]

## Timeline
- [Time]: Incident detected
- [Time]: Investigation started
- [Time]: Root cause identified
- [Time]: Fix deployed
- [Time]: Incident resolved

## Root Cause
[Detailed explanation of what caused the incident]

## Resolution
[What was done to fix the issue]

## Action Items
- [ ] [Action item 1] - Owner: [Name] - Due: [Date]
- [ ] [Action item 2] - Owner: [Name] - Due: [Date]

## Lessons Learned
- What went well
- What could be improved
- How to prevent similar incidents

## Related Links
- Incident ticket: [link]
- Monitoring dashboard: [link]
- Related PRs: [links]
```

## Prevention

### Proactive Measures
- Regular load testing
- Chaos engineering exercises
- Database query optimization
- Code reviews
- Automated testing
- Monitoring and alerting
- Regular backups
- Disaster recovery drills

### Monitoring Checklist
- [ ] All critical alerts configured
- [ ] Alert fatigue minimized
- [ ] Runbooks up to date
- [ ] On-call rotation scheduled
- [ ] Escalation path documented
- [ ] Status page configured
- [ ] Backup and restore tested

## Resources

- [Monitoring Dashboard](https://app.datadoghq.com)
- [Error Tracking](https://sentry.io)
- [Status Page](https://status.gitquest.com)
- [Runbooks](./runbooks/)
- [Architecture Docs](../docs/architecture.md)
