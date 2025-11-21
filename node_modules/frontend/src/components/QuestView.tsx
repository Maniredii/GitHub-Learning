import React, { useState, useEffect } from 'react';
import type { Quest, RepositoryState } from '../../../shared/src/types';
import { Terminal } from './Terminal';
import { Editor } from './Editor';
import { GitGraph } from './GitGraph';
import { HintPanel } from './HintPanel';
import { questApi, type QuestValidationResponse } from '../services/questApi';
import { gitApi } from '../services/gitApi';
import { hintApi } from '../services/hintApi';
import './QuestView.css';

export interface QuestViewProps {
  quest: Quest;
  onComplete?: (questId: string, xpEarned: number) => void;
  onNext?: () => void;
}

export const QuestView: React.FC<QuestViewProps> = ({ quest, onComplete, onNext }) => {
  const [repositoryId, setRepositoryId] = useState<string>('');
  const [repositoryState, setRepositoryState] = useState<RepositoryState | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<QuestValidationResponse | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [showEditor, setShowEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adjustedXp, setAdjustedXp] = useState<number>(quest.xpReward);
  const [xpPenalty, setXpPenalty] = useState<number>(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  // Initialize repository when quest loads
  useEffect(() => {
    initializeRepository();
  }, [quest.id]);

  // Update repository state when commands are executed
  useEffect(() => {
    if (repositoryId) {
      refreshRepositoryState();
    }
  }, [repositoryId]);

  const initializeRepository = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a new repository with initial state from quest
      const result = await gitApi.createRepository(
        quest.initialRepositoryState?.workingDirectory || {}
      );

      setRepositoryId(result.repositoryId);
      setRepositoryState(result.state);

      // If there are files, select the first one
      const files = Object.keys(result.state.workingDirectory);
      if (files.length > 0) {
        setSelectedFile(files[0]);
        setFileContent(result.state.workingDirectory[files[0]].content);
        setShowEditor(true);
      }
    } catch (err) {
      console.error('Failed to initialize repository:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize quest');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRepositoryState = async () => {
    try {
      const result = await gitApi.getRepository(repositoryId);
      setRepositoryState(result.state);
    } catch (err) {
      console.error('Failed to refresh repository state:', err);
    }
  };

  const handleCommandExecute = async () => {
    // Clear error state on successful command
    setLastError(null);
    setLastCommand(null);
    // Refresh repository state after command execution
    await refreshRepositoryState();
  };

  const handleCommandError = (command: string, error: string) => {
    // Store error and command for contextual hints
    setLastError(error);
    setLastCommand(command);
  };

  const handleValidateQuest = async () => {
    if (!repositoryState) {
      setError('Repository not initialized');
      return;
    }

    try {
      setIsValidating(true);
      setValidationResult(null);

      const result = await questApi.validateQuest(quest.id, repositoryState);
      
      // Apply XP penalty if hints were used
      const finalXp = result.success ? adjustedXp : 0;
      const resultWithAdjustedXp = {
        ...result,
        xpAwarded: finalXp,
      };
      
      setValidationResult(resultWithAdjustedXp);

      if (result.success) {
        setIsCompleted(true);
        if (onComplete) {
          onComplete(quest.id, finalXp);
        }
      } else {
        // Record incorrect attempt
        try {
          await hintApi.recordIncorrectAttempt(quest.id);
          // The HintPanel will automatically show offer if needed
        } catch (err) {
          console.error('Failed to record incorrect attempt:', err);
        }
      }
    } catch (err) {
      console.error('Failed to validate quest:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate quest');
    } finally {
      setIsValidating(false);
    }
  };

  const handleHintShown = (_hintsShown: number, penalty: number) => {
    setXpPenalty(penalty);
    setAdjustedXp(quest.xpReward - penalty);
  };

  const handleFileSave = async (content: string) => {
    if (!selectedFile || !repositoryId) return;

    try {
      await gitApi.updateFileContent(repositoryId, selectedFile, content);
      setFileContent(content);
      await refreshRepositoryState();
    } catch (err) {
      console.error('Failed to save file:', err);
      setError(err instanceof Error ? err.message : 'Failed to save file');
    }
  };

  const handleFileSelect = (filePath: string) => {
    if (!repositoryState) return;

    const file = repositoryState.workingDirectory[filePath];
    if (file) {
      setSelectedFile(filePath);
      setFileContent(file.content);
      setShowEditor(true);
    }
  };

  const handleNextQuest = () => {
    if (onNext) {
      onNext();
    }
  };

  if (isLoading) {
    return (
      <div className="quest-view-loading">
        <div className="quest-view-loading-spinner"></div>
        <div className="quest-view-loading-text">Initializing quest...</div>
      </div>
    );
  }

  if (error && !repositoryId) {
    return (
      <div className="quest-view-error">
        <div className="quest-view-error-icon">⚠️</div>
        <div className="quest-view-error-text">{error}</div>
        <button className="quest-view-error-retry" onClick={initializeRepository}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="quest-view" role="main" aria-labelledby="quest-title">
      {/* Quest Header */}
      <div className="quest-view-header">
        <div className="quest-view-title-section">
          <h1 className="quest-view-title" id="quest-title">{quest.title}</h1>
          {isCompleted && (
            <div 
              className="quest-view-completed-badge" 
              role="status"
              aria-label="Quest completed"
            >
              ✓ Completed
            </div>
          )}
        </div>
        <div 
          className="quest-view-xp-badge"
          role="status"
          aria-label={`Experience points: ${xpPenalty > 0 ? `${adjustedXp} XP (reduced from ${quest.xpReward} XP due to hints)` : `${quest.xpReward} XP`}`}
        >
          {xpPenalty > 0 ? (
            <>
              <span className="quest-view-xp-adjusted">{adjustedXp} XP</span>
              <span className="quest-view-xp-original">({quest.xpReward} XP)</span>
            </>
          ) : (
            <>{quest.xpReward} XP</>
          )}
        </div>
      </div>

      {/* Quest Narrative */}
      <section 
        className="quest-view-narrative"
        aria-labelledby="quest-narrative-label"
      >
        <div className="quest-view-narrative-icon" aria-hidden="true">📜</div>
        <div className="quest-view-narrative-content">
          <h2 className="visually-hidden" id="quest-narrative-label">Quest Story</h2>
          <p>{quest.narrative}</p>
        </div>
      </section>

      {/* Quest Objective */}
      <section 
        className="quest-view-objective"
        aria-labelledby="quest-objective-label"
      >
        <div className="quest-view-objective-label" id="quest-objective-label">Learning Objective:</div>
        <div className="quest-view-objective-text">{quest.objective}</div>
      </section>

      {/* Hint Panel */}
      {quest.hints && quest.hints.length > 0 && !isCompleted && (
        <HintPanel
          questId={quest.id}
          questXpReward={quest.xpReward}
          totalHints={quest.hints.length}
          onHintShown={handleHintShown}
          lastError={lastError || undefined}
          lastCommand={lastCommand || undefined}
        />
      )}

      {/* Validation Result */}
      {validationResult && (
        <div
          className={`quest-view-validation ${
            validationResult.success
              ? 'quest-view-validation-success'
              : 'quest-view-validation-failure'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <div className="quest-view-validation-icon" aria-hidden="true">
            {validationResult.success ? '✓' : '✗'}
          </div>
          <div className="quest-view-validation-content">
            <div className="quest-view-validation-feedback">{validationResult.feedback}</div>
            {validationResult.success && (
              <div className="quest-view-validation-xp">
                +{validationResult.xpAwarded} XP earned!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && repositoryId && (
        <div 
          className="quest-view-error-banner"
          role="alert"
          aria-live="assertive"
        >
          <span className="quest-view-error-banner-icon" aria-hidden="true">⚠️</span>
          {error}
        </div>
      )}

      {/* Interactive Components */}
      <div className="quest-view-workspace">
        {/* Terminal */}
        <div className="quest-view-terminal-section">
          <Terminal
            repositoryId={repositoryId}
            onCommandExecute={handleCommandExecute}
            onCommandError={handleCommandError}
          />
        </div>

        {/* Editor (if files exist) */}
        {showEditor && selectedFile && (
          <div className="quest-view-editor-section">
            <Editor
              filePath={selectedFile}
              content={fileContent}
              onSave={handleFileSave}
              conflictMode={fileContent.includes('<<<<<<< ')}
            />
          </div>
        )}

        {/* Git Graph */}
        {repositoryState && repositoryState.commits.length > 0 && (
          <div className="quest-view-graph-section">
            <GitGraph
              commits={repositoryState.commits}
              branches={repositoryState.branches}
              currentHead={repositoryState.head}
            />
          </div>
        )}
      </div>

      {/* File Browser (if multiple files) */}
      {repositoryState && Object.keys(repositoryState.workingDirectory).length > 1 && (
        <div className="quest-view-file-browser">
          <div className="quest-view-file-browser-title">Files:</div>
          <div className="quest-view-file-list">
            {Object.keys(repositoryState.workingDirectory).map((filePath) => (
              <button
                key={filePath}
                className={`quest-view-file-item ${
                  selectedFile === filePath ? 'quest-view-file-item-active' : ''
                }`}
                onClick={() => handleFileSelect(filePath)}
              >
                <span className="quest-view-file-icon">📄</span>
                {filePath}
                {repositoryState.workingDirectory[filePath].modified && (
                  <span className="quest-view-file-modified">●</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="quest-view-actions" role="group" aria-label="Quest actions">
        <button
          className="quest-view-button quest-view-button-validate"
          onClick={handleValidateQuest}
          disabled={isValidating || isCompleted}
          aria-label={isValidating ? 'Validating quest progress' : isCompleted ? 'Quest already completed' : 'Check quest progress'}
          aria-busy={isValidating}
        >
          {isValidating ? 'Checking...' : isCompleted ? 'Quest Complete' : 'Check Progress'}
        </button>

        {isCompleted && onNext && (
          <button 
            className="quest-view-button quest-view-button-next" 
            onClick={handleNextQuest}
            aria-label="Proceed to next quest"
          >
            Next Quest →
          </button>
        )}
      </div>
    </div>
  );
};
