import { Router } from 'express';
import questController from '../controllers/questController';
import { cacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();

/**
 * GET /api/chapters
 * List all chapters
 * Cache: 10 minutes
 */
router.get('/', cacheMiddleware(600, 'chapters'), questController.getAllChapters.bind(questController));

/**
 * GET /api/chapters/:id
 * Get a specific chapter by ID
 * Cache: 10 minutes
 */
router.get('/:id', cacheMiddleware(600, 'chapter'), questController.getChapterById.bind(questController));

/**
 * GET /api/chapters/:id/quests
 * Get all quests for a specific chapter
 * Cache: 5 minutes
 */
router.get('/:id/quests', cacheMiddleware(300, 'chapter-quests'), questController.getQuestsByChapterId.bind(questController));

export default router;
