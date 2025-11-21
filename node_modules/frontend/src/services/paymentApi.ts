const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface OneTimePurchaseResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
}

export interface MonthlySubscriptionResponse {
  success: boolean;
  sessionId: string;
  url: string;
}

/**
 * Create a payment intent for one-time purchase
 */
export async function createOneTimePurchase(): Promise<OneTimePurchaseResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/payment/one-time`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create payment');
  }

  return response.json();
}

/**
 * Create a checkout session for monthly subscription
 */
export async function createMonthlySubscription(
  successUrl: string,
  cancelUrl: string
): Promise<MonthlySubscriptionResponse> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/payment/monthly`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ successUrl, cancelUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create subscription');
  }

  return response.json();
}
