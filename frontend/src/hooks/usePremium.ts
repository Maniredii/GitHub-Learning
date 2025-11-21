import { useState, useEffect } from 'react';
import { getPremiumStatus, type PremiumStatus } from '../services/premiumApi';

export function usePremium() {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const status = await getPremiumStatus();
      setPremiumStatus(status);
    } catch (err) {
      console.error('Failed to load premium status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load premium status');
      // Set default non-premium status on error
      setPremiumStatus({
        isPremium: false,
        subscriptionType: null,
        expiresAt: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPremiumStatus = () => {
    loadPremiumStatus();
  };

  return {
    premiumStatus,
    isLoading,
    error,
    refreshPremiumStatus,
    isPremium: premiumStatus?.isPremium || false,
  };
}
