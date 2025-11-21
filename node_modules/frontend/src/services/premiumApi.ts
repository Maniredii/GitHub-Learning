const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface PremiumStatus {
  isPremium: boolean;
  subscriptionType: 'one_time' | 'monthly' | null;
  expiresAt: string | null;
}

/**
 * Get current user's premium status
 */
export async function getPremiumStatus(): Promise<PremiumStatus> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/premium/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to get premium status');
  }

  return response.json();
}
