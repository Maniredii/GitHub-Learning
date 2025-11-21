import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';

/**
 * Middleware to cache GET request responses
 * @param ttlSeconds Time to live in seconds
 * @param keyPrefix Optional prefix for cache key
 */
export const cacheMiddleware = (ttlSeconds: number, keyPrefix?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if cache is not available
    if (!cacheService.isAvailable()) {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `${keyPrefix || 'api'}:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        return res.json(cachedData);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function (data: any) {
        // Cache the response
        cacheService.set(cacheKey, data, ttlSeconds).catch((err) => {
          console.error('Failed to cache response:', err);
        });

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Middleware to cache responses with user-specific keys
 * @param ttlSeconds Time to live in seconds
 * @param keyPrefix Optional prefix for cache key
 */
export const userCacheMiddleware = (ttlSeconds: number, keyPrefix?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if cache is not available
    if (!cacheService.isAvailable()) {
      return next();
    }

    // Get user ID from request (set by auth middleware)
    const userId = (req as any).user?.id;
    if (!userId) {
      return next();
    }

    // Generate user-specific cache key
    const cacheKey = `${keyPrefix || 'user'}:${userId}:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      
      if (cachedData) {
        return res.json(cachedData);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function (data: any) {
        // Cache the response
        cacheService.set(cacheKey, data, ttlSeconds).catch((err) => {
          console.error('Failed to cache response:', err);
        });

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('User cache middleware error:', error);
      next();
    }
  };
};
