import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database/db';
import { cacheService } from './services/cacheService';
import { initSentry, Sentry } from './config/sentry';
import {
  metricsMiddleware,
  getMetrics,
} from './middleware/metricsMiddleware';
import gitRoutes from './routes/gitRoutes';
import questRoutes from './routes/questRoutes';
import chapterRoutes from './routes/chapterRoutes';
import progressRoutes from './routes/progressRoutes';
import achievementRoutes from './routes/achievementRoutes';
import bossBattleRoutes from './routes/bossBattleRoutes';
import hintRoutes from './routes/hintRoutes';
import userRoutes from './routes/userRoutes';
import premiumRoutes from './routes/premiumRoutes';
import paymentRoutes from './routes/paymentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

// Initialize Sentry first
initSentry();

// Initialize cache service (disabled for now - Redis not installed)
// cacheService.connect().catch((err) => {
//   console.warn('Cache service unavailable, continuing without cache:', err);
// });

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Sentry request handler must be first middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Metrics middleware
app.use(metricsMiddleware);

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:1001',
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await db.raw('SELECT 1');
    res.json({
      status: 'ok',
      message: 'GitQuest API is running',
      database: 'connected',
      cache: cacheService.isAvailable() ? 'connected' : 'unavailable',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'GitQuest API is running but database is unavailable',
      database: 'disconnected',
      cache: cacheService.isAvailable() ? 'connected' : 'unavailable',
    });
  }
});

// Readiness check endpoint
app.get('/ready', async (_req: Request, res: Response) => {
  const checks = {
    database: false,
    cache: false,
  };

  try {
    await db.raw('SELECT 1');
    checks.database = true;
  } catch (error) {
    // Database not ready
  }

  checks.cache = cacheService.isAvailable();

  if (checks.database) {
    res.json({ status: 'ready', checks });
  } else {
    res.status(503).json({ status: 'not ready', checks });
  }
});

// Metrics endpoint
app.get('/metrics', (_req: Request, res: Response) => {
  res.json(getMetrics());
});

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({ message: 'GitQuest API v1.0' });
});

// Git command execution routes
app.use('/api/git', gitRoutes);

// Quest and chapter routes
app.use('/api/quests', questRoutes);
app.use('/api/chapters', chapterRoutes);

// Progress routes
app.use('/api/progress', progressRoutes);

// Achievement routes
app.use('/api/achievements', achievementRoutes);

// Boss battle routes
app.use('/api/boss-battles', bossBattleRoutes);

// Hint routes
app.use('/api/hints', hintRoutes);

// User routes
app.use('/api/users', userRoutes);

// Premium routes
app.use('/api/premium', premiumRoutes);

// Payment routes (webhook needs raw body, handled in route)
app.use('/api/payment', paymentRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Sentry error handler must be before other error handlers
app.use(Sentry.Handlers.errorHandler());

// Custom error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Metrics available at /metrics`);
  console.log(`💚 Health check at /health`);
  console.log(`✅ Readiness check at /ready`);
});

export default app;
