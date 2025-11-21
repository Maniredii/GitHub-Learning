import { Router } from 'express';
import questController from '../controllers/questController';

const router = Router();

/**
 * GET /api/chapters
 * List all chapters
 */
router.get('/', questController.getAllChapters.bind(questController));

/**
 * GET /api/chapters/:id
 * Get a specific chapter by ID
 */
router.get('/:id', questController.getChapterById.bind(questController));

/**
 * GET /api/chapters/:id/quests
 * Get all quests for a specific chapter
 */
router.get('/:id/quests', questController.getQuestsByChapterId.bind(questController));

export default router;
