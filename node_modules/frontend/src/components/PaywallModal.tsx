import React from 'react';
import './PaywallModal.css';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planType: 'one_time' | 'monthly') => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  // Handle escape key to close modal
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap and initial focus
  React.useEffect(() => {
    if (!isOpen) return;

    const modal = document.querySelector('.paywall-modal') as HTMLElement;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="paywall-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      aria-describedby="paywall-description"
    >
      <div className="paywall-modal" onClick={(e) => e.stopPropagation()}>
        <button className="paywall-close" onClick={onClose} aria-label="Close premium upgrade dialog">
          ×
        </button>

        <div className="paywall-header">
          <h2 id="paywall-title"><span aria-hidden="true">🔒</span> Premium Content Locked</h2>
          <p id="paywall-description">Unlock all chapters and continue your Chrono-Coder journey!</p>
        </div>

        <div className="paywall-benefits" role="region" aria-label="Premium benefits">
          <h3>Premium Benefits:</h3>
          <ul>
            <li><span aria-hidden="true">✨</span> Access to all 9 chapters</li>
            <li><span aria-hidden="true">🎯</span> Advanced Git concepts (branching, merging, rebasing)</li>
            <li><span aria-hidden="true">⚔️</span> Epic boss battles</li>
            <li><span aria-hidden="true">🏆</span> Exclusive achievements and badges</li>
            <li><span aria-hidden="true">📚</span> Complete Git mastery curriculum</li>
          </ul>
        </div>

        <div className="paywall-pricing" role="group" aria-label="Pricing options">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 id="one-time-plan">One-Time Purchase</h3>
              <div className="price" aria-label="Price: $29.99">
                <span className="currency" aria-hidden="true">$</span>
                <span className="amount" aria-hidden="true">29</span>
                <span className="period" aria-hidden="true">.99</span>
              </div>
            </div>
            <ul className="pricing-features" aria-labelledby="one-time-plan">
              <li><span aria-hidden="true">✓</span> Lifetime access</li>
              <li><span aria-hidden="true">✓</span> All current & future content</li>
              <li><span aria-hidden="true">✓</span> No recurring charges</li>
            </ul>
            <button
              className="pricing-button primary"
              onClick={() => onSelectPlan('one_time')}
              aria-label="Purchase one-time access for $29.99"
            >
              Buy Now
            </button>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge" role="note">Most Popular</div>
            <div className="pricing-header">
              <h3 id="monthly-plan">Monthly Subscription</h3>
              <div className="price" aria-label="Price: $9.99 per month">
                <span className="currency" aria-hidden="true">$</span>
                <span className="amount" aria-hidden="true">9</span>
                <span className="period" aria-hidden="true">.99/mo</span>
              </div>
            </div>
            <ul className="pricing-features" aria-labelledby="monthly-plan">
              <li><span aria-hidden="true">✓</span> Full access while subscribed</li>
              <li><span aria-hidden="true">✓</span> Cancel anytime</li>
              <li><span aria-hidden="true">✓</span> Perfect for trying it out</li>
            </ul>
            <button
              className="pricing-button featured"
              onClick={() => onSelectPlan('monthly')}
              aria-label="Subscribe for $9.99 per month"
            >
              Subscribe
            </button>
          </div>
        </div>

        <div className="paywall-footer" role="contentinfo">
          <p><span aria-hidden="true">🔒</span> Secure payment processing</p>
          <p className="free-content-note">
            Chapters 1-4 remain free forever. No credit card required to start learning!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
