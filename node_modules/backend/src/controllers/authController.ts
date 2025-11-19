import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body;

      // Validate required fields
      if (!email || !username || !password) {
        res.status(400).json({
          error: {
            code: 'MISSING_FIELDS',
            message: 'Email, username, and password are required',
          },
        });
        return;
      }

      // Register user
      const result = await AuthService.register({ email, username, password });

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific errors
        if (error.message.includes('already registered') || error.message.includes('already taken')) {
          res.status(409).json({
            error: {
              code: 'DUPLICATE_USER',
              message: error.message,
            },
          });
          return;
        }

        if (error.message.includes('Invalid email') || error.message.includes('Password must')) {
          res.status(400).json({
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
            },
          });
          return;
        }
      }

      // Generic error
      console.error('Registration error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during registration',
        },
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({
          error: {
            code: 'MISSING_FIELDS',
            message: 'Email and password are required',
          },
        });
        return;
      }

      // Login user
      const result = await AuthService.login({ email, password });

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        // Handle invalid credentials
        if (error.message.includes('Invalid email or password')) {
          res.status(401).json({
            error: {
              code: 'INVALID_CREDENTIALS',
              message: error.message,
            },
          });
          return;
        }
      }

      // Generic error
      console.error('Login error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during login',
        },
      });
    }
  }

  /**
   * Verify token
   * GET /api/auth/verify
   */
  static async verify(req: Request, res: Response): Promise<void> {
    try {
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

      const token = authHeader.substring(7);
      const decoded = AuthService.verifyToken(token);

      res.status(200).json({
        valid: true,
        user: decoded,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid or expired token')) {
        res.status(401).json({
          error: {
            code: 'INVALID_TOKEN',
            message: error.message,
          },
        });
        return;
      }

      console.error('Token verification error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during token verification',
        },
      });
    }
  }
}
