import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET /api/users/profile - Get user profile with progress and achievements
router.get('/profile', authMiddleware, UserController.getProfile);

export default router;
