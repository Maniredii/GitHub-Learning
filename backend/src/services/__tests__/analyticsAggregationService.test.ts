import analyticsAggregationService from '../analyticsAggregationService';
import db from '../../database/db';

// Mock the database
jest.mock('../../database/db', () => {
  const mockDb: any = jest.fn(function(this: any) { return this; });
  mockDb.select = jest.fn().mockReturnValue(mockDb);
  mockDb.count = jest.fn().mockReturnValue(mockDb);
  mockDb.countDistinct = jest.fn().mockReturnValue(mockDb);
  mockDb.sum = jest.fn().mockReturnValue(mockDb);
  mockDb.avg = jest.fn().mockReturnValue(mockDb);
  mockDb.where = jest.fn().mockReturnValue(mockDb);
  mockDb.whereIn = jest.fn().mockReturnValue(mockDb);
  mockDb.whereNotNull = jest.fn().mockReturnValue(mockDb);
  mockDb.groupBy = jest.fn().mockReturnValue(mockDb);
  mockDb.orderBy = jest.fn().mockReturnValue(mockDb);
  mockDb.limit = jest.fn().mockReturnValue(mockDb);
  mockDb.first = jest.fn();
  mockDb.raw = jest.fn((sql: string) => sql);
  return mockDb;
});

describe('AnalyticsAggregationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuestCompletionRates', () => {
    it('should return quest completion rates', async () => {
      const mockResults = [
        {
          quest_id: 'quest-1',
          total_attempts: '10',
          completions: '7',
          failures: '3',
        },
        {
          quest_id: 'quest-2',
          total_attempts: '5',
          completions: '2',
          failures: '3',
        },
      ];

      (db as any).whereIn.mockResolvedValue(mockResults);

      const rates = await analyticsAggregationService.getQuestCompletionRates();

      expect(rates).toHaveLength(2);
      expect(rates[0]).toEqual({
        questId: 'quest-1',
        totalAttempts: 10,
        completions: 7,
        failures: 3,
        completionRate: 70,
      });
    });

    it('should filter by quest IDs when provided', async () => {
      (db as any).whereIn.mockResolvedValue([]);

      await analyticsAggregationService.getQuestCompletionRates(['quest-1', 'quest-2']);

      expect((db as any).whereIn).toHaveBeenCalledWith('quest_id', ['quest-1', 'quest-2']);
    });
  });

  describe('getQuestAverageTimes', () => {
    it('should return average times per quest', async () => {
      const mockResults = [
        {
          quest_id: 'quest-1',
          avg_time: '120.5',
          total_sessions: '10',
        },
      ];

      const mockMedian = { median: '115' };

      (db as any).groupBy.mockResolvedValue(mockResults);
      (db as any).first.mockResolvedValue(mockMedian);

      const times = await analyticsAggregationService.getQuestAverageTimes();

      expect(times).toHaveLength(1);
      expect(times[0]).toEqual({
        questId: 'quest-1',
        averageTimeSeconds: 121,
        medianTimeSeconds: 115,
        totalSessions: 10,
      });
    });
  });

  describe('getCommonErrors', () => {
    it('should return common error patterns', async () => {
      const mockResults = [
        {
          quest_id: 'quest-1',
          command: 'git commit',
          error_message: 'nothing to commit',
          occurrences: '15',
        },
      ];

      (db as any).limit.mockResolvedValue(mockResults);

      const errors = await analyticsAggregationService.getCommonErrors();

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        questId: 'quest-1',
        command: 'git commit',
        errorMessage: 'nothing to commit',
        occurrences: 15,
      });
    });

    it('should filter by quest ID when provided', async () => {
      (db as any).limit.mockResolvedValue([]);

      await analyticsAggregationService.getCommonErrors('quest-1', 5);

      expect((db as any).where).toHaveBeenCalledWith('quest_id', 'quest-1');
      expect((db as any).limit).toHaveBeenCalledWith(5);
    });
  });

  describe('getAnalyticsSummary', () => {
    it('should return overall analytics summary', async () => {
      const mockCounts = { count: '100' };

      (db as any).first.mockResolvedValue(mockCounts);

      const summary = await analyticsAggregationService.getAnalyticsSummary();

      expect(summary).toHaveProperty('totalUsers');
      expect(summary).toHaveProperty('totalQuestStarts');
      expect(summary).toHaveProperty('totalQuestCompletions');
      expect(summary).toHaveProperty('overallCompletionRate');
    });
  });
});
