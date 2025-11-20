import request from 'supertest';
import express, { Express } from 'express';
import bossBattleRoutes from '../../routes/bossBattleRoutes';
import db from '../../database/db';
import { RepositoryState } from '../../../../shared/src/types';

// Create Express app for testing
const app: Express = express();
app.use(express.json());
app.use('/api/boss-battles', bossBattleRoutes);

// Setup and teardown database
beforeAll(async () => {
  try {
    await db.raw('SELECT 1');
    await db.migrate.latest();
    // Run seeds from the correct directory
    await db.seed.run({ directory: './src/database/seeds' });
    console.log('Boss battle test database setup complete');
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

describe('Boss Battle Controller Tests', () => {
  let corruptedTimelineBattleId: string;
  let convergenceConflictBattleId: string;

  beforeAll(async () => {
    // Get boss battle IDs
    const battles = await db('boss_battles').select('id', 'name');
    const corruptedBattle = battles.find((b: any) => b.name === 'The Corrupted Timeline');
    const convergenceBattle = battles.find((b: any) => b.name === 'The Convergence Conflict');

    if (corruptedBattle) corruptedTimelineBattleId = corruptedBattle.id;
    if (convergenceBattle) convergenceConflictBattleId = convergenceBattle.id;
  });

  describe('GET /api/boss-battles - Get All Boss Battles', () => {
    test('should retrieve all boss battles', async () => {
      const response = await request(app).get('/api/boss-battles');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    test('should include boss battle properties', async () => {
      const response = await request(app).get('/api/boss-battles');

      expect(response.status).toBe(200);
      const battle = response.body.data[0];

      expect(battle).toHaveProperty('id');
      expect(battle).toHaveProperty('name');
      expect(battle).toHaveProperty('description');
      expect(battle).toHaveProperty('chapterId');
      expect(battle).toHaveProperty('bonusXp');
      expect(battle).toHaveProperty('order');
    });
  });

  describe('GET /api/boss-battles/:id - Get Boss Battle By ID', () => {
    test('should retrieve The Corrupted Timeline boss battle', async () => {
      if (!corruptedTimelineBattleId) {
        console.warn('Corrupted Timeline battle not found, skipping test');
        return;
      }

      const response = await request(app).get(`/api/boss-battles/${corruptedTimelineBattleId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('battle');
      expect(response.body.data).toHaveProperty('initialState');

      const { battle, initialState } = response.body.data;
      expect(battle.name).toBe('The Corrupted Timeline');
      expect(battle.bonusXp).toBe(500);
      expect(initialState).toHaveProperty('commits');
      expect(initialState).toHaveProperty('branches');
      expect(initialState).toHaveProperty('workingDirectory');
    });

    test('should retrieve The Convergence Conflict boss battle', async () => {
      if (!convergenceConflictBattleId) {
        console.warn('Convergence Conflict battle not found, skipping test');
        return;
      }

      const response = await request(app).get(`/api/boss-battles/${convergenceConflictBattleId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.battle.name).toBe('The Convergence Conflict');
      expect(response.body.data.battle.bonusXp).toBe(750);
    });

    test('should return 404 for non-existent boss battle', async () => {
      const response = await request(app).get(
        '/api/boss-battles/00000000-0000-0000-0000-999999999999'
      );

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BOSS_BATTLE_NOT_FOUND');
    });
  });

  describe('POST /api/boss-battles/:id/validate - Validate Boss Battle', () => {
    describe('The Corrupted Timeline Validation', () => {
      test('should fail when on corrupted commit', async () => {
        if (!corruptedTimelineBattleId) {
          console.warn('Corrupted Timeline battle not found, skipping test');
          return;
        }

        // Get initial state
        const battleResponse = await request(app).get(
          `/api/boss-battles/${corruptedTimelineBattleId}`
        );
        const initialState = battleResponse.body.data.initialState;

        // Submit validation with corrupted state (still on ghi789)
        const response = await request(app)
          .post(`/api/boss-battles/${corruptedTimelineBattleId}/validate`)
          .send({ repositoryState: initialState });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.feedback).toContain('corruption persists');
        expect(response.body.bonusXp).toBe(0);
      });

      test('should succeed when restored to good commit', async () => {
        if (!corruptedTimelineBattleId) {
          console.warn('Corrupted Timeline battle not found, skipping test');
          return;
        }

        // Get initial state
        const battleResponse = await request(app).get(
          `/api/boss-battles/${corruptedTimelineBattleId}`
        );
        const initialState: RepositoryState = battleResponse.body.data.initialState;

        // Simulate restoring to good commit (abc123)
        const restoredState: RepositoryState = {
          ...initialState,
          branches: [
            {
              name: 'main',
              commitHash: 'abc123',
            },
          ],
          workingDirectory: {
            'README.md': {
              content: '# The Lost Project\n\nThis is the legendary project.',
              modified: false,
            },
            'app.js': {
              content: 'console.log("Hello, World!");',
              modified: false,
            },
          },
        };

        const response = await request(app)
          .post(`/api/boss-battles/${corruptedTimelineBattleId}/validate`)
          .send({ repositoryState: restoredState });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.feedback).toContain('Victory');
        expect(response.body.bonusXp).toBe(500);
      });
    });

    describe('The Convergence Conflict Validation', () => {
      test('should fail when merge not performed', async () => {
        if (!convergenceConflictBattleId) {
          console.warn('Convergence Conflict battle not found, skipping test');
          return;
        }

        // Get initial state
        const battleResponse = await request(app).get(
          `/api/boss-battles/${convergenceConflictBattleId}`
        );
        const initialState = battleResponse.body.data.initialState;

        // Submit validation without merge
        const response = await request(app)
          .post(`/api/boss-battles/${convergenceConflictBattleId}/validate`)
          .send({ repositoryState: initialState });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.feedback).toContain('not been unified');
        expect(response.body.bonusXp).toBe(0);
      });

      test('should fail when conflict markers still present', async () => {
        if (!convergenceConflictBattleId) {
          console.warn('Convergence Conflict battle not found, skipping test');
          return;
        }

        // Get initial state
        const battleResponse = await request(app).get(
          `/api/boss-battles/${convergenceConflictBattleId}`
        );
        const initialState: RepositoryState = battleResponse.body.data.initialState;

        // Simulate merge with unresolved conflict
        const mergedState: RepositoryState = {
          ...initialState,
          commits: [
            ...initialState.commits,
            {
              hash: 'merge123',
              message: 'Merge feature-alternate-story into main',
              author: 'Test User',
              timestamp: new Date(),
              parent: 'bbb222',
              parents: ['bbb222', 'ccc333'],
              tree: {
                'story.txt': {
                  content: `Chapter 1: The Beginning
Once upon a time...

Chapter 2: The Journey
<<<<<<< HEAD
The hero set forth on a quest for knowledge...
=======
The hero embarked on an adventure for glory...
>>>>>>> feature-alternate-story`,
                  modified: false,
                },
              },
            },
          ],
          branches: [
            {
              name: 'main',
              commitHash: 'merge123',
            },
            {
              name: 'feature-alternate-story',
              commitHash: 'ccc333',
            },
          ],
          workingDirectory: {
            'story.txt': {
              content: `Chapter 1: The Beginning
Once upon a time...

Chapter 2: The Journey
<<<<<<< HEAD
The hero set forth on a quest for knowledge...
=======
The hero embarked on an adventure for glory...
>>>>>>> feature-alternate-story`,
              modified: false,
            },
          },
        };

        const response = await request(app)
          .post(`/api/boss-battles/${convergenceConflictBattleId}/validate`)
          .send({ repositoryState: mergedState });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(false);
        expect(response.body.feedback).toContain('conflict');
        expect(response.body.feedback).toContain('not been fully resolved');
      });

      test('should succeed when conflict properly resolved', async () => {
        if (!convergenceConflictBattleId) {
          console.warn('Convergence Conflict battle not found, skipping test');
          return;
        }

        // Get initial state
        const battleResponse = await request(app).get(
          `/api/boss-battles/${convergenceConflictBattleId}`
        );
        const initialState: RepositoryState = battleResponse.body.data.initialState;

        // Simulate successful merge with resolved conflict
        const resolvedState: RepositoryState = {
          ...initialState,
          commits: [
            ...initialState.commits,
            {
              hash: 'merge456',
              message: 'Merge feature-alternate-story into main',
              author: 'Test User',
              timestamp: new Date(),
              parent: 'bbb222',
              parents: ['bbb222', 'ccc333'],
              tree: {
                'story.txt': {
                  content: `Chapter 1: The Beginning
Once upon a time...

Chapter 2: The Journey
The hero set forth on a quest for knowledge and glory...`,
                  modified: false,
                },
              },
            },
          ],
          branches: [
            {
              name: 'main',
              commitHash: 'merge456',
            },
            {
              name: 'feature-alternate-story',
              commitHash: 'ccc333',
            },
          ],
          workingDirectory: {
            'story.txt': {
              content: `Chapter 1: The Beginning
Once upon a time...

Chapter 2: The Journey
The hero set forth on a quest for knowledge and glory...`,
              modified: false,
            },
          },
          stagingArea: {},
        };

        const response = await request(app)
          .post(`/api/boss-battles/${convergenceConflictBattleId}/validate`)
          .send({ repositoryState: resolvedState });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.feedback).toContain('Victory');
        expect(response.body.bonusXp).toBe(750);
      });
    });

    test('should return 400 when repository state is missing', async () => {
      if (!corruptedTimelineBattleId) {
        console.warn('Corrupted Timeline battle not found, skipping test');
        return;
      }

      const response = await request(app)
        .post(`/api/boss-battles/${corruptedTimelineBattleId}/validate`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_REPOSITORY_STATE');
    });

    test('should return 404 for non-existent boss battle', async () => {
      const response = await request(app)
        .post('/api/boss-battles/00000000-0000-0000-0000-999999999999/validate')
        .send({
          repositoryState: {
            id: 'test',
            workingDirectory: {},
            stagingArea: {},
            commits: [],
            branches: [],
            head: 'main',
            remotes: [],
          },
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('BOSS_BATTLE_NOT_FOUND');
    });
  });
});
