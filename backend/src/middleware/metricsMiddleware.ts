import { Request, Response, NextFunction } from 'express';

interface RequestMetrics {
  count: number;
  durations: number[];
  errors: number;
  slowRequests: number;
}

const metrics: RequestMetrics = {
  count: 0,
  durations: [],
  errors: 0,
  slowRequests: 0,
};

// Keep only last 1000 requests to prevent memory issues
const MAX_STORED_DURATIONS = 1000;

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Update metrics
    metrics.count++;
    metrics.durations.push(duration);

    // Keep array size manageable
    if (metrics.durations.length > MAX_STORED_DURATIONS) {
      metrics.durations.shift();
    }

    // Track errors
    if (res.statusCode >= 500) {
      metrics.errors++;
    }

    // Track slow requests (> 1 second)
    if (duration > 1000) {
      metrics.slowRequests++;
      console.warn(
        `⚠️  Slow request: ${req.method} ${req.path} took ${duration}ms`
      );
    }

    // Log very slow requests (> 5 seconds)
    if (duration > 5000) {
      console.error(
        `🐌 Very slow request: ${req.method} ${req.path} took ${duration}ms`
      );
    }
  });

  next();
}

export function getMetrics() {
  const sorted = [...metrics.durations].sort((a, b) => a - b);
  const len = sorted.length;

  const p50 = len > 0 ? sorted[Math.floor(len * 0.5)] : 0;
  const p95 = len > 0 ? sorted[Math.floor(len * 0.95)] : 0;
  const p99 = len > 0 ? sorted[Math.floor(len * 0.99)] : 0;
  const avg = len > 0 ? sorted.reduce((a, b) => a + b, 0) / len : 0;

  return {
    requestCount: metrics.count,
    errorCount: metrics.errors,
    slowRequestCount: metrics.slowRequests,
    errorRate: metrics.count > 0 ? metrics.errors / metrics.count : 0,
    responseTimes: {
      avg: Math.round(avg),
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
    },
  };
}

export function resetMetrics() {
  metrics.count = 0;
  metrics.durations = [];
  metrics.errors = 0;
  metrics.slowRequests = 0;
}
