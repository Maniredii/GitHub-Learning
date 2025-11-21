import Stripe from 'stripe';
import premiumService from './premiumService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export class PaymentService {
  /**
   * Create a payment intent for one-time purchase
   */
  async createOneTimePurchaseIntent(userId: string): Promise<PaymentIntentResult> {
    const amount = 2999; // $29.99 in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId,
        subscriptionType: 'one_time',
      },
      description: 'GitQuest Premium - Lifetime Access',
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Create a checkout session for monthly subscription
   */
  async createMonthlySubscriptionSession(
    userId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSessionResult> {
    // Create or retrieve customer
    const customer = await this.getOrCreateCustomer(userId);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'GitQuest Premium Monthly',
              description: 'Full access to all GitQuest chapters and features',
            },
            unit_amount: 999, // $9.99 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        subscriptionType: 'monthly',
      },
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  }

  /**
   * Handle successful payment webhook
   */
  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      const userId = paymentIntent.metadata.userId;
      const subscriptionType = paymentIntent.metadata.subscriptionType as 'one_time' | 'monthly';

      if (userId && subscriptionType) {
        await premiumService.grantPremium(userId, subscriptionType);
      }
    }
  }

  /**
   * Handle successful subscription checkout
   */
  async handleCheckoutSuccess(sessionId: string): Promise<void> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const userId = session.metadata?.userId;
      const subscriptionType = session.metadata?.subscriptionType as 'one_time' | 'monthly';

      if (userId && subscriptionType) {
        await premiumService.grantPremium(userId, subscriptionType);
      }
    }
  }

  /**
   * Handle subscription renewal
   */
  async handleSubscriptionRenewal(subscriptionId: string): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status === 'active') {
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      
      if (customer && 'metadata' in customer && customer.metadata) {
        const userId = customer.metadata.userId;
        if (userId) {
          await premiumService.renewMonthlySubscription(userId);
        }
      }
    }
  }

  /**
   * Handle subscription cancellation
   */
  async handleSubscriptionCancellation(subscriptionId: string): Promise<void> {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customer = await stripe.customers.retrieve(subscription.customer as string);

    if (customer && 'metadata' in customer && customer.metadata) {
      const userId = customer.metadata.userId;
      if (userId) {
        await premiumService.revokePremium(userId);
      }
    }
  }

  /**
   * Get or create Stripe customer for user
   */
  private async getOrCreateCustomer(userId: string): Promise<Stripe.Customer> {
    // Get user email from database
    const db = require('../database/db').default;
    const user = await db('users').where({ id: userId }).select('email').first();
    
    if (!user) {
      throw new Error('User not found');
    }

    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return stripe.customers.create({
      email: user.email,
      metadata: {
        userId,
      },
    });
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}

export default new PaymentService();
