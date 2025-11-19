import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user information to request object
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authorization token is required',
        },
      });
      return;
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = AuthService.verifyToken(token);

    // Attach user information to request object
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    if (error instanceof Error) {
      // Handle token verification errors
      if (error.message.includes('Invalid or expired token')) {
        res.status(401).json({
          error: {
            code: 'INVALID_TOKEN',
            message: error.message,
          },
        });
        return;
      }
    }

    // Generic error
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during authentication',
      },
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user information if token is present, but doesn't require it
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = AuthService.verifyToken(token);

      req.user = {
        userId: decoded.userId,
        username: decoded.username,
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth - just continue without user info
    next();
  }
};
