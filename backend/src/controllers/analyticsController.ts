import { Request, Response } from 'express';
import analyticsAggregationService from '../services/analyticsAggregationService';

export class AnalyticsController {
  /**
   * GET /api/analytics/summary
   * Get overall analytics summary
   */
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const summary = await analyticsAggregationService.getAnalyticsSummary(start, end);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SUMMARY_ERROR',
          message: 'Failed to fetch analytics summary',
        },
      });
    }
  }

  /**
   * GET /api/analytics/quest-completion-rates
   * Get quest completion rates
   */
  async getQuestCompletionRates(req: Request, res: Response): Promise<void> {
    try {
      const { questIds } = req.query;
      const questIdArray = questIds
        ? (questIds as string).split(',')
        : undefined;

      const rates = await analyticsAggregationService.getQuestCompletionRates(questIdArray);

      res.json({
        success: true,
        data: rates,
      });
    } catch (error) {
      console.error('Error fetching quest completion rates:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_COMPLETION_RATES_ERROR',
          message: 'Failed to fetch quest completion rates',
        },
      });
    }
  }

  /**
   * GET /api/analytics/quest-average-times
   * Get average time spent per quest
   */
  async getQuestAverageTimes(req: Request, res: Response): Promise<void> {
    try {
      const { questIds } = req.query;
      const questIdArray = questIds
        ? (questIds as string).split(',')
        : undefined;

      const times = await analyticsAggregationService.getQuestAverageTimes(questIdArray);

      res.json({
        success: true,
        data: times,
      });
    } catch (error) {
      console.error('Error fetching quest average times:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_AVERAGE_TIMES_ERROR',
          message: 'Failed to fetch quest average times',
        },
      });
    }
  }

  /**
   * GET /api/analytics/common-errors
   * Get common error patterns
   */
  async getCommonErrors(req: Request, res: Response): Promise<void> {
    try {
      const { questId, limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 10;

      const errors = await analyticsAggregationService.getCommonErrors(
        questId as string | undefined,
        limitNum
      );

      res.json({
        success: true,
        data: errors,
      });
    } catch (error) {
      console.error('Error fetching common errors:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_COMMON_ERRORS_ERROR',
          message: 'Failed to fetch common errors',
        },
      });
    }
  }

  /**
   * GET /api/analytics/retention-rates
   * Get retention rates
   */
  async getRetentionRates(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const retention = await analyticsAggregationService.getRetentionRates(start, end);

      res.json({
        success: true,
        data: retention,
      });
    } catch (error) {
      console.error('Error fetching retention rates:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_RETENTION_RATES_ERROR',
          message: 'Failed to fetch retention rates',
        },
      });
    }
  }
}

export default new AnalyticsController();
