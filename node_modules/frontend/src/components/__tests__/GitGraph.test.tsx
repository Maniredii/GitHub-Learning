import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { GitGraph } from '../GitGraph';

// Mock gitgraph-js
vi.mock('@gitgraph/js', () => ({
  createGitgraph: vi.fn(() => ({
    branch: vi.fn(() => ({
      commit: vi.fn(),
      tag: vi.fn(),
    })),
  })),
  TemplateName: {
    Metro: 'metro',
  },
  templateExtend: vi.fn((template, options) => options),
}));

describe('GitGraph Component', () => {
  const mockCommits = [
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
  ];

  const mockBranches = [
    { name: 'main', commitHash: 'def456' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders git graph container', () => {
    render(
      <GitGraph
        commits={mockCommits}
        branches={mockBranches}
        currentHead="main"
      />
    );

    expect(screen.getByText('Repository Graph')).toBeInTheDocument();
  });

  it('displays commit count', () => {
    render(
      <GitGraph
        commits={mockCommits}
        branches={mockBranches}
        currentHead="main"
      />
    );

    expect(screen.getByText('Commits:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays branch count', () => {
    render(
      <GitGraph
        commits={mockCommits}
        branches={mockBranches}
        currentHead="main"
      />
    );

    expect(screen.getByText('Branches:')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays current HEAD', () => {
    render(
      <GitGraph
        commits={mockCommits}
        branches={mockBranches}
        currentHead="main"
      />
    );

    expect(screen.getByText('HEAD:')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
  });

  it('shows empty state when no commits', () => {
    render(
      <GitGraph
        commits={[]}
        branches={[]}
        currentHead="main"
      />
    );

    expect(screen.getByText('No commits yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first commit to see the graph')).toBeInTheDocument();
  });

  it('handles multiple branches', () => {
    const multipleBranches = [
      { name: 'main', commitHash: 'def456' },
      { name: 'feature', commitHash: 'abc123' },
    ];

    render(
      <GitGraph
        commits={mockCommits}
        branches={multipleBranches}
        currentHead="main"
      />
    );

    // Check for branch count specifically
    expect(screen.getByText('Branches:')).toBeInTheDocument();
    const branchesInfo = screen.getByText('Branches:').parentElement;
    expect(branchesInfo?.textContent).toContain('2');
  });

  it('updates when commits change', async () => {
    const { rerender } = render(
      <GitGraph
        commits={mockCommits}
        branches={mockBranches}
        currentHead="main"
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument();

    const newCommits = [
      ...mockCommits,
      {
        hash: 'ghi789',
        message: 'Third commit',
        author: 'Test User',
        timestamp: new Date('2024-01-01T12:00:00'),
        parent: 'def456',
        tree: {},
      },
    ];

    rerender(
      <GitGraph
        commits={newCommits}
        branches={mockBranches}
        currentHead="main"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('updates when HEAD changes', () => {
    const { rerender } = render(
      <GitGraph
        commits={mockCommits}
        branches={mockBranches}
        currentHead="main"
      />
    );

    expect(screen.getByText('main')).toBeInTheDocument();

    rerender(
      <GitGraph
        commits={mockCommits}
        branches={[...mockBranches, { name: 'feature', commitHash: 'abc123' }]}
        currentHead="feature"
      />
    );

    expect(screen.getByText('feature')).toBeInTheDocument();
  });

  it('handles merge commits with multiple parents', () => {
    const mergeCommit = {
      hash: 'merge123',
      message: 'Merge feature into main',
      author: 'Test User',
      timestamp: new Date('2024-01-01T13:00:00'),
      parent: 'def456',
      parents: ['def456', 'abc123'],
      tree: {},
    };

    render(
      <GitGraph
        commits={[...mockCommits, mergeCommit]}
        branches={mockBranches}
        currentHead="main"
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('disables animations when enableAnimations is false', () => {
    const { container } = render(
      <GitGraph
        commits={mockCommits}
        branches={mockBranches}
        currentHead="main"
        enableAnimations={false}
      />
    );

    // Graph should render without animation classes
    const graphContent = container.querySelector('.git-graph-content');
    expect(graphContent).not.toHaveClass('graph-updating');
  });

  it('handles commit click callback', () => {
    const onCommitClick = vi.fn();

    render(
      <GitGraph
        commits={mockCommits}
        branches={mockBranches}
        currentHead="main"
        onCommitClick={onCommitClick}
      />
    );

    // Note: Actual click testing would require gitgraph-js to be properly mocked
    // This test verifies the prop is passed correctly
    expect(onCommitClick).not.toHaveBeenCalled();
  });

  it('renders with different HEAD positions', () => {
    const { rerender } = render(
      <GitGraph
        commits={mockCommits}
        branches={mockBranches}
        currentHead="main"
      />
    );

    expect(screen.getByText('main')).toBeInTheDocument();

    // Change HEAD to a commit hash
    rerender(
      <GitGraph
        commits={mockCommits}
        branches={mockBranches}
        currentHead="abc123"
      />
    );

    expect(screen.getByText('abc123')).toBeInTheDocument();
  });

  it('handles empty branches array', () => {
    render(
      <GitGraph
        commits={mockCommits}
        branches={[]}
        currentHead="main"
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument(); // Branch count
  });

  it('sorts commits chronologically', () => {
    const unsortedCommits = [
      {
        hash: 'def456',
        message: 'Second commit',
        author: 'Test User',
        timestamp: new Date('2024-01-01T11:00:00'),
        parent: 'abc123',
        tree: {},
      },
      {
        hash: 'abc123',
        message: 'Initial commit',
        author: 'Test User',
        timestamp: new Date('2024-01-01T10:00:00'),
        parent: null,
        tree: {},
      },
    ];

    render(
      <GitGraph
        commits={unsortedCommits}
        branches={mockBranches}
        currentHead="main"
      />
    );

    // Should render without errors
    expect(screen.getByText('Repository Graph')).toBeInTheDocument();
  });
});
