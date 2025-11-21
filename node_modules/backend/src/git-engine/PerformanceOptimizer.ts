/**
 * Performance optimization utilities for Git Engine
 */

export class PerformanceCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  /**
   * Get cached value if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached value with TTL in milliseconds
   */
  set(key: string, data: any, ttl: number = 5000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear specific cache entry
   */
  clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * Clear cache entries matching a pattern
   */
  clearPattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }
}

/**
 * Memoization decorator for expensive operations
 */
export function memoize(ttl: number = 5000) {
  const cache = new Map<string, { result: any; timestamp: number }>();

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.result;
      }

      const result = originalMethod.apply(this, args);
      cache.set(cacheKey, { result, timestamp: Date.now() });

      return result;
    };

    return descriptor;
  };
}

/**
 * Lazy loading wrapper for large data structures
 */
export class LazyLoader<T> {
  private data: T | null = null;
  private loader: () => T;
  private loaded = false;

  constructor(loader: () => T) {
    this.loader = loader;
  }

  get value(): T {
    if (!this.loaded) {
      this.data = this.loader();
      this.loaded = true;
    }
    return this.data!;
  }

  reset(): void {
    this.data = null;
    this.loaded = false;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

/**
 * Batch processor for operations that can be batched
 */
export class BatchProcessor<T, R> {
  private queue: T[] = [];
  private processor: (items: T[]) => R[];
  private batchSize: number;
  private timeout: NodeJS.Timeout | null = null;
  private delay: number;

  constructor(processor: (items: T[]) => R[], batchSize: number = 10, delay: number = 100) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push(item);

      if (this.queue.length >= this.batchSize) {
        this.flush();
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.delay);
      }
    });
  }

  private flush(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) {
      return;
    }

    const items = this.queue.splice(0, this.batchSize);
    this.processor(items);
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private metrics: Map<string, { count: number; totalTime: number; maxTime: number }> = new Map();

  /**
   * Measure execution time of a function
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      throw error;
    }
  }

  /**
   * Measure execution time of an async function
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      throw error;
    }
  }

  private recordMetric(name: string, duration: number): void {
    const existing = this.metrics.get(name);
    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.maxTime = Math.max(existing.maxTime, duration);
    } else {
      this.metrics.set(name, {
        count: 1,
        totalTime: duration,
        maxTime: duration,
      });
    }
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(name: string): { count: number; avgTime: number; maxTime: number } | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      return null;
    }

    return {
      count: metric.count,
      avgTime: metric.totalTime / metric.count,
      maxTime: metric.maxTime,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, { count: number; avgTime: number; maxTime: number }> {
    const result: Record<string, { count: number; avgTime: number; maxTime: number }> = {};
    this.metrics.forEach((metric, name) => {
      result[name] = {
        count: metric.count,
        avgTime: metric.totalTime / metric.count,
        maxTime: metric.maxTime,
      };
    });
    return result;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Log metrics to console
   */
  logMetrics(): void {
    console.log('=== Git Engine Performance Metrics ===');
    this.metrics.forEach((metric, name) => {
      const avgTime = (metric.totalTime / metric.count).toFixed(2);
      const maxTime = metric.maxTime.toFixed(2);
      console.log(
        `${name}: ${metric.count} calls, avg: ${avgTime}ms, max: ${maxTime}ms`
      );
    });
  }
}
