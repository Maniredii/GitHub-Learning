import db from '../database/db';
import { QuestHintTracking, CreateQuestHintTrackingInput } from '../models/QuestHintTracking';

export class HintService {
  /**
   * Get hint tracking for a user's quest
   */
  async getHintTracking(userId: string, questId: string): Promise<QuestHintTracking | null> {
    const tracking = await db('quest_hint_tracking')
      .where({ user_id: userId, quest_id: questId })
      .first();

    if (!tracking) {
      return null;
    }

    return {
      id: tracking.id,
      user_id: tracking.user_id,
      quest_id: tracking.quest_id,
      incorrect_attempts: tracking.incorrect_attempts,
      hints_shown: tracking.hints_shown,
      shown_hint_indices: tracking.shown_hint_indices,
      last_attempt_at: tracking.last_attempt_at,
      created_at: tracking.created_at,
      updated_at: tracking.updated_at,
    };
  }

  /**
   * Create or update hint tracking
   */
  async upsertHintTracking(
    userId: string,
    questId: string,
    data: Partial<CreateQuestHintTrackingInput>
  ): Promise<QuestHintTracking> {
    const existing = await this.getHintTracking(userId, questId);

    if (existing) {
      // Update existing record
      await db('quest_hint_tracking')
        .where({ user_id: userId, quest_id: questId })
        .update({
          ...data,
          updated_at: db.fn.now(),
        });

      return this.getHintTracking(userId, questId) as Promise<QuestHintTracking>;
    } else {
      // Create new record
      const [id] = await db('quest_hint_tracking').insert({
        user_id: userId,
        quest_id: questId,
        incorrect_attempts: data.incorrect_attempts || 0,
        hints_shown: data.hints_shown || 0,
        shown_hint_indices: JSON.stringify(data.shown_hint_indices || []),
        last_attempt_at: db.fn.now(),
      });

      return this.getHintTracking(userId, questId) as Promise<QuestHintTracking>;
    }
  }

  /**
   * Increment incorrect attempts
   */
  async incrementIncorrectAttempts(userId: string, questId: string): Promise<QuestHintTracking> {
    const tracking = await this.getHintTracking(userId, questId);

    if (tracking) {
      return this.upsertHintTracking(userId, questId, {
        incorrect_attempts: tracking.incorrect_attempts + 1,
      });
    } else {
      return this.upsertHintTracking(userId, questId, {
        incorrect_attempts: 1,
      });
    }
  }

  /**
   * Record hint shown
   */
  async recordHintShown(
    userId: string,
    questId: string,
    hintIndex: number
  ): Promise<QuestHintTracking> {
    const tracking = await this.getHintTracking(userId, questId);

    if (tracking) {
      const shownIndices = tracking.shown_hint_indices || [];
      if (!shownIndices.includes(hintIndex)) {
        shownIndices.push(hintIndex);
      }

      return this.upsertHintTracking(userId, questId, {
        hints_shown: tracking.hints_shown + 1,
        shown_hint_indices: shownIndices,
      });
    } else {
      return this.upsertHintTracking(userId, questId, {
        hints_shown: 1,
        shown_hint_indices: [hintIndex],
      });
    }
  }

  /**
   * Calculate XP penalty based on hints used
   */
  calculateXpPenalty(hintsShown: number, baseXp: number): number {
    // 5% penalty per hint, max 25% penalty
    const penaltyPercent = Math.min(hintsShown * 5, 25);
    const penalty = Math.floor((baseXp * penaltyPercent) / 100);
    return Math.max(baseXp - penalty, Math.floor(baseXp * 0.75));
  }

  /**
   * Get next hint for a quest
   */
  async getNextHint(
    userId: string,
    questId: string,
    questHints: string[]
  ): Promise<{ hint: string; hintIndex: number; totalHints: number } | null> {
    const tracking = await this.getHintTracking(userId, questId);
    const shownIndices = tracking?.shown_hint_indices || [];

    // Find the next hint that hasn't been shown
    for (let i = 0; i < questHints.length; i++) {
      if (!shownIndices.includes(i)) {
        return {
          hint: questHints[i],
          hintIndex: i,
          totalHints: questHints.length,
        };
      }
    }

    // All hints have been shown
    return null;
  }

  /**
   * Check if hint should be offered automatically
   */
  shouldOfferHint(incorrectAttempts: number): boolean {
    return incorrectAttempts >= 3;
  }
}

export default new HintService();
