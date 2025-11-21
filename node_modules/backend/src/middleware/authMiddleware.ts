import { Request, Response, NextFunction } from 'express';

/**
 * Stub authentication middleware - allows all requests through
 * Authentication has been disabled for this application
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set a default user ID for all requests
  req.userId = 'default-user';
  next();
};

/**
 * Optional authentication middleware - allows requests through without authentication
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set a default user ID if not present
  if (!req.userId) {
    req.userId = 'default-user';
  }
  next();
};
