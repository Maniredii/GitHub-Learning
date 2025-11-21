import { Request, Response } from 'express';
import ProgressService from '../services/progressService';
import questService from '../services/questService';
import { cacheService } from '../services/cacheService';

export class ProgressController {
  /**
   * GET /api/progress
   * Get user's progress and statistics
   */
  async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const stats = await ProgressService.getProgressStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_PROGRESS_ERROR',
          message: 'Failed to fetch user progress',
        },
      });
    }
  }

  /**
   * POST /api/progress/complete-quest
   * Mark a quest as completed and award XP
   */
  async completeQuest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { questId } = req.body;

      if (!questId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUEST_ID',
            message: 'Quest ID is required',
          },
        });
        return;
      }

      // Get quest details
      const quest = await questService.getQuestById(questId);
      if (!quest) {
        res.status(404).json({
          success: false,
          error: {
            code: 'QUEST_NOT_FOUND',
            message: 'Quest not found',
          },
        });
        return;
      }

      // Check if already completed
      const alreadyCompleted = await ProgressService.isQuestCompleted(userId, questId);
      if (alreadyCompleted) {
        res.status(400).json({
          success: false,
          error: {
            code: 'QUEST_ALREADY_COMPLETED',
            message: 'Quest has already been completed',
          },
        });
        return;
      }

      // Complete the quest
      const result = await ProgressService.completeQuest(userId, questId, quest);

      // Invalidate user progress cache
      await cacheService.delPattern(`progress:${userId}:*`);
      await cacheService.delPattern(`user:${userId}:*`);

      res.json({
        success: true,
        data: {
          newXp: result.newXp,
          newLevel: result.newLevel,
          leveledUp: result.leveledUp,
          unlockedQuests: result.unlockedQuests,
          xpEarned: quest.xp_reward,
          ...(result.newRank && { newRank: result.newRank }),
        },
        message: result.leveledUp
          ? `Quest completed! You've leveled up to level ${result.newLevel}!`
          : `Quest completed! You earned ${quest.xp_reward} XP.`,
      });
    } catch (error) {
      console.error('Error completing quest:', error);

      if (error instanceof Error && error.message === 'Quest already completed') {
        res.status(400).json({
          success: false,
          error: {
            code: 'QUEST_ALREADY_COMPLETED',
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'COMPLETE_QUEST_ERROR',
          message: 'Failed to complete quest',
        },
      });
    }
  }
}

export default new ProgressController();
