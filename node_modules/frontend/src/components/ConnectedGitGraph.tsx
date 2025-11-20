import { useEffect, useState, useCallback } from 'react';
import { GitGraph } from './GitGraph';
import { gitApi, RepositoryState } from '../services/gitApi';

interface ConnectedGitGraphProps {
  repositoryId: string;
  onCommitClick?: (commitHash: string) => void;
  refreshTrigger?: number; // Used to trigger refresh from parent
  autoRefresh?: boolean; // Enable automatic polling
  refreshInterval?: number; // Polling interval in ms (default: 5000)
  enableAnimations?: boolean; // Enable graph animations
}

export const ConnectedGitGraph: React.FC<ConnectedGitGraphProps> = ({
  repositoryId,
  onCommitClick,
  refreshTrigger = 0,
  autoRefresh = false,
  refreshInterval = 5000,
  enableAnimations = true,
}) => {
  const [repositoryState, setRepositoryState] = useState<RepositoryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositoryState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await gitApi.getRepository(repositoryId);
      setRepositoryState(response.state);
    } catch (err) {
      console.error('Error fetching repository state:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch repository state');
    } finally {
      setIsLoading(false);
    }
  }, [repositoryId]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchRepositoryState();
  }, [fetchRepositoryState, refreshTrigger]);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchRepositoryState();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, fetchRepositoryState]);

  if (isLoading && !repositoryState) {
    return (
      <div className="git-graph-container">
        <div className="git-graph-header">
          <div className="git-graph-title">Repository Graph</div>
        </div>
        <div className="git-graph-content">
          <div className="git-graph-loading">Loading repository state...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="git-graph-container">
        <div className="git-graph-header">
          <div className="git-graph-title">Repository Graph</div>
        </div>
        <div className="git-graph-content">
          <div className="git-graph-error">
            <div className="git-graph-error-icon">⚠</div>
            <div className="git-graph-error-text">{error}</div>
            <button className="git-graph-error-retry" onClick={fetchRepositoryState}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!repositoryState) {
    return (
      <div className="git-graph-container">
        <div className="git-graph-header">
          <div className="git-graph-title">Repository Graph</div>
        </div>
        <div className="git-graph-content">
          <div className="git-graph-empty">
            <div className="git-graph-empty-icon">📊</div>
            <div className="git-graph-empty-text">No repository data</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GitGraph
      commits={repositoryState.commits}
      branches={repositoryState.branches}
      currentHead={repositoryState.head}
      onCommitClick={onCommitClick}
      enableAnimations={enableAnimations}
    />
  );
};
