import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestView } from '../QuestView';
import type { Quest } from '../../../../shared/src/types';
import * as questApi from '../../services/questApi';
import * as gitApi from '../../services/gitApi';

// Mock Terminal component
vi.mock('../Terminal', () => ({
  Terminal: ({ repositoryId }: any) => <div data-testid="terminal">Terminal: {repositoryId}</div>,
}));

// Mock Editor component
vi.mock('../Editor', () => ({
  Editor: ({ filePath, content }: any) => (
    <div data-testid="editor">
      Editor: {filePath} - {content}
    </div>
  ),
}));

// Mock GitGraph component
vi.mock('../GitGraph', () => ({
  GitGraph: () => <div data-testid="git-graph">Git Graph</div>,
}));

// Mock APIs
vi.mock('../../services/questApi');
vi.mock('../../services/gitApi');

describe('QuestView', () => {
  const mockQuest: Quest = {
    id: 'quest-1',
    chapterId: 'chapter-1',
    title: 'Your First Commit',
    narrative: 'Learn to create your first commit in the repository.',
    objective: 'Create a commit with a meaningful message',
    hints: ['Use git add to stage files', 'Use git commit -m to create a commit'],
    xpReward: 50,
    order: 1,
    validationCriteria: {
      type: 'commit_exists',
      parameters: {},
    },
    initialRepositoryState: {
      id: 'repo-1',
      workingDirectory: {
        'README.md': { content: '# My Project', modified: false },
      },
      stagingArea: {},
      commits: [],
      branches: [{ name: 'main', commitHash: '' }],
      head: 'main',
      remotes: [],
    },
  };

  const mockRepositoryState = {
    id: 'repo-1',
    workingDirectory: {
      'README.md': { content: '# My Project', modified: false },
    },
    stagingArea: {},
    commits: [
      {
        hash: 'abc123',
        message: 'Initial commit',
        author: 'test-user',
        timestamp: new Date(),
        parent: null,
        tree: {},
      },
    ],
    branches: [{ name: 'main', commitHash: 'abc123' }],
    head: 'main',
    remotes: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(gitApi.gitApi, 'createRepository').mockResolvedValue({
      repositoryId: 'repo-1',
      state: mockRepositoryState,
    });
    vi.spyOn(gitApi.gitApi, 'getRepository').mockResolvedValue({
      state: mockRepositoryState,
    });
  });

  describe('Quest rendering', () => {
    it('should render quest title', async () => {
      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(screen.getByText('Your First Commit')).toBeInTheDocument();
      });
    });

    it('should render quest narrative', async () => {
      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(
          screen.getByText('Learn to create your first commit in the repository.')
        ).toBeInTheDocument();
      });
    });

    it('should render quest objective', async () => {
      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(screen.getByText('Create a commit with a meaningful message')).toBeInTheDocument();
      });
    });

    it('should display XP reward', async () => {
      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(screen.getByText('50 XP')).toBeInTheDocument();
      });
    });

    it('should render terminal component', async () => {
      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(screen.getByTestId('terminal')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(<QuestView quest={mockQuest} />);

      expect(screen.getByText('Initializing quest...')).toBeInTheDocument();
    });
  });

  describe('Quest validation', () => {
    it('should display Check Progress button', async () => {
      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /check progress/i })).toBeInTheDocument();
      });
    });

    it('should call validation API when Check Progress is clicked', async () => {
      const user = userEvent.setup();
      const mockValidationResponse = {
        success: true,
        feedback: 'Great job! You created your first commit.',
        xpAwarded: 50,
      };

      vi.spyOn(questApi.questApi, 'validateQuest').mockResolvedValue(mockValidationResponse);

      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /check progress/i })).toBeInTheDocument();
      });

      const checkButton = screen.getByRole('button', { name: /check progress/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(questApi.questApi.validateQuest).toHaveBeenCalledWith(
          'quest-1',
          mockRepositoryState
        );
      });
    });

    it('should display success message on quest completion', async () => {
      const user = userEvent.setup();
      const mockValidationResponse = {
        success: true,
        feedback: 'Great job! You created your first commit.',
        xpAwarded: 50,
      };

      vi.spyOn(questApi.questApi, 'validateQuest').mockResolvedValue(mockValidationResponse);

      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /check progress/i })).toBeInTheDocument();
      });

      const checkButton = screen.getByRole('button', { name: /check progress/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(screen.getByText('Great job! You created your first commit.')).toBeInTheDocument();
        expect(screen.getByText('+50 XP earned!')).toBeInTheDocument();
      });
    });

    it('should display failure feedback when validation fails', async () => {
      const user = userEvent.setup();
      const mockValidationResponse = {
        success: false,
        feedback: 'No commits found. Try using git commit.',
        xpAwarded: 0,
      };

      vi.spyOn(questApi.questApi, 'validateQuest').mockResolvedValue(mockValidationResponse);

      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /check progress/i })).toBeInTheDocument();
      });

      const checkButton = screen.getByRole('button', { name: /check progress/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(screen.getByText('No commits found. Try using git commit.')).toBeInTheDocument();
      });
    });

    it('should show completed badge when quest is completed', async () => {
      const user = userEvent.setup();
      const mockValidationResponse = {
        success: true,
        feedback: 'Quest completed!',
        xpAwarded: 50,
      };

      vi.spyOn(questApi.questApi, 'validateQuest').mockResolvedValue(mockValidationResponse);

      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /check progress/i })).toBeInTheDocument();
      });

      const checkButton = screen.getByRole('button', { name: /check progress/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(screen.getByText('✓ Completed')).toBeInTheDocument();
      });
    });

    it('should call onComplete callback when quest is completed', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      const mockValidationResponse = {
        success: true,
        feedback: 'Quest completed!',
        xpAwarded: 50,
      };

      vi.spyOn(questApi.questApi, 'validateQuest').mockResolvedValue(mockValidationResponse);

      render(<QuestView quest={mockQuest} onComplete={onComplete} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /check progress/i })).toBeInTheDocument();
      });

      const checkButton = screen.getByRole('button', { name: /check progress/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith('quest-1', 50);
      });
    });
  });

  describe('Quest navigation', () => {
    it('should show Next Quest button after completion', async () => {
      const user = userEvent.setup();
      const mockValidationResponse = {
        success: true,
        feedback: 'Quest completed!',
        xpAwarded: 50,
      };

      vi.spyOn(questApi.questApi, 'validateQuest').mockResolvedValue(mockValidationResponse);

      render(<QuestView quest={mockQuest} onNext={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /check progress/i })).toBeInTheDocument();
      });

      const checkButton = screen.getByRole('button', { name: /check progress/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /next quest/i })).toBeInTheDocument();
      });
    });

    it('should call onNext callback when Next Quest is clicked', async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();
      const mockValidationResponse = {
        success: true,
        feedback: 'Quest completed!',
        xpAwarded: 50,
      };

      vi.spyOn(questApi.questApi, 'validateQuest').mockResolvedValue(mockValidationResponse);

      render(<QuestView quest={mockQuest} onNext={onNext} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /check progress/i })).toBeInTheDocument();
      });

      const checkButton = screen.getByRole('button', { name: /check progress/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /next quest/i })).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next quest/i });
      await user.click(nextButton);

      expect(onNext).toHaveBeenCalled();
    });

    it('should not show Next Quest button if onNext is not provided', async () => {
      const user = userEvent.setup();
      const mockValidationResponse = {
        success: true,
        feedback: 'Quest completed!',
        xpAwarded: 50,
      };

      vi.spyOn(questApi.questApi, 'validateQuest').mockResolvedValue(mockValidationResponse);

      render(<QuestView quest={mockQuest} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /check progress/i })).toBeInTheDocument();
      });

      const checkButton = screen.getByRole('button', { name: /check progress/i });
      await user.click(checkButton);

      await waitFor(() => {
        expect(screen.getByText('Quest completed!')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /next quest/i })).not.toBeInTheDocument();
    });
  });
});
