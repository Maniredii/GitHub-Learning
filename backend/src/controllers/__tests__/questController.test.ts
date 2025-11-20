import request from 'supertest';
import express, { Express } from 'express';
import questRoutes from '../../routes/questRoutes';
import chapterRoutes from '../../routes/chapterRoutes';
import authRoutes from '../../routes/authRoutes';
import db from '../../database/db';

// Create Express app for testing
const app: Express = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/chapters', chapterRoutes);

// Setup and teardown database
beforeAll(async () => {
  try {
    await db.raw('SELECT 1');
    await db.migrate.latest();
    console.log('Quest test database setup complete');
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
    await db('quest_completions').del();
    await db('user_progress').del();
    await db('users').del();
    // Don't delete quests and chapters - they're seeded once
  } catch (error) {
    console.error('Test data cleanup failed:', error);
    throw error;
  }
});

describe('Quest Controller Tests', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and get auth token
    const response = await request(app).post('/api/auth/register').send({
      email: 'questtest@example.com',
      username: 'questtester',
      password: 'password123',
    });
    authToken = response.body.token;
    userId = response.body.user.id;
  });

  describe('GET /api/quests - Get All Quests', () => {
    test('should retrieve all quests', async () => {
      const response = await request(app)
        .get('/api/quests')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should filter quests by chapter', async () => {
      // Get first chapter
      const chaptersResponse = await request(app).get('/api/chapters');
      const firstChapter = chaptersResponse.body.data[0];

      const response = await request(app)
        .get(`/api/quests?chapter=${firstChapter.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // All quests should belong to the specified chapter
      response.body.data.forEach((quest: any) => {
        expect(quest.chapter_id).toBe(firstChapter.id);
      });
    });

    test('should return quests ordered by chapter and order', async () => {
      const response = await request(app)
        .get('/api/quests')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const quests = response.body.data;

      // Verify ordering
      for (let i = 1; i < quests.length; i++) {
        const prev = quests[i - 1];
        const curr = quests[i];

        if (prev.chapter_id === curr.chapter_id) {
          expect(curr.order).toBeGreaterThanOrEqual(prev.order);
        }
      }
    });
  });

  describe('GET /api/quests/:id - Get Quest By ID', () => {
    test('should retrieve a specific quest by ID', async () => {
      // Get all quests first
      const questsResponse = await request(app)
        .get('/api/quests')
        .set('Authorization', `Bearer ${authToken}`);

      const firstQuest = questsResponse.body.data[0];

      const response = await request(app).get(`/api/quests/${firstQuest.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: firstQuest.id,
        title: firstQuest.title,
        narrative: expect.any(String),
        objective: expect.any(String),
      });
    });

    test('should return 404 for non-existent quest', async () => {
      const response = await request(app).get('/api/quests/00000000-0000-0000-0000-999999999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('QUEST_NOT_FOUND');
    });
  });

  describe('GET /api/chapters - Get All Chapters', () => {
    test('should retrieve all chapters', async () => {
      const response = await request(app).get('/api/chapters');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should return chapters ordered by order field', async () => {
      const response = await request(app).get('/api/chapters');

      expect(response.status).toBe(200);
      const chapters = response.body.data;

      // Verify ordering
      for (let i = 1; i < chapters.length; i++) {
        expect(chapters[i].order).toBeGreaterThan(chapters[i - 1].order);
      }
    });

    test('should include chapter properties', async () => {
      const response = await request(app).get('/api/chapters');

      expect(response.status).toBe(200);
      const chapter = response.body.data[0];

      expect(chapter).toHaveProperty('id');
      expect(chapter).toHaveProperty('title');
      expect(chapter).toHaveProperty('description');
      expect(chapter).toHaveProperty('theme_region');
      expect(chapter).toHaveProperty('order');
      expect(chapter).toHaveProperty('is_premium');
      expect(chapter).toHaveProperty('unlock_requirements');
    });
  });

  describe('GET /api/chapters/:id/quests - Get Quests By Chapter', () => {
    test('should retrieve all quests for a specific chapter', async () => {
      // Get first chapter
      const chaptersResponse = await request(app).get('/api/chapters');
      const firstChapter = chaptersResponse.body.data[0];

      const response = await request(app).get(`/api/chapters/${firstChapter.id}/quests`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // All quests should belong to the chapter
      response.body.data.forEach((quest: any) => {
        expect(quest.chapter_id).toBe(firstChapter.id);
      });
    });

    test('should return 404 for non-existent chapter', async () => {
      const response = await request(app).get(
        '/api/chapters/00000000-0000-0000-0000-999999999999/quests'
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CHAPTER_NOT_FOUND');
    });

    test('should return quests ordered by order field', async () => {
      const chaptersResponse = await request(app).get('/api/chapters');
      const firstChapter = chaptersResponse.body.data[0];

      const response = await request(app).get(`/api/chapters/${firstChapter.id}/quests`);

      expect(response.status).toBe(200);
      const quests = response.body.data;

      if (quests.length > 1) {
        for (let i = 1; i < quests.length; i++) {
          expect(quests[i].order).toBeGreaterThanOrEqual(quests[i - 1].order);
        }
      }
    });
  });
});
