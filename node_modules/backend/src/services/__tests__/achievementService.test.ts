import achievementService, { AchievementAction } from '../achievementService';
import db from '../../database/db';

// Setup and teardown database
beforeAll(async () => {
  try {
    await db.raw('SELECT 1');
    await db.migrate.latest();

    // Seed achievements
    await db('achievements').del();
    await db('achievements').insert([
      {
        name: 'First Blood',
        description: 'Create your first commit and seal your first moment in time',
        badge_icon: '🩸',
      },
      {
        name: 'Branch Master',
        description: 'Successfully merge your first branch and unite parallel timelines',
        badge_icon: '🌿',
      },
      {
        name: 'Conflict Resolver',
        description: 'Resolve your first merge conflict and restore harmony to the codebase',
        badge_icon: '⚔️',
      },
      {
        name: 'Collaborator',
        description: 'Submit your first pull request and join the Council of Coders',
        badge_icon: '🤝',
      },
      {
        name: 'Time Lord',
        description: 'Master the art of rebase and rewrite history itself',
        badge_icon: '⏰',
      },
    ]);
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await db.destroy();
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
});

beforeEach(async () => {
  try {
    await db('user_achievements').del();
    await db('user_progress').del();
    await db('users').del();
  } catch (error) {
    console.error('Test data cleanup failed:', error);
    throw error;
  }
});

describe('Achievement Service Tests', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create a test user
    const [user] = await db('users')
      .insert({
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashedpassword',
      })
      .returning('*');
    testUserId = user.id;
  });

  describe('checkAchievements', () => {
    test('should award "First Blood" achievement on first commit', async () => {
      const action: AchievementAction = {
        type: 'commit',
        userId: testUserId,
      };

      const result = await achievementService.checkAchievements(action);

      expect(result.newAchievements).toHaveLength(1);
      expect(result.newAchievements[0].name).toBe('First Blood');
      expect(result.message).toContain('First Blood');
    });

    test('should award "Branch Master" achievement on first merge', async () => {
      const action: AchievementAction = {
        type: 'merge',
        userId: testUserId,
      };

      const result = await achievementService.checkAchievements(action);

      expect(result.newAchievements).toHaveLength(1);
      expect(result.newAchievements[0].name).toBe('Branch Master');
      expect(result.message).toContain('Branch Master');
    });

    test('should award "Conflict Resolver" achievement on first conflict resolution', async () => {
      const action: AchievementAction = {
        type: 'conflict_resolution',
        userId: testUserId,
      };

      const result = await achievementService.checkAchievements(action);

      expect(result.newAchievements).toHaveLength(1);
      expect(result.newAchievements[0].name).toBe('Conflict Resolver');
      expect(result.message).toContain('Conflict Resolver');
    });

    test('should award "Collaborator" achievement on first pull request', async () => {
      const action: AchievementAction = {
        type: 'pull_request',
        userId: testUserId,
      };

      const result = await achievementService.checkAchievements(action);

      expect(result.newAchievements).toHaveLength(1);
      expect(result.newAchievements[0].name).toBe('Collaborator');
      expect(result.message).toContain('Collaborator');
    });

    test('should award "Time Lord" achievement on first rebase', async () => {
      const action: AchievementAction = {
        type: 'rebase',
        userId: testUserId,
      };

      const result = await achievementService.checkAchievements(action);

      expect(result.newAchievements).toHaveLength(1);
      expect(result.newAchievements[0].name).toBe('Time Lord');
      expect(result.message).toContain('Time Lord');
    });

    test('should not award duplicate achievements', async () => {
      const action: AchievementAction = {
        type: 'commit',
        userId: testUserId,
      };

      // First commit - should award achievement
      const firstResult = await achievementService.checkAchievements(action);
      expect(firstResult.newAchievements).toHaveLength(1);

      // Second commit - should not award achievement again
      const secondResult = await achievementService.checkAchievements(action);
      expect(secondResult.newAchievements).toHaveLength(0);
      expect(secondResult.message).toBeUndefined();
    });

    test('should return empty array for invalid action type', async () => {
      const action: AchievementAction = {
        type: 'invalid_action' as any,
        userId: testUserId,
      };

      const result = await achievementService.checkAchievements(action);

      expect(result.newAchievements).toHaveLength(0);
      expect(result.message).toBeUndefined();
    });

    test('should handle multiple different achievements for same user', async () => {
      // Award First Blood
      const commitAction: AchievementAction = {
        type: 'commit',
        userId: testUserId,
      };
      const commitResult = await achievementService.checkAchievements(commitAction);
      expect(commitResult.newAchievements).toHaveLength(1);

      // Award Branch Master
      const mergeAction: AchievementAction = {
        type: 'merge',
        userId: testUserId,
      };
      const mergeResult = await achievementService.checkAchievements(mergeAction);
      expect(mergeResult.newAchievements).toHaveLength(1);

      // Verify both achievements are in database
      const userAchievements = await achievementService.getUserAchievements(testUserId);
      expect(userAchievements).toHaveLength(2);
    });
  });

  describe('getUserAchievements', () => {
    test('should return empty array when user has no achievements', async () => {
      const achievements = await achievementService.getUserAchievements(testUserId);

      expect(achievements).toHaveLength(0);
    });

    test('should return all achievements earned by user', async () => {
      // Award multiple achievements
      await achievementService.checkAchievements({ type: 'commit', userId: testUserId });
      await achievementService.checkAchievements({ type: 'merge', userId: testUserId });

      const achievements = await achievementService.getUserAchievements(testUserId);

      expect(achievements).toHaveLength(2);
      expect(achievements[0]).toHaveProperty('id');
      expect(achievements[0]).toHaveProperty('name');
      expect(achievements[0]).toHaveProperty('description');
      expect(achievements[0]).toHaveProperty('badge_icon');
      expect(achievements[0]).toHaveProperty('earnedAt');
    });

    test('should return achievements ordered by most recently earned', async () => {
      // Award achievements with slight delay
      await achievementService.checkAchievements({ type: 'commit', userId: testUserId });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await achievementService.checkAchievements({ type: 'merge', userId: testUserId });

      const achievements = await achievementService.getUserAchievements(testUserId);

      expect(achievements).toHaveLength(2);
      // Most recent should be first
      expect(achievements[0].name).toBe('Branch Master');
      expect(achievements[1].name).toBe('First Blood');
    });

    test('should only return achievements for specific user', async () => {
      // Create second user
      const [user2] = await db('users')
        .insert({
          email: 'test2@example.com',
          username: 'testuser2',
          password_hash: 'hashedpassword',
        })
        .returning('*');

      // Award achievements to both users
      await achievementService.checkAchievements({ type: 'commit', userId: testUserId });
      await achievementService.checkAchievements({ type: 'merge', userId: user2.id });

      const user1Achievements = await achievementService.getUserAchievements(testUserId);
      const user2Achievements = await achievementService.getUserAchievements(user2.id);

      expect(user1Achievements).toHaveLength(1);
      expect(user1Achievements[0].name).toBe('First Blood');

      expect(user2Achievements).toHaveLength(1);
      expect(user2Achievements[0].name).toBe('Branch Master');
    });
  });

  describe('getAllAchievements', () => {
    test('should return all available achievements', async () => {
      const achievements = await achievementService.getAllAchievements();

      expect(achievements).toHaveLength(5);
      expect(achievements.map((a) => a.name)).toContain('First Blood');
      expect(achievements.map((a) => a.name)).toContain('Branch Master');
      expect(achievements.map((a) => a.name)).toContain('Conflict Resolver');
      expect(achievements.map((a) => a.name)).toContain('Collaborator');
      expect(achievements.map((a) => a.name)).toContain('Time Lord');
    });

    test('should return achievements ordered by name', async () => {
      const achievements = await achievementService.getAllAchievements();

      expect(achievements[0].name).toBe('Branch Master');
      expect(achievements[1].name).toBe('Collaborator');
      expect(achievements[2].name).toBe('Conflict Resolver');
      expect(achievements[3].name).toBe('First Blood');
      expect(achievements[4].name).toBe('Time Lord');
    });

    test('should include all achievement properties', async () => {
      const achievements = await achievementService.getAllAchievements();

      achievements.forEach((achievement) => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('badge_icon');
        expect(achievement).toHaveProperty('created_at');
      });
    });
  });
});
