import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestList } from '../QuestList';
import type { Quest, UserProgress } from '../../../../shared/src/types';
import * as questApi from '../../services/questApi';

// Mock questApi
vi.mock('../../services/questApi');

describe('QuestList', () => {
  const mockQuests: Quest[] = [
    {
      id: 'quest-1',
      chapterId: 'chapter-1',
      title: 'Your First Commit',
      narrative: 'Learn to create your first commit.',
      objective: 'Create a commit with a meaningful message',
      hints: [],
      xpReward: 50,
      order: 1,
      validationCriteria: { type: 'commit_exists', parameters: {} },
    },
    {
      id: 'quest-2',
      chapterId: 'chapter-1',
      title: 'Staging Files',
      narrative: 'Learn to stage files for commit.',
      objective: 'Stage multiple files using git add',
      hints: [],
      xpReward: 75,
      order: 2,
      validationCriteria: { type: 'commit_exists', parameters: {} },
    },
    {
      id: 'quest-3',
      chapterId: 'chapter-1',
      title: 'Viewing History',
      narrative: 'Learn to view commit history.',
      objective: 'Use git log to view commits',
      hints: [],
      xpReward: 100,
      order: 3,
      validationCriteria: { type: 'commit_exists', parameters: {} },
    },
  ];

  const mockUserProgress: UserProgress = {
    userId: 'user-1',
    xp: 125,
    level: 2,
    rank: 'Apprentice Coder',
    currentChapter: 'chapter-1',
    currentQuest: 'quest-3',
    completedQuests: ['quest-1', 'quest-2'],
    isPremium: false,
  };

  const mockOnQuestSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(questApi.questApi, 'getChapterQuests').mockResolvedValue(mockQuests);
  });

  describe('Quest rendering', () => {
    it('should render list of quests', async () => {
      render(<QuestList chapterId="chapter-1" onQuestSelect={mockOnQuestSelect} />);

      await waitFor(() => {
        expect(screen.getByText('Your First Commit')).toBeInTheDocument();
        expect(screen.getByText('Staging Files')).toBeInTheDocument();
        expect(screen.getByText('Viewing History')).toBeInTheDocument();
      });
    });

    it('should display quest objectives', async () => {
      render(<QuestList chapterId="chapter-1" onQuestSelect={mockOnQuestSelect} />);

      await waitFor(() => {
        expect(screen.getByText('Create a commit with a meaningful message')).toBeInTheDocument();
        expect(screen.getByText('Stage multiple files using git add')).toBeInTheDocument();
        expect(screen.getByText('Use git log to view commits')).toBeInTheDocument();
      });
    });

    it('should display XP rewards for each quest', async () => {
      render(<QuestList chapterId="chapter-1" onQuestSelect={mockOnQuestSelect} />);

      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('75')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching quests', () => {
      render(<QuestList chapterId="chapter-1" onQuestSelect={mockOnQuestSelect} />);

      expect(screen.getByText('Loading quests...')).toBeInTheDocument();
    });

    it('should display total chapter XP', async () => {
      render(<QuestList chapterId="chapter-1" onQuestSelect={mockOnQuestSelect} />);

      await waitFor(() => {
        expect(screen.getByText('225 XP')).toBeInTheDocument();
      });
    });
  });

  describe('Quest status indicators', () => {
    it('should show completed status for completed quests', async () => {
      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={mockUserProgress}
          onQuestSelect={mockOnQuestSelect}
        />
      );

      await waitFor(() => {
        const completedStatuses = screen.getAllByText('Completed');
        expect(completedStatuses).toHaveLength(2);
      });
    });

    it('should show checkmark icon for completed quests', async () => {
      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={mockUserProgress}
          onQuestSelect={mockOnQuestSelect}
        />
      );

      await waitFor(() => {
        const checkmarks = screen.getAllByText('✓');
        expect(checkmarks.length).toBeGreaterThan(0);
      });
    });

    it('should show locked status for locked quests', async () => {
      const progressWithOneComplete: UserProgress = {
        ...mockUserProgress,
        completedQuests: ['quest-1'],
      };

      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={progressWithOneComplete}
          onQuestSelect={mockOnQuestSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Locked')).toBeInTheDocument();
      });
    });

    it('should show lock icon for locked quests', async () => {
      const progressWithOneComplete: UserProgress = {
        ...mockUserProgress,
        completedQuests: ['quest-1'],
      };

      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={progressWithOneComplete}
          onQuestSelect={mockOnQuestSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🔒')).toBeInTheDocument();
      });
    });

    it('should show available status for unlocked incomplete quests', async () => {
      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={mockUserProgress}
          onQuestSelect={mockOnQuestSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Available')).toBeInTheDocument();
      });
    });

    it('should display progress counter', async () => {
      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={mockUserProgress}
          onQuestSelect={mockOnQuestSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('2 / 3 completed')).toBeInTheDocument();
      });
    });
  });

  describe('Quest navigation', () => {
    it('should call onQuestSelect when unlocked quest is clicked', async () => {
      const user = userEvent.setup();

      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={mockUserProgress}
          onQuestSelect={mockOnQuestSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Your First Commit')).toBeInTheDocument();
      });

      const questItem = screen.getByText('Your First Commit').closest('.quest-list-item');
      if (questItem) {
        await user.click(questItem);
      }

      expect(mockOnQuestSelect).toHaveBeenCalledWith('quest-1');
    });

    it('should not call onQuestSelect when locked quest is clicked', async () => {
      const user = userEvent.setup();
      const progressWithOneComplete: UserProgress = {
        ...mockUserProgress,
        completedQuests: ['quest-1'],
      };

      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={progressWithOneComplete}
          onQuestSelect={mockOnQuestSelect}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Viewing History')).toBeInTheDocument();
      });

      const lockedQuest = screen.getByText('Viewing History').closest('.quest-list-item');
      if (lockedQuest) {
        await user.click(lockedQuest);
      }

      expect(mockOnQuestSelect).not.toHaveBeenCalled();
    });

    it('should highlight selected quest', async () => {
      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={mockUserProgress}
          onQuestSelect={mockOnQuestSelect}
          selectedQuestId="quest-2"
        />
      );

      await waitFor(() => {
        const selectedQuest = screen.getByText('Staging Files').closest('.quest-list-item');
        expect(selectedQuest).toHaveClass('quest-list-item-selected');
      });
    });

    it('should apply locked styling to locked quests', async () => {
      const progressWithOneComplete: UserProgress = {
        ...mockUserProgress,
        completedQuests: ['quest-1'],
      };

      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={progressWithOneComplete}
          onQuestSelect={mockOnQuestSelect}
        />
      );

      await waitFor(() => {
        const lockedQuest = screen.getByText('Viewing History').closest('.quest-list-item');
        expect(lockedQuest).toHaveClass('quest-list-item-locked');
      });
    });

    it('should apply completed styling to completed quests', async () => {
      render(
        <QuestList
          chapterId="chapter-1"
          userProgress={mockUserProgress}
          onQuestSelect={mockOnQuestSelect}
        />
      );

      await waitFor(() => {
        const completedQuest = screen.getByText('Your First Commit').closest('.quest-list-item');
        expect(completedQuest).toHaveClass('quest-list-item-completed');
      });
    });
  });

  describe('Error handling', () => {
    it('should display error message when API fails', async () => {
      vi.spyOn(questApi.questApi, 'getChapterQuests').mockRejectedValue(
        new Error('Failed to load quests')
      );

      render(<QuestList chapterId="chapter-1" onQuestSelect={mockOnQuestSelect} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load quests')).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      vi.spyOn(questApi.questApi, 'getChapterQuests').mockRejectedValue(
        new Error('Failed to load quests')
      );

      render(<QuestList chapterId="chapter-1" onQuestSelect={mockOnQuestSelect} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('should display empty state when no quests exist', async () => {
      vi.spyOn(questApi.questApi, 'getChapterQuests').mockResolvedValue([]);

      render(<QuestList chapterId="chapter-1" onQuestSelect={mockOnQuestSelect} />);

      await waitFor(() => {
        expect(screen.getByText('No quests available in this chapter')).toBeInTheDocument();
      });
    });
  });
});
