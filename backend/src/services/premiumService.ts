import db from '../database/db';

export interface PremiumStatus {
  isPremium: boolean;
  subscriptionType: 'one_time' | 'monthly' | null;
  expiresAt: Date | null;
}

export class PremiumService {
  /**
   * Get user's premium status
   */
  async getPremiumStatus(userId: string): Promise<PremiumStatus> {
    const userProgress = await db('user_progress').where('user_id', userId).first();

    if (!userProgress) {
      return {
        isPremium: false,
        subscriptionType: null,
        expiresAt: null,
      };
    }

    const isPremium = this.isActivePremium(userProgress);

    return {
      isPremium,
      subscriptionType: userProgress.subscription_type || null,
      expiresAt: userProgress.premium_expires_at ? new Date(userProgress.premium_expires_at) : null,
    };
  }

  /**
   * Grant premium access to a user
   */
  async grantPremium(
    userId: string,
    subscriptionType: 'one_time' | 'monthly'
  ): Promise<void> {
    const expiresAt = subscriptionType === 'monthly' 
      ? this.calculateMonthlyExpiration() 
      : null;

    await db('user_progress')
      .where('user_id', userId)
      .update({
        is_premium: true,
        subscription_type: subscriptionType,
        premium_expires_at: expiresAt,
        updated_at: db.fn.now(),
      });
  }

  /**
   * Renew monthly subscription
   */
  async renewMonthlySubscription(userId: string): Promise<void> {
    const userProgress = await db('user_progress').where('user_id', userId).first();

    if (!userProgress || userProgress.subscription_type !== 'monthly') {
      throw new Error('User does not have a monthly subscription');
    }

    const newExpiresAt = this.calculateMonthlyExpiration();

    await db('user_progress')
      .where('user_id', userId)
      .update({
        is_premium: true,
        premium_expires_at: newExpiresAt,
        updated_at: db.fn.now(),
      });
  }

  /**
   * Revoke premium access (for cancellations or failed payments)
   */
  async revokePremium(userId: string): Promise<void> {
    await db('user_progress')
      .where('user_id', userId)
      .update({
        is_premium: false,
        subscription_type: null,
        premium_expires_at: null,
        updated_at: db.fn.now(),
      });
  }

  /**
   * Check if user has active premium
   */
  private isActivePremium(userProgress: any): boolean {
    if (!userProgress || !userProgress.is_premium) {
      return false;
    }

    // One-time purchase never expires
    if (userProgress.subscription_type === 'one_time') {
      return true;
    }

    // Monthly subscription - check expiration
    if (userProgress.subscription_type === 'monthly' && userProgress.premium_expires_at) {
      const expirationDate = new Date(userProgress.premium_expires_at);
      return expirationDate > new Date();
    }

    return false;
  }

  /**
   * Calculate expiration date for monthly subscription (30 days from now)
   */
  private calculateMonthlyExpiration(): Date {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);
    return expiresAt;
  }
}

export default new PremiumService();
