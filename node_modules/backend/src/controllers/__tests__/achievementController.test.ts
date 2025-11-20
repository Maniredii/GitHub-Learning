import request from 'supertest';
import express, { Express } from 'express';
import achievementRoutes from '../../routes/achievementRoutes';
import authRoutes from '../../routes/authRoutes';
import db from '../../database/db';

// Create Express app for testing
const app: Express = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/achievements', achievementRoutes);

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

describe('Achievement Controller Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Register a test user and get auth token
    const response = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    });

    authToken = response.body.token;
    userId = response.body.user.id;
  });

  describe('POST /api/achievements/check - Check and Award Achievements', () => {
    test('should award achievement for first commit', async () => {
      const response = await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'commit',
          context: { commitHash: 'abc123' },
        });

      expect(response.status).toBe(200);
      expect(response.body.newAchievements).toHaveLength(1);
      expect(response.body.newAchievements[0].name).toBe('First Blood');
      expect(response.body.message).toContain('First Blood');
    });

    test('should award achievement for first merge', async () => {
      const response = await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'merge',
        });

      expect(response.status).toBe(200);
      expect(response.body.newAchievements).toHaveLength(1);
      expect(response.body.newAchievements[0].name).toBe('Branch Master');
    });

    test('should award achievement for first conflict resolution', async () => {
      const response = await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'conflict_resolution',
        });

      expect(response.status).toBe(200);
      expect(response.body.newAchievements).toHaveLength(1);
      expect(response.body.newAchievements[0].name).toBe('Conflict Resolver');
    });

    test('should award achievement for first pull request', async () => {
      const response = await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'pull_request',
        });

      expect(response.status).toBe(200);
      expect(response.body.newAchievements).toHaveLength(1);
      expect(response.body.newAchievements[0].name).toBe('Collaborator');
    });

    test('should award achievement for first rebase', async () => {
      const response = await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'rebase',
        });

      expect(response.status).toBe(200);
      expect(response.body.newAchievements).toHaveLength(1);
      expect(response.body.newAchievements[0].name).toBe('Time Lord');
    });

    test('should not award duplicate achievements', async () => {
      // First commit
      await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'commit' });

      // Second commit
      const response = await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'commit' });

      expect(response.status).toBe(200);
      expect(response.body.newAchievements).toHaveLength(0);
      expect(response.body.message).toBeUndefined();
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/achievements/check')
        .send({ action: 'commit' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .post('/api/achievements/check')
        .set('Authorization', 'Bearer invalid_token')
        .send({ action: 'commit' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    test('should reject request without action type', async () => {
      const response = await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_INPUT');
      expect(response.body.error.message).toContain('Action type is required');
    });

    test('should handle invalid action type gracefully', async () => {
      const response = await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'invalid_action' });

      expect(response.status).toBe(200);
      expect(response.body.newAchievements).toHaveLength(0);
    });
  });

  describe('GET /api/achievements/user - Get User Achievements', () => {
    test('should return empty array when user has no achievements', async () => {
      const response = await request(app)
        .get('/api/achievements/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.earned).toHaveLength(0);
    });

    test('should return all achievements earned by user', async () => {
      // Award some achievements
      await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'commit' });

      await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'merge' });

      const response = await request(app)
        .get('/api/achievements/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.earned).toHaveLength(2);
      expect(response.body.earned[0]).toHaveProperty('id');
      expect(response.body.earned[0]).toHaveProperty('name');
      expect(response.body.earned[0]).toHaveProperty('description');
      expect(response.body.earned[0]).toHaveProperty('badge_icon');
      expect(response.body.earned[0]).toHaveProperty('earnedAt');
    });

    test('should reject request without authentication', async () => {
      const response = await request(app).get('/api/achievements/user');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/achievements/user')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });

    test('should only return achievements for authenticated user', async () => {
      // Create second user
      const user2Response = await request(app).post('/api/auth/register').send({
        email: 'test2@example.com',
        username: 'testuser2',
        password: 'password123',
      });

      const user2Token = user2Response.body.token;

      // Award achievement to first user
      await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'commit' });

      // Award achievement to second user
      await request(app)
        .post('/api/achievements/check')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ action: 'merge' });

      // Check first user's achievements
      const user1Response = await request(app)
        .get('/api/achievements/user')
        .set('Authorization', `Bearer ${authToken}`);

      expect(user1Response.body.earned).toHaveLength(1);
      expect(user1Response.body.earned[0].name).toBe('First Blood');

      // Check second user's achievements
      const user2AchievementsResponse = await request(app)
        .get('/api/achievements/user')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(user2AchievementsResponse.body.earned).toHaveLength(1);
      expect(user2AchievementsResponse.body.earned[0].name).toBe('Branch Master');
    });
  });

  describe('GET /api/achievements - Get All Achievements', () => {
    test('should return all available achievements', async () => {
      const response = await request(app).get('/api/achievements');

      expect(response.status).toBe(200);
      expect(response.body.achievements).toHaveLength(5);
      expect(response.body.achievements.map((a: any) => a.name)).toContain('First Blood');
      expect(response.body.achievements.map((a: any) => a.name)).toContain('Branch Master');
      expect(response.body.achievements.map((a: any) => a.name)).toContain('Conflict Resolver');
      expect(response.body.achievements.map((a: any) => a.name)).toContain('Collaborator');
      expect(response.body.achievements.map((a: any) => a.name)).toContain('Time Lord');
    });

    test('should not require authentication', async () => {
      const response = await request(app).get('/api/achievements');

      expect(response.status).toBe(200);
      expect(response.body.achievements).toHaveLength(5);
    });

    test('should include all achievement properties', async () => {
      const response = await request(app).get('/api/achievements');

      expect(response.status).toBe(200);
      response.body.achievements.forEach((achievement: any) => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('name');
        expect(achievement).toHaveProperty('description');
        expect(achievement).toHaveProperty('badge_icon');
        expect(achievement).toHaveProperty('created_at');
      });
    });
  });
});
