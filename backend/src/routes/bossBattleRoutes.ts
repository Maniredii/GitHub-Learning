import { Router } from 'express';
import bossBattleController from '../controllers/bossBattleController';

const router = Router();

/**
 * GET /api/boss-battles
 * Get all boss battles
 */
router.get('/', bossBattleController.getAllBossBattles.bind(bossBattleController));

/**
 * GET /api/boss-battles/:id
 * Get boss battle details and initial state
 */
router.get('/:id', bossBattleController.getBossBattleById.bind(bossBattleController));

/**
 * POST /api/boss-battles/:id/validate
 * Validate if boss battle is completed
 */
router.post('/:id/validate', bossBattleController.validateBossBattle.bind(bossBattleController));

export default router;
