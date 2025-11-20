import React, { useState, useEffect } from 'react';
import { hintApi, type NextHintResponse, type HintTracking } from '../services/hintApi';
import { getCommandDocumentation, getContextualHint } from '../utils/gitDocumentation';
import './HintPanel.css';

export interface HintPanelProps {
  questId: string;
  questXpReward: number;
  totalHints: number;
  onHintShown?: (hintsShown: number, xpPenalty: number) => void;
  lastError?: string;
  lastCommand?: string;
}

export const HintPanel: React.FC<HintPanelProps> = ({
  questId,
  questXpReward,
  totalHints,
  onHintShown,
  lastError,
  lastCommand,
}) => {
  const [tracking, setTracking] = useState<HintTracking | null>(null);
  const [currentHint, setCurrentHint] = useState<NextHintResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHintOffer, setShowHintOffer] = useState(false);
  const [contextualHint, setContextualHint] = useState<string | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);

  useEffect(() => {
    loadHintTracking();
  }, [questId]);

  const loadHintTracking = async () => {
    try {
      const data = await hintApi.getHintTracking(questId);
      setTracking(data);
    } catch (err) {
      console.error('Failed to load hint tracking:', err);
      // Don't show error for tracking, just use defaults
      setTracking({
        incorrect_attempts: 0,
        hints_shown: 0,
        shown_hint_indices: [],
      });
    }
  };

  const handleShowHint = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const hintData = await hintApi.getNextHint(questId);
      setCurrentHint(hintData);

      if (hintData.hint) {
        // Update tracking
        await loadHintTracking();

        // Notify parent component
        if (onHintShown && hintData.xpPenalty !== undefined) {
          onHintShown(hintData.hintsShown || 0, hintData.xpPenalty);
        }
      }

      setShowHintOffer(false);
    } catch (err) {
      console.error('Failed to get hint:', err);
      setError(err instanceof Error ? err.message : 'Failed to get hint');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissOffer = () => {
    setShowHintOffer(false);
  };

  const handleDismissHint = () => {
    setCurrentHint(null);
  };

  // Show hint offer when triggered externally
  useEffect(() => {
    if (tracking && tracking.incorrect_attempts >= 3 && !currentHint) {
      setShowHintOffer(true);
    }
  }, [tracking?.incorrect_attempts]);

  // Generate contextual hint based on error
  useEffect(() => {
    if (lastError && lastCommand) {
      const hint = getContextualHint(lastError, lastCommand);
      setContextualHint(hint);
    } else {
      setContextualHint(null);
    }
  }, [lastError, lastCommand]);

  const handleShowDocumentation = () => {
    setShowDocumentation(!showDocumentation);
  };

  const commandDoc = lastCommand ? getCommandDocumentation(lastCommand) : null;

  const hintsRemaining = totalHints - (tracking?.hints_shown || 0);
  const xpPenaltyPercent = Math.min((tracking?.hints_shown || 0) * 5, 25);

  return (
    <div className="hint-panel">
      {/* Contextual Hint (automatic) */}
      {contextualHint && !currentHint && (
        <div className="hint-panel-contextual">
          <div className="hint-panel-contextual-icon">💡</div>
          <div className="hint-panel-contextual-content">
            <div className="hint-panel-contextual-title">Quick Tip</div>
            <div className="hint-panel-contextual-text">{contextualHint}</div>
          </div>
        </div>
      )}

      {/* Hint Offer Modal */}
      {showHintOffer && !currentHint && (
        <div className="hint-panel-offer">
          <div className="hint-panel-offer-icon">💡</div>
          <div className="hint-panel-offer-content">
            <div className="hint-panel-offer-title">Need a hint?</div>
            <div className="hint-panel-offer-text">
              You've had {tracking?.incorrect_attempts} incorrect attempts. Would you like a hint?
            </div>
            <div className="hint-panel-offer-warning">
              Using hints will reduce your XP reward by 5% per hint (current penalty:{' '}
              {xpPenaltyPercent}%)
            </div>
            <div className="hint-panel-offer-actions">
              <button
                className="hint-panel-button hint-panel-button-primary"
                onClick={handleShowHint}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Show Hint'}
              </button>
              <button
                className="hint-panel-button hint-panel-button-secondary"
                onClick={handleDismissOffer}
              >
                No Thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Hint Display */}
      {currentHint && currentHint.hint && (
        <div className="hint-panel-display">
          <div className="hint-panel-display-header">
            <div className="hint-panel-display-title">
              <span className="hint-panel-display-icon">💡</span>
              Hint {(currentHint.hintIndex || 0) + 1} of {currentHint.totalHints}
            </div>
            <button className="hint-panel-display-close" onClick={handleDismissHint}>
              ✕
            </button>
          </div>
          <div className="hint-panel-display-content">{currentHint.hint}</div>
          <div className="hint-panel-display-footer">
            <div className="hint-panel-display-xp">
              Adjusted XP: {currentHint.adjustedXp} (-{currentHint.xpPenalty})
            </div>
          </div>
        </div>
      )}

      {/* All Hints Shown Message */}
      {currentHint && !currentHint.hint && currentHint.message && (
        <div className="hint-panel-display hint-panel-display-empty">
          <div className="hint-panel-display-icon">ℹ️</div>
          <div className="hint-panel-display-content">{currentHint.message}</div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="hint-panel-error">
          <span className="hint-panel-error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Command Documentation */}
      {commandDoc && (
        <div className="hint-panel-documentation">
          <button
            className="hint-panel-documentation-toggle"
            onClick={handleShowDocumentation}
          >
            📚 Command Reference: {commandDoc.command}
            <span className="hint-panel-documentation-arrow">
              {showDocumentation ? '▼' : '▶'}
            </span>
          </button>
          {showDocumentation && (
            <div className="hint-panel-documentation-content">
              <div className="hint-panel-documentation-section">
                <div className="hint-panel-documentation-label">Description:</div>
                <div className="hint-panel-documentation-text">{commandDoc.description}</div>
              </div>
              <div className="hint-panel-documentation-section">
                <div className="hint-panel-documentation-label">Usage:</div>
                <div className="hint-panel-documentation-code">{commandDoc.usage}</div>
              </div>
              <div className="hint-panel-documentation-section">
                <div className="hint-panel-documentation-label">Examples:</div>
                <div className="hint-panel-documentation-examples">
                  {commandDoc.examples.map((example, index) => (
                    <div key={index} className="hint-panel-documentation-code">
                      {example}
                    </div>
                  ))}
                </div>
              </div>
              <a
                href={commandDoc.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hint-panel-documentation-link"
              >
                Learn more →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Hint Button */}
      <div className="hint-panel-controls">
        <button
          className="hint-panel-button hint-panel-button-show"
          onClick={handleShowHint}
          disabled={isLoading || hintsRemaining === 0}
        >
          {isLoading ? 'Loading...' : hintsRemaining === 0 ? 'No Hints Left' : 'Show Hint'}
        </button>
        <div className="hint-panel-info">
          <div className="hint-panel-info-item">
            <span className="hint-panel-info-label">Hints Used:</span>
            <span className="hint-panel-info-value">
              {tracking?.hints_shown || 0} / {totalHints}
            </span>
          </div>
          {(tracking?.hints_shown || 0) > 0 && (
            <div className="hint-panel-info-item hint-panel-info-warning">
              <span className="hint-panel-info-label">XP Penalty:</span>
              <span className="hint-panel-info-value">{xpPenaltyPercent}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
