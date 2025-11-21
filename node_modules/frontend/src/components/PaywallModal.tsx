import React from 'react';
import './PaywallModal.css';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planType: 'one_time' | 'monthly') => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  if (!isOpen) return null;

  return (
    <div className="paywall-overlay" onClick={onClose}>
      <div className="paywall-modal" onClick={(e) => e.stopPropagation()}>
        <button className="paywall-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="paywall-header">
          <h2>🔒 Premium Content Locked</h2>
          <p>Unlock all chapters and continue your Chrono-Coder journey!</p>
        </div>

        <div className="paywall-benefits">
          <h3>Premium Benefits:</h3>
          <ul>
            <li>✨ Access to all 9 chapters</li>
            <li>🎯 Advanced Git concepts (branching, merging, rebasing)</li>
            <li>⚔️ Epic boss battles</li>
            <li>🏆 Exclusive achievements and badges</li>
            <li>📚 Complete Git mastery curriculum</li>
          </ul>
        </div>

        <div className="paywall-pricing">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>One-Time Purchase</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">29</span>
                <span className="period">.99</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✓ Lifetime access</li>
              <li>✓ All current & future content</li>
              <li>✓ No recurring charges</li>
            </ul>
            <button
              className="pricing-button primary"
              onClick={() => onSelectPlan('one_time')}
            >
              Buy Now
            </button>
          </div>

          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-header">
              <h3>Monthly Subscription</h3>
              <div className="price">
                <span className="currency">$</span>
                <span className="amount">9</span>
                <span className="period">.99/mo</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✓ Full access while subscribed</li>
              <li>✓ Cancel anytime</li>
              <li>✓ Perfect for trying it out</li>
            </ul>
            <button
              className="pricing-button featured"
              onClick={() => onSelectPlan('monthly')}
            >
              Subscribe
            </button>
          </div>
        </div>

        <div className="paywall-footer">
          <p>🔒 Secure payment processing</p>
          <p className="free-content-note">
            Chapters 1-4 remain free forever. No credit card required to start learning!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
