import hintService from '../hintService';
import db from '../../database/db';
import { v4 as uuidv4 } from 'uuid';

describe('HintService', () => {
  const testUserId = uuidv4();
  const testQuestId = uuidv4();
  const testChapterId = uuidv4();
  const testUsername = `testuser_${testUserId.substring(0, 8)}`;
  const testEmail = `test_${testUserId.substring(0, 8)}@example.com`;

  // Helper function to create a test quest
  const createTestQuest = async (questId: string) => {
    await db('quests').insert({
      id: questId,
      chapter_id: testChapterId,
      title: `Test Quest ${questId.substring(0, 8)}`,
      narrative: 'Test quest narrative',
      objective: 'Test quest objective',
      hints: JSON.stringify(['Hint 1', 'Hint 2', 'Hint 3']),
      xp_reward: 100,
      order: Math.floor(Math.random() * 10000) + 1000,
      validation_criteria: JSON.stringify({}),
    });

    // Verify the quest was created
    const quest = await db('quests').where({ id: questId }).first();
    if (!quest) {
      throw new Error(`Quest ${questId} was not created`);
    }
  };

  beforeAll(async () => {
    // Clean up any existing test data first
    await db('quest_hint_tracking').where({ user_id: testUserId }).del();
    await db('quests').where({ id: testQuestId }).del();
    await db('chapters').where({ id: testChapterId }).del();
    await db('users').where({ id: testUserId }).del();

    // Create a test user
    await db('users').insert({
      id: testUserId,
      email: testEmail,
      username: testUsername,
      password_hash: 'hashedpassword',
    });

    // Create a test chapter
    await db('chapters').insert({
      id: testChapterId,
      title: 'Test Chapter',
      description: 'Test chapter for hint service tests',
      theme_region: 'test-region',
      order: 999,
      is_premium: false,
      unlock_requirements: JSON.stringify({}),
    });

    // Verify chapter was created
    const chapter = await db('chapters').where({ id: testChapterId }).first();
    if (!chapter) {
      throw new Error('Test chapter was not created');
    }

    // Create a test quest
    await db('quests').insert({
      id: testQuestId,
      chapter_id: testChapterId,
      title: 'Test Quest',
      narrative: 'Test quest narrative',
      objective: 'Test quest objective',
      hints: JSON.stringify(['Hint 1', 'Hint 2', 'Hint 3']),
      xp_reward: 100,
      order: 1,
      validation_criteria: JSON.stringify({}),
    });
  });

  afterAll(async () => {
    // Clean up test data
    await db('quest_hint_tracking').where({ user_id: testUserId }).del();
    await db('quests').where({ id: testQuestId }).del();
    await db('chapters').where({ id: testChapterId }).del();
    await db('users').where({ id: testUserId }).del();
    await db.destroy();
  });

  describe('getHintTracking', () => {
    it('should return null for non-existent tracking', async () => {
      const tracking = await hintService.getHintTracking(uuidv4(), uuidv4());
      expect(tracking).toBeNull();
    });

    it('should return tracking data when it exists', async () => {
      await hintService.upsertHintTracking(testUserId, testQuestId, {
        incorrect_attempts: 2,
        hints_shown: 1,
      });

      const tracking = await hintService.getHintTracking(testUserId, testQuestId);
      expect(tracking).not.toBeNull();
      expect(tracking?.incorrect_attempts).toBe(2);
      expect(tracking?.hints_shown).toBe(1);
    });
  });

  describe('incrementIncorrectAttempts', () => {
    it('should create tracking with 1 attempt if none exists', async () => {
      const newQuestId = uuidv4();
      await createTestQuest(newQuestId);

      const tracking = await hintService.incrementIncorrectAttempts(testUserId, newQuestId);

      expect(tracking.incorrect_attempts).toBe(1);
      expect(tracking.hints_shown).toBe(0);

      // Clean up
      await db('quest_hint_tracking').where({ user_id: testUserId, quest_id: newQuestId }).del();
      await db('quests').where({ id: newQuestId }).del();
    });

    it('should increment existing attempt count', async () => {
      const questId = uuidv4();
      await createTestQuest(questId);

      await hintService.upsertHintTracking(testUserId, questId, {
        incorrect_attempts: 2,
      });

      const tracking = await hintService.incrementIncorrectAttempts(testUserId, questId);
      expect(tracking.incorrect_attempts).toBe(3);

      // Clean up
      await db('quest_hint_tracking').where({ user_id: testUserId, quest_id: questId }).del();
      await db('quests').where({ id: questId }).del();
    });
  });

  describe('recordHintShown', () => {
    it('should record first hint shown', async () => {
      const questId = uuidv4();
      await createTestQuest(questId);

      const tracking = await hintService.recordHintShown(testUserId, questId, 0);

      expect(tracking.hints_shown).toBe(1);
      expect(tracking.shown_hint_indices).toContain(0);

      // Clean up
      await db('quest_hint_tracking').where({ user_id: testUserId, quest_id: questId }).del();
      await db('quests').where({ id: questId }).del();
    });

    it('should not duplicate hint indices', async () => {
      const questId = uuidv4();
      await createTestQuest(questId);

      await hintService.recordHintShown(testUserId, questId, 0);
      const tracking = await hintService.recordHintShown(testUserId, questId, 0);

      expect(tracking.hints_shown).toBe(2);
      expect(tracking.shown_hint_indices).toEqual([0]);

      // Clean up
      await db('quest_hint_tracking').where({ user_id: testUserId, quest_id: questId }).del();
      await db('quests').where({ id: questId }).del();
    });

    it('should track multiple different hints', async () => {
      const questId = uuidv4();
      await createTestQuest(questId);

      await hintService.recordHintShown(testUserId, questId, 0);
      await hintService.recordHintShown(testUserId, questId, 1);
      const tracking = await hintService.recordHintShown(testUserId, questId, 2);

      expect(tracking.hints_shown).toBe(3);
      expect(tracking.shown_hint_indices).toEqual([0, 1, 2]);

      // Clean up
      await db('quest_hint_tracking').where({ user_id: testUserId, quest_id: questId }).del();
      await db('quests').where({ id: questId }).del();
    });
  });

  describe('calculateXpPenalty', () => {
    it('should return full XP with no hints', () => {
      const adjustedXp = hintService.calculateXpPenalty(0, 100);
      expect(adjustedXp).toBe(100);
    });

    it('should apply 5% penalty per hint', () => {
      expect(hintService.calculateXpPenalty(1, 100)).toBe(95);
      expect(hintService.calculateXpPenalty(2, 100)).toBe(90);
      expect(hintService.calculateXpPenalty(3, 100)).toBe(85);
    });

    it('should cap penalty at 25%', () => {
      expect(hintService.calculateXpPenalty(5, 100)).toBe(75);
      expect(hintService.calculateXpPenalty(10, 100)).toBe(75);
    });

    it('should work with different XP values', () => {
      expect(hintService.calculateXpPenalty(2, 50)).toBe(45);
      expect(hintService.calculateXpPenalty(3, 200)).toBe(170);
    });
  });

  describe('getNextHint', () => {
    it('should return first hint when none shown', async () => {
      const questId = uuidv4();
      await createTestQuest(questId);
      const hints = ['Hint 1', 'Hint 2', 'Hint 3'];

      const result = await hintService.getNextHint(testUserId, questId, hints);

      expect(result).not.toBeNull();
      expect(result?.hint).toBe('Hint 1');
      expect(result?.hintIndex).toBe(0);
      expect(result?.totalHints).toBe(3);

      // Clean up
      await db('quest_hint_tracking').where({ user_id: testUserId, quest_id: questId }).del();
      await db('quests').where({ id: questId }).del();
    });

    it('should return next unshown hint', async () => {
      const questId = uuidv4();
      await createTestQuest(questId);
      const hints = ['Hint 1', 'Hint 2', 'Hint 3'];

      await hintService.recordHintShown(testUserId, questId, 0);
      const result = await hintService.getNextHint(testUserId, questId, hints);

      expect(result?.hint).toBe('Hint 2');
      expect(result?.hintIndex).toBe(1);

      // Clean up
      await db('quest_hint_tracking').where({ user_id: testUserId, quest_id: questId }).del();
      await db('quests').where({ id: questId }).del();
    });

    it('should return null when all hints shown', async () => {
      const questId = uuidv4();
      await createTestQuest(questId);
      const hints = ['Hint 1', 'Hint 2'];

      await hintService.recordHintShown(testUserId, questId, 0);
      await hintService.recordHintShown(testUserId, questId, 1);
      const result = await hintService.getNextHint(testUserId, questId, hints);

      expect(result).toBeNull();

      // Clean up
      await db('quest_hint_tracking').where({ user_id: testUserId, quest_id: questId }).del();
      await db('quests').where({ id: questId }).del();
    });
  });

  describe('shouldOfferHint', () => {
    it('should not offer hint before 3 attempts', () => {
      expect(hintService.shouldOfferHint(0)).toBe(false);
      expect(hintService.shouldOfferHint(1)).toBe(false);
      expect(hintService.shouldOfferHint(2)).toBe(false);
    });

    it('should offer hint at 3 or more attempts', () => {
      expect(hintService.shouldOfferHint(3)).toBe(true);
      expect(hintService.shouldOfferHint(4)).toBe(true);
      expect(hintService.shouldOfferHint(10)).toBe(true);
    });
  });
});
