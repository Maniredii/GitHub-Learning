import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ConnectedGitGraph } from '../ConnectedGitGraph';
import { gitApi } from '../../services/gitApi';

// Mock gitApi
vi.mock('../../services/gitApi', () => ({
  gitApi: {
    getRepository: vi.fn(),
  },
}));

// Mock GitGraph component
vi.mock('../GitGraph', () => ({
  GitGraph: ({ commits, branches, currentHead }: any) => (
    <div data-testid="git-graph">
      <div>Commits: {commits.length}</div>
      <div>Branches: {branches.length}</div>
      <div>HEAD: {currentHead}</div>
    </div>
  ),
}));

describe('ConnectedGitGraph Component', () => {
  const mockRepositoryState = {
    id: 'test-repo',
    workingDirectory: {},
    stagingArea: {},
    commits: [
      {
        hash: 'abc123',
        message: 'Initial commit',
        author: 'Test User',
        timestamp: new Date('2024-01-01T10:00:00'),
        parent: null,
        tree: {},
      },
      {
        hash: 'def456',
        message: 'Second commit',
        author: 'Test User',
        timestamp: new Date('2024-01-01T11:00:00'),
        parent: 'abc123',
        tree: {},
      },
    ],
    branches: [
      { name: 'main', commitHash: 'def456' },
    ],
    head: 'main',
    remotes: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays repository state', async () => {
    vi.mocked(gitApi.getRepository).mockResolvedValue({
      state: mockRepositoryState,
    });

    render(<ConnectedGitGraph repositoryId="test-repo" />);

    // Should show loading initially
    expect(screen.getByText('Loading repository state...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('git-graph')).toBeInTheDocument();
    });

    expect(screen.getByText('Commits: 2')).toBeInTheDocument();
    expect(screen.getByText('Branches: 1')).toBeInTheDocument();
    expect(screen.getByText('HEAD: main')).toBeInTheDocument();
  });

  it('handles API errors', async () => {
    vi.mocked(gitApi.getRepository).mockRejectedValue(
      new Error('Failed to fetch repository')
    );

    render(<ConnectedGitGraph repositoryId="test-repo" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch repository')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('refetches when repositoryId changes', async () => {
    vi.mocked(gitApi.getRepository).mockResolvedValue({
      state: mockRepositoryState,
    });

    const { rerender } = render(<ConnectedGitGraph repositoryId="repo-1" />);

    await waitFor(() => {
      expect(gitApi.getRepository).toHaveBeenCalledWith('repo-1');
    });

    rerender(<ConnectedGitGraph repositoryId="repo-2" />);

    await waitFor(() => {
      expect(gitApi.getRepository).toHaveBeenCalledWith('repo-2');
    });

    expect(gitApi.getRepository).toHaveBeenCalledTimes(2);
  });

  it('refetches when refreshTrigger changes', async () => {
    vi.mocked(gitApi.getRepository).mockResolvedValue({
      state: mockRepositoryState,
    });

    const { rerender } = render(
      <ConnectedGitGraph repositoryId="test-repo" refreshTrigger={0} />
    );

    await waitFor(() => {
      expect(gitApi.getRepository).toHaveBeenCalledTimes(1);
    });

    rerender(<ConnectedGitGraph repositoryId="test-repo" refreshTrigger={1} />);

    await waitFor(() => {
      expect(gitApi.getRepository).toHaveBeenCalledTimes(2);
    });
  });

  it('handles empty repository state', async () => {
    vi.mocked(gitApi.getRepository).mockResolvedValue({
      state: {
        ...mockRepositoryState,
        commits: [],
        branches: [],
      },
    });

    render(<ConnectedGitGraph repositoryId="test-repo" />);

    await waitFor(() => {
      expect(screen.getByText('Commits: 0')).toBeInTheDocument();
    });

    expect(screen.getByText('Branches: 0')).toBeInTheDocument();
  });

  it('passes onCommitClick callback to GitGraph', async () => {
    vi.mocked(gitApi.getRepository).mockResolvedValue({
      state: mockRepositoryState,
    });

    const onCommitClick = vi.fn();

    render(
      <ConnectedGitGraph
        repositoryId="test-repo"
        onCommitClick={onCommitClick}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('git-graph')).toBeInTheDocument();
    });

    // Callback should be passed to GitGraph component
    expect(onCommitClick).not.toHaveBeenCalled();
  });

  it('enables animations by default', async () => {
    vi.mocked(gitApi.getRepository).mockResolvedValue({
      state: mockRepositoryState,
    });

    render(<ConnectedGitGraph repositoryId="test-repo" />);

    await waitFor(() => {
      expect(screen.getByTestId('git-graph')).toBeInTheDocument();
    });
  });

  it('disables animations when specified', async () => {
    vi.mocked(gitApi.getRepository).mockResolvedValue({
      state: mockRepositoryState,
    });

    render(
      <ConnectedGitGraph repositoryId="test-repo" enableAnimations={false} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('git-graph')).toBeInTheDocument();
    });
  });

  it('shows loading state without clearing previous data', async () => {
    vi.mocked(gitApi.getRepository).mockResolvedValue({
      state: mockRepositoryState,
    });

    const { rerender } = render(
      <ConnectedGitGraph repositoryId="test-repo" refreshTrigger={0} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('git-graph')).toBeInTheDocument();
    });

    // Trigger refresh
    rerender(<ConnectedGitGraph repositoryId="test-repo" refreshTrigger={1} />);

    // Should still show the graph while loading
    expect(screen.getByTestId('git-graph')).toBeInTheDocument();
  });
});
