import React, { useState, useEffect } from 'react';
import { questApi } from '../services/questApi';
import { PaywallModal } from './PaywallModal';
import type { Chapter } from '../../../shared/src/types';

interface PremiumQuestGuardProps {
  questId: string;
  chapterId: string;
  children: React.ReactNode;
  onPremiumRequired?: () => void;
}

export const PremiumQuestGuard: React.FC<PremiumQuestGuardProps> = ({
  questId,
  chapterId,
  children,
  onPremiumRequired,
}) => {
  const [showPaywall, setShowPaywall] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [chapter, setChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    checkAccess();
  }, [questId]);

  const checkAccess = async () => {
    try {
      setIsChecking(true);
      
      // Fetch chapter to check if it's premium
      const chapterData = await questApi.getChapterById(chapterId);
      setChapter(chapterData);

      // Try to fetch the quest - if it returns 403 with PREMIUM_REQUIRED, show paywall
      try {
        await questApi.getQuestById(questId);
        setCanAccess(true);
        setShowPaywall(false);
      } catch (error: any) {
        if (error.message?.includes('premium') || error.message?.includes('PREMIUM_REQUIRED')) {
          setCanAccess(false);
          setShowPaywall(true);
          onPremiumRequired?.();
        } else {
          // Other errors - allow access but let parent handle error
          setCanAccess(true);
        }
      }
    } catch (error) {
      console.error('Error checking quest access:', error);
      // On error, allow access and let parent component handle it
      setCanAccess(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSelectPlan = (planType: 'one_time' | 'monthly') => {
    // This will be implemented in task 20.2 with actual payment integration
    console.log('Selected plan:', planType);
    alert(`Payment integration coming soon! Selected: ${planType}`);
    // For now, just close the modal
    // In task 20.2, this will redirect to payment flow
  };

  const handleClosePaywall = () => {
    setShowPaywall(false);
  };

  if (isChecking) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#a8b2d1' }}>
        <div>Checking access...</div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ color: '#e94560', marginBottom: '10px' }}>Premium Content</h2>
          <p style={{ color: '#a8b2d1', marginBottom: '20px' }}>
            This quest is part of {chapter?.title || 'a premium chapter'}.
          </p>
          <button
            onClick={() => setShowPaywall(true)}
            style={{
              padding: '12px 32px',
              backgroundColor: '#e94560',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Unlock Premium
          </button>
        </div>
        <PaywallModal
          isOpen={showPaywall}
          onClose={handleClosePaywall}
          onSelectPlan={handleSelectPlan}
        />
      </>
    );
  }

  return <>{children}</>;
};

export default PremiumQuestGuard;
