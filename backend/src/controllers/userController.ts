import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class UserController {
  /**
   * Get user profile with progress and achievements
   * GET /api/users/profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const profile = await UserService.getUserProfile(userId);

      res.status(200).json(profile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while fetching user profile',
        },
      });
    }
  }
}
