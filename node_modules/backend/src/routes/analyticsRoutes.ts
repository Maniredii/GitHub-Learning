import { Router } from 'express';
import analyticsController from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All analytics routes require authentication
// In production, you'd want to add admin-only middleware here
router.use(authMiddleware);

/**
 * GET /api/analytics/summary
 * Get overall analytics summary
 */
router.get('/summary', analyticsController.getSummary.bind(analyticsController));

/**
 * GET /api/analytics/quest-completion-rates
 * Get quest completion rates
 */
router.get(
  '/quest-completion-rates',
  analyticsController.getQuestCompletionRates.bind(analyticsController)
);

/**
 * GET /api/analytics/quest-average-times
 * Get average time spent per quest
 */
router.get(
  '/quest-average-times',
  analyticsController.getQuestAverageTimes.bind(analyticsController)
);

/**
 * GET /api/analytics/common-errors
 * Get common error patterns
 */
router.get(
  '/common-errors',
  analyticsController.getCommonErrors.bind(analyticsController)
);

/**
 * GET /api/analytics/retention-rates
 * Get retention rates
 */
router.get(
  '/retention-rates',
  analyticsController.getRetentionRates.bind(analyticsController)
);

export default router;
