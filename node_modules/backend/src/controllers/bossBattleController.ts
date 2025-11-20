import { Request, Response } from 'express';
import bossBattleService from '../services/bossBattleService';
import bossBattleValidationService from '../services/bossBattleValidationService';
import { RepositoryState } from '../../../shared/src/types';

export class BossBattleController {
  /**
   * GET /api/boss-battles/:id
   * Get boss battle details and initial state
   */
  async getBossBattleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const battle = await bossBattleService.getBossBattleById(id);

      if (!battle) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOSS_BATTLE_NOT_FOUND',
            message: 'Boss battle not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          battle: {
            id: battle.id,
            name: battle.name,
            description: battle.description,
            narrative: battle.narrative,
            bonusXp: battle.bonus_xp,
          },
          initialState: battle.initial_state,
        },
      });
    } catch (error) {
      console.error('Error fetching boss battle:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_BOSS_BATTLE_ERROR',
          message: 'Failed to fetch boss battle',
        },
      });
    }
  }

  /**
   * POST /api/boss-battles/:id/validate
   * Validate if boss battle is completed
   */
  async validateBossBattle(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { repositoryState } = req.body as { repositoryState: RepositoryState };

      if (!repositoryState) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REPOSITORY_STATE',
            message: 'Repository state is required for validation',
          },
        });
        return;
      }

      // Get boss battle details
      const battle = await bossBattleService.getBossBattleById(id);
      if (!battle) {
        res.status(404).json({
          success: false,
          error: {
            code: 'BOSS_BATTLE_NOT_FOUND',
            message: 'Boss battle not found',
          },
        });
        return;
      }

      // Validate the boss battle
      const validationResult = bossBattleValidationService.validateBossBattle(
        battle.victory_conditions,
        repositoryState
      );

      res.json({
        success: validationResult.success,
        feedback: validationResult.feedback,
        bonusXp: validationResult.success ? battle.bonus_xp : 0,
        details: validationResult.details,
      });
    } catch (error) {
      console.error('Error validating boss battle:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate boss battle',
        },
      });
    }
  }

  /**
   * GET /api/boss-battles
   * Get all boss battles
   */
  async getAllBossBattles(req: Request, res: Response): Promise<void> {
    try {
      const battles = await bossBattleService.getAllBossBattles();

      res.json({
        success: true,
        data: battles.map((battle) => ({
          id: battle.id,
          name: battle.name,
          description: battle.description,
          chapterId: battle.chapter_id,
          bonusXp: battle.bonus_xp,
          order: battle.order,
        })),
      });
    } catch (error) {
      console.error('Error fetching boss battles:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_BOSS_BATTLES_ERROR',
          message: 'Failed to fetch boss battles',
        },
      });
    }
  }
}

export default new BossBattleController();
