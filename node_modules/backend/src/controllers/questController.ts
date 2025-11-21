import { Request, Response } from 'express';
import questService from '../services/questService';
import questValidationService from '../services/questValidationService';
import analyticsService from '../services/analyticsService';
import { RepositoryState } from '../../../shared/src/types';

export class QuestController {
  /**
   * GET /api/quests
   * List all quests with optional filtering
   */
  async getAllQuests(req: Request, res: Response): Promise<void> {
    try {
      const { chapter, unlocked } = req.query;
      const userId = (req as any).user?.id; // From auth middleware

      const filters: any = {};

      if (chapter) {
        filters.chapterId = chapter as string;
      }

      if (unlocked !== undefined) {
        filters.unlocked = unlocked === 'true';
        filters.userId = userId;
      }

      const quests = await questService.getAllQuests(filters);

      res.json({
        success: true,
        data: quests,
      });
    } catch (error) {
      console.error('Error fetching quests:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_QUESTS_ERROR',
          message: 'Failed to fetch quests',
        },
      });
    }
  }

  /**
   * GET /api/quests/:id
   * Get a specific quest by ID
   */
  async getQuestById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const quest = await questService.getQuestById(id);

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

      // Check if user can access this quest
      if (userId) {
        const accessCheck = await questService.canAccessQuest(userId, id);
        if (!accessCheck.canAccess) {
          res.status(403).json({
            success: false,
            error: {
              code: accessCheck.reason === 'premium_required' ? 'PREMIUM_REQUIRED' : 'ACCESS_DENIED',
              message: accessCheck.reason === 'premium_required' 
                ? 'This quest requires premium access' 
                : 'You do not have access to this quest',
            },
          });
          return;
        }

        // Start quest session if not already active
        const activeSession = await analyticsService.getActiveQuestSession(userId, id);
        if (!activeSession) {
          await analyticsService.startQuestSession(userId, id);
        }
      }

      res.json({
        success: true,
        data: quest,
      });
    } catch (error) {
      console.error('Error fetching quest:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_QUEST_ERROR',
          message: 'Failed to fetch quest',
        },
      });
    }
  }

  /**
   * GET /api/chapters
   * List all chapters
   */
  async getAllChapters(req: Request, res: Response): Promise<void> {
    try {
      const chapters = await questService.getAllChapters();

      res.json({
        success: true,
        data: chapters,
      });
    } catch (error) {
      console.error('Error fetching chapters:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_CHAPTERS_ERROR',
          message: 'Failed to fetch chapters',
        },
      });
    }
  }

  /**
   * GET /api/chapters/:id
   * Get a specific chapter by ID
   */
  async getChapterById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const chapter = await questService.getChapterById(id);

      if (!chapter) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHAPTER_NOT_FOUND',
            message: 'Chapter not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: chapter,
      });
    } catch (error) {
      console.error('Error fetching chapter:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_CHAPTER_ERROR',
          message: 'Failed to fetch chapter',
        },
      });
    }
  }

  /**
   * GET /api/chapters/:id/quests
   * Get all quests for a specific chapter
   */
  async getQuestsByChapterId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verify chapter exists
      const chapter = await questService.getChapterById(id);
      if (!chapter) {
        res.status(404).json({
          success: false,
          error: {
            code: 'CHAPTER_NOT_FOUND',
            message: 'Chapter not found',
          },
        });
        return;
      }

      const quests = await questService.getQuestsByChapterId(id);

      res.json({
        success: true,
        data: quests,
      });
    } catch (error) {
      console.error('Error fetching chapter quests:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_CHAPTER_QUESTS_ERROR',
          message: 'Failed to fetch chapter quests',
        },
      });
    }
  }

  /**
   * POST /api/quests/:id/validate
   * Validate if a quest's objectives are met
   */
  async validateQuest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { repositoryState } = req.body as { repositoryState: RepositoryState };
      const userId = (req as any).user?.userId;

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

      // Get quest details
      const quest = await questService.getQuestById(id);
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

      // Validate the quest
      const validationResult = questValidationService.validateQuest(
        quest.validation_criteria,
        repositoryState,
        quest.initial_repository_state
      );

      // End quest session if user is authenticated
      if (userId) {
        const activeSession = await analyticsService.getActiveQuestSession(userId, id);
        if (activeSession) {
          await analyticsService.endQuestSession(activeSession.id!, validationResult.success);
        }
      }

      res.json({
        success: validationResult.success,
        feedback: validationResult.feedback,
        xpAwarded: validationResult.success ? quest.xp_reward : 0,
        details: validationResult.details,
      });
    } catch (error) {
      console.error('Error validating quest:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate quest',
        },
      });
    }
  }
}

export default new QuestController();
