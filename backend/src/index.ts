import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database/db';
import authRoutes from './routes/authRoutes';
import gitRoutes from './routes/gitRoutes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'GitQuest API is running but database is unavailable',
      database: 'disconnected',
    });
  }
});

// API routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({ message: 'GitQuest API v1.0' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Git command execution routes
app.use('/api/git', gitRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
