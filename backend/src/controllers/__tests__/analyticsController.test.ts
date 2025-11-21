import { Request, Response } from 'express';
import analyticsController from '../analyticsController';
import analyticsAggregationService from '../../services/analyticsAggregationService';

// Mock the analytics aggregation service
jest.mock('../../services/analyticsAggregationService');

describe('AnalyticsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      query: {},
    };

    mockResponse = {
      json: jsonMock,
      status: statusMock,
    };

    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return analytics summary', async () => {
      const mockSummary = {
        totalUsers: 100,
        totalQuestStarts: 500,
        totalQuestCompletions: 350,
        totalCommands: 2000,
        totalHintsUsed: 150,
        overallCompletionRate: 70,
      };

      (analyticsAggregationService.getAnalyticsSummary as jest.Mock).mockResolvedValue(
        mockSummary
      );

      await analyticsController.getSummary(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(analyticsAggregationService.getAnalyticsSummary).toHaveBeenCalledWith(
        undefined,
        undefined
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockSummary,
      });
    });

    it('should handle date range filters', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      mockRequest.query = { startDate, endDate };

      const mockSummary = {
        totalUsers: 50,
        totalQuestStarts: 200,
        totalQuestCompletions: 150,
        totalCommands: 800,
        totalHintsUsed: 50,
        overallCompletionRate: 75,
      };

      (analyticsAggregationService.getAnalyticsSummary as jest.Mock).mockResolvedValue(
        mockSummary
      );

      await analyticsController.getSummary(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(analyticsAggregationService.getAnalyticsSummary).toHaveBeenCalledWith(
        new Date(startDate),
        new Date(endDate)
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockSummary,
      });
    });

    it('should handle errors', async () => {
      (analyticsAggregationService.getAnalyticsSummary as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await analyticsController.getSummary(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_SUMMARY_ERROR',
          message: 'Failed to fetch analytics summary',
        },
      });
    });
  });

  describe('getQuestCompletionRates', () => {
    it('should return quest completion rates', async () => {
      const mockRates = [
        {
          questId: 'quest-1',
          totalAttempts: 100,
          completions: 70,
          failures: 30,
          completionRate: 70,
        },
        {
          questId: 'quest-2',
          totalAttempts: 50,
          completions: 40,
          failures: 10,
          completionRate: 80,
        },
      ];

      (analyticsAggregationService.getQuestCompletionRates as jest.Mock).mockResolvedValue(
        mockRates
      );

      await analyticsController.getQuestCompletionRates(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(analyticsAggregationService.getQuestCompletionRates).toHaveBeenCalledWith(
        undefined
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockRates,
      });
    });

    it('should filter by quest IDs', async () => {
      mockRequest.query = { questIds: 'quest-1,quest-2' };

      const mockRates = [
        {
          questId: 'quest-1',
          totalAttempts: 100,
          completions: 70,
          failures: 30,
          completionRate: 70,
        },
      ];

      (analyticsAggregationService.getQuestCompletionRates as jest.Mock).mockResolvedValue(
        mockRates
      );

      await analyticsController.getQuestCompletionRates(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(analyticsAggregationService.getQuestCompletionRates).toHaveBeenCalledWith([
        'quest-1',
        'quest-2',
      ]);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockRates,
      });
    });

    it('should handle errors', async () => {
      (analyticsAggregationService.getQuestCompletionRates as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await analyticsController.getQuestCompletionRates(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_COMPLETION_RATES_ERROR',
          message: 'Failed to fetch quest completion rates',
        },
      });
    });
  });

  describe('getQuestAverageTimes', () => {
    it('should return quest average times', async () => {
      const mockTimes = [
        {
          questId: 'quest-1',
          averageTimeSeconds: 120,
          medianTimeSeconds: 115,
          totalSessions: 50,
        },
        {
          questId: 'quest-2',
          averageTimeSeconds: 180,
          medianTimeSeconds: 170,
          totalSessions: 30,
        },
      ];

      (analyticsAggregationService.getQuestAverageTimes as jest.Mock).mockResolvedValue(
        mockTimes
      );

      await analyticsController.getQuestAverageTimes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(analyticsAggregationService.getQuestAverageTimes).toHaveBeenCalledWith(
        undefined
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockTimes,
      });
    });

    it('should filter by quest IDs', async () => {
      mockRequest.query = { questIds: 'quest-1' };

      const mockTimes = [
        {
          questId: 'quest-1',
          averageTimeSeconds: 120,
          medianTimeSeconds: 115,
          totalSessions: 50,
        },
      ];

      (analyticsAggregationService.getQuestAverageTimes as jest.Mock).mockResolvedValue(
        mockTimes
      );

      await analyticsController.getQuestAverageTimes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(analyticsAggregationService.getQuestAverageTimes).toHaveBeenCalledWith([
        'quest-1',
      ]);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockTimes,
      });
    });

    it('should handle errors', async () => {
      (analyticsAggregationService.getQuestAverageTimes as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await analyticsController.getQuestAverageTimes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_AVERAGE_TIMES_ERROR',
          message: 'Failed to fetch quest average times',
        },
      });
    });
  });

  describe('getCommonErrors', () => {
    it('should return common errors', async () => {
      const mockErrors = [
        {
          questId: 'quest-1',
          command: 'git commit',
          errorMessage: 'nothing to commit',
          occurrences: 25,
        },
        {
          questId: 'quest-1',
          command: 'git push',
          errorMessage: 'no upstream branch',
          occurrences: 15,
        },
      ];

      (analyticsAggregationService.getCommonErrors as jest.Mock).mockResolvedValue(
        mockErrors
      );

      await analyticsController.getCommonErrors(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(analyticsAggregationService.getCommonErrors).toHaveBeenCalledWith(
        undefined,
        10
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockErrors,
      });
    });

    it('should filter by quest ID and limit', async () => {
      mockRequest.query = { questId: 'quest-1', limit: '5' };

      const mockErrors = [
        {
          questId: 'quest-1',
          command: 'git commit',
          errorMessage: 'nothing to commit',
          occurrences: 25,
        },
      ];

      (analyticsAggregationService.getCommonErrors as jest.Mock).mockResolvedValue(
        mockErrors
      );

      await analyticsController.getCommonErrors(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(analyticsAggregationService.getCommonErrors).toHaveBeenCalledWith(
        'quest-1',
        5
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockErrors,
      });
    });

    it('should handle errors', async () => {
      (analyticsAggregationService.getCommonErrors as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await analyticsController.getCommonErrors(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_COMMON_ERRORS_ERROR',
          message: 'Failed to fetch common errors',
        },
      });
    });
  });

  describe('getRetentionRates', () => {
    it('should return retention rates', async () => {
      const mockRetention = {
        day1: [
          {
            period: '1day' as const,
            cohortDate: '2024-01-01',
            totalUsers: 100,
            returnedUsers: 80,
            retentionRate: 80,
          },
        ],
        day7: [
          {
            period: '7day' as const,
            cohortDate: '2024-01-01',
            totalUsers: 100,
            returnedUsers: 60,
            retentionRate: 60,
          },
        ],
        day30: [
          {
            period: '30day' as const,
            cohortDate: '2024-01-01',
            totalUsers: 100,
            returnedUsers: 40,
            retentionRate: 40,
          },
        ],
      };

      (analyticsAggregationService.getRetentionRates as jest.Mock).mockResolvedValue(
        mockRetention
      );

      await analyticsController.getRetentionRates(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(analyticsAggregationService.getRetentionRates).toHaveBeenCalledWith(
        undefined,
        undefined
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockRetention,
      });
    });

    it('should handle date range filters', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      mockRequest.query = { startDate, endDate };

      const mockRetention = {
        day1: [],
        day7: [],
        day30: [],
      };

      (analyticsAggregationService.getRetentionRates as jest.Mock).mockResolvedValue(
        mockRetention
      );

      await analyticsController.getRetentionRates(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(analyticsAggregationService.getRetentionRates).toHaveBeenCalledWith(
        new Date(startDate),
        new Date(endDate)
      );
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockRetention,
      });
    });

    it('should handle errors', async () => {
      (analyticsAggregationService.getRetentionRates as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await analyticsController.getRetentionRates(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_RETENTION_RATES_ERROR',
          message: 'Failed to fetch retention rates',
        },
      });
    });
  });
});