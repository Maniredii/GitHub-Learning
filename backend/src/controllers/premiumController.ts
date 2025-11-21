import { Request, Response } from 'express';
import premiumService from '../services/premiumService';

export class PremiumController {
  /**
   * Get current user's premium status
   */
  async getPremiumStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } });
        return;
      }

      const status = await premiumService.getPremiumStatus(userId);
      res.json(status);
    } catch (error) {
      console.error('Error getting premium status:', error);
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get premium status',
        },
      });
    }
  }
}

export default new PremiumController();
