import express from 'express';
import premiumController from '../controllers/premiumController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Get premium status (protected)
router.get('/status', authMiddleware, (req, res) => premiumController.getPremiumStatus(req, res));

export default router;
