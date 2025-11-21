import analyticsService from '../analyticsService';
import db from '../../database/db';

// Mock the database
jest.mock('../../database/db', () => {
  const mockDb: any = jest.fn(function(this: any) { return this; });
  mockDb.insert = jest.fn().mockReturnValue(mockDb);
  mockDb.where = jest.fn().mockReturnValue(mockDb);
  mockDb.whereNull = jest.fn().mockReturnValue(mockDb);
  mockDb.orderBy = jest.fn().mockReturnValue(mockDb);
  mockDb.first = jest.fn();
  mockDb.update = jest.fn();
  mockDb.returning = jest.fn();
  return mockDb;
});

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logEvent', () => {
    it('should log an analytics event', async () => {
      const event = {
        userId: 'user-123',
        eventType: 'quest_start' as const,
        questId: 'quest-1',
        metadata: { test: 'data' },
      };

      await analyticsService.logEvent(event);

      expect(db).toHaveBeenCalledWith('analytics_events');
      expect((db as any).insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        event_type: 'quest_start',
        quest_id: 'quest-1',
        metadata: JSON.stringify({ test: 'data' }),
      });
    });
  });

  describe('startQuestSession', () => {
    it('should start a quest session and log event', async () => {
      const mockSessionId = 'session-123';
      (db as any).returning.mockResolvedValue([{ id: mockSessionId }]);

      const sessionId = await analyticsService.startQuestSession('user-123', 'quest-1');

      expect(sessionId).toBe(mockSessionId);
      expect(db).toHaveBeenCalledWith('quest_sessions');
      expect((db as any).insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        quest_id: 'quest-1',
      });
    });
  });

  describe('endQuestSession', () => {
    it('should end a quest session and log completion event', async () => {
      const mockSession = {
        id: 'session-123',
        user_id: 'user-123',
        quest_id: 'quest-1',
        started_at: new Date(Date.now() - 60000), // 1 minute ago
      };

      (db as any).first.mockResolvedValue(mockSession);

      await analyticsService.endQuestSession('session-123', true);

      expect(db).toHaveBeenCalledWith('quest_sessions');
      expect((db as any).where).toHaveBeenCalledWith({ id: 'session-123' });
      expect((db as any).update).toHaveBeenCalled();
    });

    it('should throw error if session not found', async () => {
      (db as any).first.mockResolvedValue(null);

      await expect(analyticsService.endQuestSession('invalid-id', true)).rejects.toThrow(
        'Quest session not found'
      );
    });
  });

  describe('logCommandExecution', () => {
    it('should log a command execution event', async () => {
      await analyticsService.logCommandExecution(
        'user-123',
        'quest-1',
        'git commit -m "test"',
        true
      );

      expect(db).toHaveBeenCalledWith('analytics_events');
      expect((db as any).insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          event_type: 'command_execute',
          quest_id: 'quest-1',
          metadata: JSON.stringify({
            command: 'git commit -m "test"',
            success: true,
            error: undefined,
          }),
        })
      );
    });
  });

  describe('logHintUsage', () => {
    it('should log a hint usage event', async () => {
      await analyticsService.logHintUsage('user-123', 'quest-1', 2);

      expect(db).toHaveBeenCalledWith('analytics_events');
      expect((db as any).insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          event_type: 'hint_used',
          quest_id: 'quest-1',
          metadata: JSON.stringify({
            hintIndex: 2,
          }),
        })
      );
    });
  });

  describe('getActiveQuestSession', () => {
    it('should return active quest session', async () => {
      const mockSession = {
        id: 'session-123',
        user_id: 'user-123',
        quest_id: 'quest-1',
        started_at: new Date(),
      };

      (db as any).first.mockResolvedValue(mockSession);

      const session = await analyticsService.getActiveQuestSession('user-123', 'quest-1');

      expect(session).toEqual(mockSession);
      expect(db).toHaveBeenCalledWith('quest_sessions');
      expect((db as any).where).toHaveBeenCalledWith({
        user_id: 'user-123',
        quest_id: 'quest-1',
      });
    });

    it('should return null if no active session', async () => {
      (db as any).first.mockResolvedValue(null);

      const session = await analyticsService.getActiveQuestSession('user-123', 'quest-1');

      expect(session).toBeNull();
    });
  });
});
