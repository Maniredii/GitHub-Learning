import { Request, Response } from 'express';
import paymentService from '../services/paymentService';

export class PaymentController {
  /**
   * Create payment intent for one-time purchase
   */
  async createOneTimePurchase(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const result = await paymentService.createOneTimePurchaseIntent(userId);

      res.json({
        success: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      });
    } catch (error) {
      console.error('Error creating one-time purchase:', error);
      res.status(500).json({
        error: {
          code: 'PAYMENT_ERROR',
          message: 'Failed to create payment',
        },
      });
    }
  }

  /**
   * Create checkout session for monthly subscription
   */
  async createMonthlySubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const { successUrl, cancelUrl } = req.body;

      if (!successUrl || !cancelUrl) {
        res.status(400).json({
          error: {
            code: 'MISSING_URLS',
            message: 'Success and cancel URLs are required',
          },
        });
        return;
      }

      const result = await paymentService.createMonthlySubscriptionSession(
        userId,
        successUrl,
        cancelUrl
      );

      res.json({
        success: true,
        sessionId: result.sessionId,
        url: result.url,
      });
    } catch (error) {
      console.error('Error creating monthly subscription:', error);
      res.status(500).json({
        error: {
          code: 'PAYMENT_ERROR',
          message: 'Failed to create subscription',
        },
      });
    }
  }

  /**
   * Handle Stripe webhooks
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        res.status(400).json({
          error: {
            code: 'MISSING_SIGNATURE',
            message: 'Stripe signature is required',
          },
        });
        return;
      }

      // Verify webhook signature
      const event = paymentService.verifyWebhookSignature(req.body, signature);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await paymentService.handlePaymentSuccess(event.data.object.id);
          break;

        case 'checkout.session.completed':
          await paymentService.handleCheckoutSuccess(event.data.object.id);
          break;

        case 'invoice.paid':
          // Handle subscription renewal
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            await paymentService.handleSubscriptionRenewal(invoice.subscription);
          }
          break;

        case 'customer.subscription.deleted':
          await paymentService.handleSubscriptionCancellation(event.data.object.id);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({
        error: {
          code: 'WEBHOOK_ERROR',
          message: error instanceof Error ? error.message : 'Webhook processing failed',
        },
      });
    }
  }
}

export default new PaymentController();
