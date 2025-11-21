import { useEffect, useRef, useState } from 'react';
import { createGitgraph, TemplateName, templateExtend } from '@gitgraph/js';
import type { GitgraphOptions } from '@gitgraph/core';
import './GitGraph.css';

interface Commit {
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
  parent: string | null;
  parents?: string[];
  tree: any;
}

interface Branch {
  name: string;
  commitHash: string;
}

interface GitGraphProps {
  commits: Commit[];
  branches: Branch[];
  currentHead: string;
  onCommitClick?: (commitHash: string) => void;
  enableAnimations?: boolean;
}

export const GitGraph: React.FC<GitGraphProps> = ({
  commits,
  branches,
  currentHead,
  onCommitClick,
  enableAnimations = true,
}) => {
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const previousCommitsRef = useRef<Commit[]>([]);
  const previousBranchesRef = useRef<Branch[]>([]);
  const previousHeadRef = useRef<string>('');

  useEffect(() => {
    if (!graphContainerRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Detect changes for animations
      const hasNewCommits = commits.length > previousCommitsRef.current.length;
      const hasNewBranches = branches.length > previousBranchesRef.current.length;
      const headChanged = currentHead !== previousHeadRef.current;

      // Apply animation class if enabled and changes detected
      if (enableAnimations && (hasNewCommits || hasNewBranches || headChanged)) {
        graphContainerRef.current.classList.add('graph-updating');
      }

      // Clear previous graph
      graphContainerRef.current.innerHTML = '';

      // If no commits, show empty state
      if (commits.length === 0) {
        setIsLoading(false);
        return;
      }

      // Create custom template matching game theme
      const customTemplate = templateExtend(TemplateName.Metro, {
        colors: ['#00ff41', '#6bcfff', '#ffd93d', '#ff6bff', '#ff6b6b'],
        branch: {
          lineWidth: 3,
          spacing: 50,
          label: {
            display: true,
            bgColor: '#1a1a2e',
            color: '#00ff41',
            font: 'normal 12pt "Fira Code", monospace',
            borderRadius: 6,
          },
        },
        commit: {
          spacing: 60,
          dot: {
            size: 10,
            strokeWidth: 2,
          },
          message: {
            display: true,
            displayAuthor: true,
            displayHash: true,
            font: 'normal 11pt "Fira Code", monospace',
            color: '#eee',
          },
        },
      });

      // Configure gitgraph options
      const options = {
        template: customTemplate,
        orientation: 'vertical-reverse' as const,
        mode: 'compact' as const,
      } as GitgraphOptions;

      // Create gitgraph instance
      const gitgraph = createGitgraph(graphContainerRef.current, options);

      // Build the graph
      renderGraph(gitgraph, commits, branches, currentHead, onCommitClick);

      // Remove animation class after animation completes
      if (enableAnimations) {
        setTimeout(() => {
          graphContainerRef.current?.classList.remove('graph-updating');
        }, 500);
      }

      // Update refs for next comparison
      previousCommitsRef.current = commits;
      previousBranchesRef.current = branches;
      previousHeadRef.current = currentHead;

      setIsLoading(false);
    } catch (err) {
      console.error('Error rendering git graph:', err);
      setError(err instanceof Error ? err.message : 'Failed to render graph');
      setIsLoading(false);
    }
  }, [commits, branches, currentHead, onCommitClick, enableAnimations]);

  const renderGraph = (
    gitgraph: any,
    commits: Commit[],
    branches: Branch[],
    currentHead: string,
    onCommitClick?: (commitHash: string) => void
  ) => {
    // Build a map of commits by hash for quick lookup
    const commitMap = new Map(commits.map((c) => [c.hash, c]));

    // Build a map of branches by name
    const branchMap = new Map<string, any>();

    // Sort commits by timestamp (oldest first)
    const sortedCommits = [...commits].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Track which commits have been rendered
    const renderedCommits = new Set<string>();

    // Helper function to get or create a branch
    const getOrCreateBranch = (branchName: string, color?: string) => {
      if (!branchMap.has(branchName)) {
        const branch = gitgraph.branch({
          name: branchName,
          style: color ? { color } : undefined,
        });
        branchMap.set(branchName, branch);
      }
      return branchMap.get(branchName);
    };

    // Start with main/master branch
    const mainBranchName = branches.find((b) => b.name === 'main' || b.name === 'master')?.name || 'main';
    getOrCreateBranch(mainBranchName, '#00ff41');

    // Render commits in chronological order
    sortedCommits.forEach((commit) => {
      if (renderedCommits.has(commit.hash)) return;

      // Find which branch this commit belongs to
      const branch = branches.find((b) => {
        // Check if this commit is reachable from this branch
        let currentCommit = commitMap.get(b.commitHash);
        while (currentCommit) {
          if (currentCommit.hash === commit.hash) return true;
          currentCommit = currentCommit.parent ? commitMap.get(currentCommit.parent) : undefined;
        }
        return false;
      });

      const branchName = branch?.name || mainBranchName;
      const gitgraphBranch = getOrCreateBranch(branchName);

      // Render the commit
      gitgraphBranch.commit({
        hash: commit.hash.substring(0, 7),
        subject: commit.message,
        author: commit.author,
        style: {
          dot: {
            color: commit.hash === currentHead || branchName === currentHead ? '#ffd93d' : undefined,
            strokeWidth: commit.hash === currentHead || branchName === currentHead ? 3 : 2,
          },
        },
        onClick: onCommitClick ? () => onCommitClick(commit.hash) : undefined,
      });

      renderedCommits.add(commit.hash);
    });

    // Highlight current HEAD
    const headBranch = branches.find((b) => b.name === currentHead);
    if (headBranch) {
      const gitgraphBranch = branchMap.get(headBranch.name);
      if (gitgraphBranch) {
        // Add a visual indicator for HEAD
        gitgraphBranch.tag({
          name: 'HEAD',
          style: {
            bgColor: '#ffd93d',
            color: '#1a1a2e',
            font: 'bold 10pt "Fira Code", monospace',
          },
        });
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    // Trigger re-render by forcing a state update
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 100);
  };

  return (
    <div className="git-graph-container" role="region" aria-labelledby="git-graph-title">
      <div className="git-graph-header">
        <h3 className="git-graph-title" id="git-graph-title">Repository Graph</h3>
        <div className="git-graph-info" role="status" aria-live="polite">
          <div className="git-graph-info-item">
            <span className="git-graph-info-label">Commits:</span>
            <span className="git-graph-info-value" aria-label={`${commits.length} commits`}>{commits.length}</span>
          </div>
          <div className="git-graph-info-item">
            <span className="git-graph-info-label">Branches:</span>
            <span className="git-graph-info-value" aria-label={`${branches.length} branches`}>{branches.length}</span>
          </div>
          <div className="git-graph-info-item">
            <span className="git-graph-info-label">HEAD:</span>
            <span className="git-graph-info-value" aria-label={`Current HEAD: ${currentHead}`}>{currentHead}</span>
          </div>
        </div>
      </div>

      <div className="git-graph-content">
        {isLoading && (
          <div className="git-graph-loading" role="status" aria-live="polite" aria-label="Loading repository graph">
            Loading graph...
          </div>
        )}

        {error && (
          <div className="git-graph-error" role="alert" aria-live="assertive">
            <div className="git-graph-error-icon" aria-hidden="true">⚠</div>
            <div className="git-graph-error-text">{error}</div>
            <button 
              className="git-graph-error-retry" 
              onClick={handleRetry}
              aria-label="Retry loading graph"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && commits.length === 0 && (
          <div className="git-graph-empty" role="status">
            <div className="git-graph-empty-icon" aria-hidden="true">📊</div>
            <div className="git-graph-empty-text">No commits yet</div>
            <div className="git-graph-empty-hint">
              Create your first commit to see the graph
            </div>
          </div>
        )}

        {!isLoading && !error && commits.length > 0 && (
          <div 
            ref={graphContainerRef} 
            role="img" 
            aria-label={`Git repository graph showing ${commits.length} commits across ${branches.length} branches. Current HEAD is at ${currentHead}`}
          />
        )}
      </div>
    </div>
  );
};
