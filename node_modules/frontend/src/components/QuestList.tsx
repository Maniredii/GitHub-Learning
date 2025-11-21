import React, { useState, useEffect } from 'react';
import type { Quest, UserProgress } from '../../../shared/src/types';
import { questApi } from '../services/questApi';
import './QuestList.css';

export interface QuestListProps {
  chapterId: string;
  userProgress?: UserProgress;
  onQuestSelect: (questId: string) => void;
  selectedQuestId?: string;
}

export const QuestList: React.FC<QuestListProps> = ({
  chapterId,
  userProgress,
  onQuestSelect,
  selectedQuestId,
}) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuests();
  }, [chapterId]);

  const loadQuests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedQuests = await questApi.getChapterQuests(chapterId);

      // Sort quests by order
      const sortedQuests = fetchedQuests.sort((a, b) => a.order - b.order);
      setQuests(sortedQuests);
    } catch (err) {
      console.error('Failed to load quests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quests');
    } finally {
      setIsLoading(false);
    }
  };

  const isQuestCompleted = (questId: string): boolean => {
    return userProgress?.completedQuests.includes(questId) || false;
  };

  const isQuestLocked = (_quest: Quest, index: number): boolean => {
    // First quest is always unlocked
    if (index === 0) return false;

    // Check if previous quest is completed
    const previousQuest = quests[index - 1];
    return !isQuestCompleted(previousQuest.id);
  };

  const handleQuestClick = (questId: string, index: number) => {
    const quest = quests[index];
    if (!isQuestLocked(quest, index)) {
      onQuestSelect(questId);
    }
  };

  if (isLoading) {
    return (
      <div className="quest-list-loading">
        <div className="quest-list-loading-spinner"></div>
        <div className="quest-list-loading-text">Loading quests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quest-list-error">
        <div className="quest-list-error-icon">⚠️</div>
        <div className="quest-list-error-text">{error}</div>
        <button className="quest-list-error-retry" onClick={loadQuests}>
          Retry
        </button>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <div className="quest-list-empty">
        <div className="quest-list-empty-icon">📜</div>
        <div className="quest-list-empty-text">No quests available in this chapter</div>
      </div>
    );
  }

  return (
    <div className="quest-list" role="region" aria-labelledby="quest-list-title">
      <div className="quest-list-header">
        <h2 className="quest-list-title" id="quest-list-title">Chapter Quests</h2>
        <div 
          className="quest-list-progress"
          role="status"
          aria-live="polite"
          aria-label={`${quests.filter((q) => isQuestCompleted(q.id)).length} of ${quests.length} quests completed`}
        >
          {quests.filter((q) => isQuestCompleted(q.id)).length} / {quests.length} completed
        </div>
      </div>

      <div className="quest-list-items" role="list">
        {quests.map((quest, index) => {
          const completed = isQuestCompleted(quest.id);
          const locked = isQuestLocked(quest, index);
          const selected = quest.id === selectedQuestId;

          return (
            <div
              key={quest.id}
              className={`quest-list-item ${
                completed ? 'quest-list-item-completed' : ''
              } ${locked ? 'quest-list-item-locked' : ''} ${
                selected ? 'quest-list-item-selected' : ''
              }`}
              onClick={() => handleQuestClick(quest.id, index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleQuestClick(quest.id, index);
                }
              }}
              role="listitem button"
              tabIndex={locked ? -1 : 0}
              aria-label={`Quest ${index + 1}: ${quest.title}. ${quest.objective}. Reward: ${quest.xpReward} XP. Status: ${locked ? 'Locked' : completed ? 'Completed' : 'Available'}`}
              aria-disabled={locked}
              aria-current={selected ? 'true' : undefined}
            >
              {/* Quest Number */}
              <div className="quest-list-item-number" aria-hidden="true">
                {locked ? (
                  <span className="quest-list-item-lock-icon">🔒</span>
                ) : completed ? (
                  <span className="quest-list-item-check-icon">✓</span>
                ) : (
                  <span className="quest-list-item-order">{index + 1}</span>
                )}
              </div>

              {/* Quest Info */}
              <div className="quest-list-item-info">
                <div className="quest-list-item-title">{quest.title}</div>
                <div className="quest-list-item-objective">{quest.objective}</div>
              </div>

              {/* Quest XP */}
              <div className="quest-list-item-xp" aria-hidden="true">
                <span className="quest-list-item-xp-icon">⭐</span>
                <span className="quest-list-item-xp-value">{quest.xpReward}</span>
              </div>

              {/* Status Indicator */}
              <div className="quest-list-item-status" aria-hidden="true">
                {locked && <span className="quest-list-item-status-text">Locked</span>}
                {completed && !locked && (
                  <span className="quest-list-item-status-text">Completed</span>
                )}
                {!locked && !completed && (
                  <span className="quest-list-item-status-text">Available</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total XP */}
      <div className="quest-list-footer">
        <div 
          className="quest-list-total-xp"
          role="status"
          aria-label={`Total chapter experience points: ${quests.reduce((sum, quest) => sum + quest.xpReward, 0)} XP`}
        >
          <span className="quest-list-total-xp-label">Total Chapter XP:</span>
          <span className="quest-list-total-xp-value">
            {quests.reduce((sum, quest) => sum + quest.xpReward, 0)} XP
          </span>
        </div>
      </div>
    </div>
  );
};
