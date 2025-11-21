import express from 'express';
import paymentController from '../controllers/paymentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Create one-time purchase payment intent (protected)
router.post('/one-time', authMiddleware, (req, res) =>
  paymentController.createOneTimePurchase(req, res)
);

// Create monthly subscription checkout session (protected)
router.post('/monthly', authMiddleware, (req, res) =>
  paymentController.createMonthlySubscription(req, res)
);

// Stripe webhook endpoint (NOT protected - Stripe calls this)
// Note: Raw body middleware is configured in index.ts for this route
router.post('/webhook', (req, res) =>
  paymentController.handleWebhook(req, res)
);

export default router;
