import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

// Mount authentication routes
router.use('/auth', authRoutes);

export default router;
