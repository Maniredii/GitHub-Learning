import { Router } from 'express';
import questController from '../controllers/questController';
import { optionalAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/quests
 * List all quests with optional filtering
 * Query params:
 *   - chapter: Filter by chapter ID
 *   - unlocked: Filter by unlock status (requires authentication)
 */
router.get('/', optionalAuthMiddleware, questController.getAllQuests.bind(questController));

/**
 * GET /api/quests/:id
 * Get a specific quest by ID
 */
router.get('/:id', questController.getQuestById.bind(questController));

/**
 * POST /api/quests/:id/validate
 * Validate if a quest's objectives are met
 */
router.post('/:id/validate', questController.validateQuest.bind(questController));

export default router;
