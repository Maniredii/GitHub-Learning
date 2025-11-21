import { Router } from 'express';
import progressController from '../controllers/progressController';
import { authMiddleware } from '../middleware/authMiddleware';
import { userCacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();

/**
 * GET /api/progress
 * Get user's progress and statistics
 * Requires authentication
 * Cache: 30 seconds (short TTL for frequently updated data)
 */
router.get('/', authMiddleware, userCacheMiddleware(30, 'progress'), progressController.getProgress.bind(progressController));

/**
 * POST /api/progress/complete-quest
 * Mark a quest as completed and award XP
 * Requires authentication
 * Body: { questId: string }
 */
router.post(
  '/complete-quest',
  authMiddleware,
  progressController.completeQuest.bind(progressController)
);

export default router;
