// Set test environment before imports
process.env.NODE_ENV = 'test';

import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../../routes/authRoutes';
import db from '../../database/db';
import { AuthService } from '../../services/authService';

// Create Express app for testing
const app: Express = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Setup and teardown database
beforeAll(async () => {
  // Run migrations for test database
  await db.migrate.latest();
});

afterAll(async () => {
  // Rollback migrations and close connection
  await db.migrate.rollback();
  await db.destroy();
});

beforeEach(async () => {
  // Clean up test data before each test
  await db('user_progress').del();
  await db('users').del();
});

describe('Authentication Controller Tests', () => {
  describe('POST /api/auth/register - User Registration', () => {
    test('should successfully register a new user with valid credentials', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
        level: 1,
        xp: 0,
      });
      expect(response.body.user).toHaveProperty('id');
    });

    test('should reject registration with duplicate email', async () => {
      // Register first user
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser1',
        password: 'password123',
      });

      // Attempt to register with same email
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser2',
        password: 'password456',
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toMatchObject({
        code: 'DUPLICATE_USER',
        message: expect.stringContaining('already registered'),
      });
    });

    test('should reject registration with duplicate username', async () => {
      // Register first user
      await request(app).post('/api/auth/register').send({
        email: 'test1@example.com',
        username: 'testuser',
        password: 'password123',
      });

      // Attempt to register with same username
      const response = await request(app).post('/api/auth/register').send({
        email: 'test2@example.com',
        username: 'testuser',
        password: 'password456',
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toMatchObject({
        code: 'DUPLICATE_USER',
        message: expect.stringContaining('already taken'),
      });
    });

    test('should reject registration with invalid email format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining('Invalid email'),
      });
    });

    test('should reject registration with weak password (too short)', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'pass1',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining('at least 8 characters'),
      });
    });

    test('should reject registration with missing fields', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        code: 'MISSING_FIELDS',
        message: expect.stringContaining('required'),
      });
    });

    test('should initialize user with Apprentice Coder rank and 0 XP', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.user.level).toBe(1);
      expect(response.body.user.xp).toBe(0);

      // Verify user progress was created in database
      const progress = await db('user_progress').where({ user_id: response.body.user.id }).first();

      expect(progress).toBeDefined();
      expect(progress.xp).toBe(0);
      expect(progress.level).toBe(1);
    });
  });

  describe('POST /api/auth/login - User Login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });
    });

    test('should successfully login with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
        level: 1,
        xp: 0,
      });
    });

    test('should reject login with invalid email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'wrong@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: expect.stringContaining('Invalid email or password'),
      });
    });

    test('should reject login with invalid password', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: expect.stringContaining('Invalid email or password'),
      });
    });

    test('should reject login with missing fields', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toMatchObject({
        code: 'MISSING_FIELDS',
        message: expect.stringContaining('required'),
      });
    });
  });

  describe('JWT Token Generation and Verification', () => {
    let validToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register and get a valid token
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      });

      validToken = response.body.token;
      userId = response.body.user.id;
    });

    test('should generate valid JWT token on registration', () => {
      expect(validToken).toBeDefined();
      expect(typeof validToken).toBe('string');
      expect(validToken.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should generate valid JWT token on login', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.split('.')).toHaveLength(3);
    });

    test('should successfully verify valid JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        valid: true,
        user: {
          userId: userId,
          username: 'testuser',
        },
      });
    });

    test('should reject verification without token', async () => {
      const response = await request(app).get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatchObject({
        code: 'MISSING_TOKEN',
        message: expect.stringContaining('required'),
      });
    });

    test('should reject verification with invalid token format', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'InvalidToken');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatchObject({
        code: 'MISSING_TOKEN',
      });
    });

    test('should reject verification with malformed JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.error).toMatchObject({
        code: 'INVALID_TOKEN',
        message: expect.stringContaining('Invalid or expired'),
      });
    });

    test('should decode token with correct user information', () => {
      const decoded = AuthService.verifyToken(validToken);

      expect(decoded).toMatchObject({
        userId: userId,
        username: 'testuser',
      });
    });
  });
});
