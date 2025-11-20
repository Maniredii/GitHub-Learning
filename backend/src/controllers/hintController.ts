import { Request, Response } from 'express';
import hintService from '../services/hintService';
import questService from '../services/questService';

export class HintController {
  /**
   * GET /api/hints/:questId
   * Get hint tracking for a quest
   */
  async getHintTracking(req: Request, res: Response): Promise<void> {
    try {
      const { questId } = req.params;
      const userId = (req as any).user?.id;

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

      const tracking = await hintService.getHintTracking(userId, questId);

      res.json({
        success: true,
        data: tracking || {
          incorrect_attempts: 0,
          hints_shown: 0,
          shown_hint_indices: [],
        },
      });
    } catch (error) {
      console.error('Error fetching hint tracking:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_HINT_TRACKING_ERROR',
          message: 'Failed to fetch hint tracking',
        },
      });
    }
  }

  /**
   * POST /api/hints/:questId/next
   * Get the next hint for a quest
   */
  async getNextHint(req: Request, res: Response): Promise<void> {
    try {
      const { questId } = req.params;
      const userId = (req as any).user?.id;

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

      // Get quest to access hints
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

      // Get next hint
      const nextHint = await hintService.getNextHint(userId, questId, quest.hints);

      if (!nextHint) {
        res.json({
          success: true,
          data: {
            hint: null,
            message: 'All hints have been shown',
          },
        });
        return;
      }

      // Record that this hint was shown
      await hintService.recordHintShown(userId, questId, nextHint.hintIndex);

      // Calculate XP penalty
      const tracking = await hintService.getHintTracking(userId, questId);
      const adjustedXp = hintService.calculateXpPenalty(
        tracking?.hints_shown || 0,
        quest.xp_reward
      );

      res.json({
        success: true,
        data: {
          hint: nextHint.hint,
          hintIndex: nextHint.hintIndex,
          totalHints: nextHint.totalHints,
          hintsShown: tracking?.hints_shown || 0,
          adjustedXp,
          xpPenalty: quest.xp_reward - adjustedXp,
        },
      });
    } catch (error) {
      console.error('Error getting next hint:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_HINT_ERROR',
          message: 'Failed to get hint',
        },
      });
    }
  }

  /**
   * POST /api/hints/:questId/incorrect-attempt
   * Record an incorrect attempt
   */
  async recordIncorrectAttempt(req: Request, res: Response): Promise<void> {
    try {
      const { questId } = req.params;
      const userId = (req as any).user?.id;

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

      const tracking = await hintService.incrementIncorrectAttempts(userId, questId);
      const shouldOffer = hintService.shouldOfferHint(tracking.incorrect_attempts);

      res.json({
        success: true,
        data: {
          incorrect_attempts: tracking.incorrect_attempts,
          should_offer_hint: shouldOffer,
        },
      });
    } catch (error) {
      console.error('Error recording incorrect attempt:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'RECORD_ATTEMPT_ERROR',
          message: 'Failed to record incorrect attempt',
        },
      });
    }
  }
}

export default new HintController();
