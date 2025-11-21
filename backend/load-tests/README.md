# Load Testing for GitQuest

This directory contains load testing scripts using k6 to measure API performance and identify bottlenecks.

## Prerequisites

Install k6:
- **Windows**: `choco install k6` or download from https://k6.io/docs/getting-started/installation/
- **macOS**: `brew install k6`
- **Linux**: See https://k6.io/docs/getting-started/installation/

## Test Scripts

### 1. Smoke Test (`smoke-test.js`)
Minimal load test to verify the system works correctly.
- **VUs**: 1 virtual user
- **Duration**: 1 minute
- **Purpose**: Quick sanity check

```bash
k6 run smoke-test.js
```

### 2. Basic Load Test (`basic-load-test.js`)
Simulates realistic user load with gradual ramp-up to 1000 concurrent users.
- **Max VUs**: 1000 virtual users
- **Duration**: ~10 minutes
- **Purpose**: Test system under expected production load

```bash
k6 run basic-load-test.js
```

With custom base URL:
```bash
k6 run -e BASE_URL=http://your-server:3000 basic-load-test.js
```

### 3. Stress Test (`stress-test.js`)
Pushes the system beyond normal capacity to find breaking points.
- **Max VUs**: 400 virtual users
- **Duration**: ~30 minutes
- **Purpose**: Identify system limits and failure modes

```bash
k6 run stress-test.js
```

## Performance Thresholds

All tests enforce the following thresholds:

- **Response Time**: 95% of requests should complete in < 500ms (basic) or < 1000ms (stress)
- **Error Rate**: Less than 1% of requests should fail (basic) or < 5% (stress)
- **Git Command Execution**: Should complete in < 200ms

## Interpreting Results

k6 provides detailed metrics including:

- **http_req_duration**: Request duration (avg, min, max, p95, p99)
- **http_req_failed**: Percentage of failed requests
- **http_reqs**: Total number of requests
- **vus**: Number of active virtual users
- **iterations**: Number of test iterations completed

### Example Output

```
     ✓ login status is 200
     ✓ progress response time < 200ms
     ✓ git status response time < 200ms

     checks.........................: 98.50% ✓ 9850  ✗ 150
     data_received..................: 15 MB  250 kB/s
     data_sent......................: 5.0 MB 83 kB/s
     http_req_duration..............: avg=145ms min=50ms med=120ms max=850ms p(95)=350ms p(99)=600ms
     http_req_failed................: 0.50%  ✓ 50    ✗ 9950
     http_reqs......................: 10000  166.67/s
     iterations.....................: 1000   16.67/s
     vus............................: 100    min=1   max=1000
```

## Troubleshooting

### High Error Rates
- Check server logs for errors
- Verify database connection pool size
- Check for rate limiting issues

### Slow Response Times
- Review Git engine performance metrics: `GET /api/git/performance/:id`
- Check database query performance
- Verify Redis cache is working
- Review server resource usage (CPU, memory)

### Connection Errors
- Ensure backend server is running
- Check firewall settings
- Verify BASE_URL is correct

## Continuous Integration

Add load tests to CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run smoke test
  run: k6 run backend/load-tests/smoke-test.js
```

## Performance Optimization Checklist

After running load tests, check:

- [ ] API response times meet thresholds
- [ ] Git command execution < 200ms
- [ ] Database queries are optimized
- [ ] Redis caching is effective
- [ ] No memory leaks under sustained load
- [ ] Error rates are acceptable
- [ ] System recovers gracefully from peak load
