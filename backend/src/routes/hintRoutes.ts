import { Router } from 'express';
import hintController from '../controllers/hintController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/hints/:questId
 * Get hint tracking for a quest (requires authentication)
 */
router.get('/:questId', authMiddleware, hintController.getHintTracking.bind(hintController));

/**
 * POST /api/hints/:questId/next
 * Get the next hint for a quest (requires authentication)
 */
router.post('/:questId/next', authMiddleware, hintController.getNextHint.bind(hintController));

/**
 * POST /api/hints/:questId/incorrect-attempt
 * Record an incorrect attempt (requires authentication)
 */
router.post(
  '/:questId/incorrect-attempt',
  authMiddleware,
  hintController.recordIncorrectAttempt.bind(hintController)
);

export default router;
