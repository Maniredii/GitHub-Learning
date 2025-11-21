import db from '../database/db';

export interface AnalyticsEvent {
  userId?: string;
  eventType: 'quest_start' | 'quest_complete' | 'quest_fail' | 'command_execute' | 'hint_used';
  questId?: string;
  metadata?: Record<string, any>;
}

export interface QuestSession {
  id?: string;
  userId: string;
  questId: string;
  startedAt?: Date;
  endedAt?: Date;
  timeSpentSeconds?: number;
  completed?: boolean;
}

class AnalyticsService {
  /**
   * Log an analytics event
   */
  async logEvent(event: AnalyticsEvent): Promise<void> {
    await db('analytics_events').insert({
      user_id: event.userId,
      event_type: event.eventType,
      quest_id: event.questId,
      metadata: JSON.stringify(event.metadata || {}),
    });
  }

  /**
   * Start a quest session
   */
  async startQuestSession(userId: string, questId: string): Promise<string> {
    const [session] = await db('quest_sessions')
      .insert({
        user_id: userId,
        quest_id: questId,
      })
      .returning('id');

    // Log quest start event
    await this.logEvent({
      userId,
      eventType: 'quest_start',
      questId,
    });

    return session.id;
  }

  /**
   * End a quest session
   */
  async endQuestSession(sessionId: string, completed: boolean): Promise<void> {
    const session = await db('quest_sessions')
      .where({ id: sessionId })
      .first();

    if (!session) {
      throw new Error('Quest session not found');
    }

    const endedAt = new Date();
    const timeSpentSeconds = Math.floor(
      (endedAt.getTime() - new Date(session.started_at).getTime()) / 1000
    );

    await db('quest_sessions')
      .where({ id: sessionId })
      .update({
        ended_at: endedAt,
        time_spent_seconds: timeSpentSeconds,
        completed,
      });

    // Log quest completion or failure event
    await this.logEvent({
      userId: session.user_id,
      eventType: completed ? 'quest_complete' : 'quest_fail',
      questId: session.quest_id,
      metadata: {
        timeSpentSeconds,
      },
    });
  }

  /**
   * Log a command execution event
   */
  async logCommandExecution(
    userId: string,
    questId: string,
    command: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'command_execute',
      questId,
      metadata: {
        command,
        success,
        error,
      },
    });
  }

  /**
   * Log a hint usage event
   */
  async logHintUsage(
    userId: string,
    questId: string,
    hintIndex: number
  ): Promise<void> {
    await this.logEvent({
      userId,
      eventType: 'hint_used',
      questId,
      metadata: {
        hintIndex,
      },
    });
  }

  /**
   * Get active quest session for user and quest
   */
  async getActiveQuestSession(userId: string, questId: string): Promise<QuestSession | null> {
    const session = await db('quest_sessions')
      .where({
        user_id: userId,
        quest_id: questId,
      })
      .whereNull('ended_at')
      .orderBy('started_at', 'desc')
      .first();

    return session || null;
  }
}

export default new AnalyticsService();
