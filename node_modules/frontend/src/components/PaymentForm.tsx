import React, { useState, useEffect } from 'react';
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
import { createOneTimePurchase, createMonthlySubscription } from '../services/paymentApi';
import './PaymentForm.css';

// Initialize Stripe (use your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
  planType: 'one_time' | 'monthly';
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ planType, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Initialize Stripe Elements for one-time purchase
  useEffect(() => {
    if (planType === 'one_time') {
      initializeStripeElements();
    }
  }, [planType]);

  const initializeStripeElements = async () => {
    try {
      const stripeInstance = await stripePromise;
      if (!stripeInstance) {
        throw new Error('Failed to load Stripe');
      }

      // Create payment intent and get client secret
      const result = await createOneTimePurchase();
      setClientSecret(result.clientSecret);

      // Create Stripe Elements
      const elementsInstance = stripeInstance.elements({
        clientSecret: result.clientSecret,
      });

      // Create and mount card element
      const cardElement = elementsInstance.create('payment', {
        layout: {
          type: 'tabs',
          defaultCollapsed: false,
        },
      });

      // Mount to DOM
      const cardContainer = document.getElementById('card-element');
      if (cardContainer) {
        cardElement.mount('#card-element');
      }

      setStripe(stripeInstance);
      setElements(elementsInstance);
    } catch (err) {
      console.error('Error initializing Stripe:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      if (planType === 'monthly') {
        // For monthly subscription, redirect to Stripe Checkout
        const successUrl = `${window.location.origin}/payment-success`;
        const cancelUrl = `${window.location.origin}/dashboard`;

        const result = await createMonthlySubscription(successUrl, cancelUrl);

        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        // For one-time purchase, confirm payment with Stripe Elements
        if (!stripe || !elements || !clientSecret) {
          throw new Error('Payment system not initialized');
        }

        const { error: submitError } = await elements.submit();
        if (submitError) {
          throw new Error(submitError.message);
        }

        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
          },
          redirect: 'if_required',
        });

        if (confirmError) {
          throw new Error(confirmError.message);
        }

        // Payment successful
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-form">
      <div className="payment-form-header">
        <h3>
          {planType === 'one_time' ? 'One-Time Purchase' : 'Monthly Subscription'}
        </h3>
        <p className="payment-form-price">
          {planType === 'one_time' ? '$29.99' : '$9.99/month'}
        </p>
      </div>

      {error && (
        <div className="payment-form-error">
          <span className="payment-form-error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="payment-form-info">
        <p>
          {planType === 'one_time'
            ? 'You will be charged $29.99 for lifetime access to all GitQuest premium content.'
            : 'You will be charged $9.99 per month. Cancel anytime.'}
        </p>
      </div>

      {/* Card element container for one-time purchase */}
      {planType === 'one_time' && (
        <div className="payment-form-card">
          <div id="card-element"></div>
        </div>
      )}

      <div className="payment-form-actions">
        <button
          className="payment-form-button cancel"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          className="payment-form-button primary"
          onClick={handlePayment}
          disabled={isProcessing || (planType === 'one_time' && !clientSecret)}
        >
          {isProcessing
            ? 'Processing...'
            : planType === 'one_time'
              ? 'Pay $29.99'
              : 'Continue to Checkout'}
        </button>
      </div>

      <div className="payment-form-footer">
        <p>🔒 Secure payment powered by Stripe</p>
      </div>
    </div>
  );
};

export default PaymentForm;
