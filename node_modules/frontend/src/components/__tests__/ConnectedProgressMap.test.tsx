import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectedProgressMap } from '../ConnectedProgressMap';
import type { Chapter } from '../../../../shared/src/types';
import * as questApi from '../../services/questApi';
import * as progressApi from '../../services/progressApi';

// Mock APIs
vi.mock('../../services/questApi');
vi.mock('../../services/progressApi');

describe('ConnectedProgressMap', () => {
  const mockChapters: Chapter[] = [
    {
      id: 'chapter-1',
      title: 'The Art of Chrono-Coding',
      description: 'Begin your journey into version control',
      themeRegion: 'Caves of Commitment',
      order: 1,
      isPremium: false,
      unlockRequirements: {},
    },
    {
      id: 'chapter-2',
      title: 'Forging Your Tools',
      description: 'Learn to configure Git',
      themeRegion: 'Workshop of Time',
      order: 2,
      isPremium: false,
      unlockRequirements: { previousChapter: 'chapter-1' },
    },
    {
      id: 'chapter-3',
      title: 'The Three States',
      description: 'Master the working directory, staging area, and repository',
      themeRegion: 'Caves of Commitment',
      order: 3,
      isPremium: false,
      unlockRequirements: { previousChapter: 'chapter-2' },
    },
  ];

  const mockProgress = {
    xp: 150,
    level: 2,
    rank: 'Apprentice Coder',
    currentChapter: 'chapter-2',
    currentQuest: 'quest-2-1',
    completedQuests: ['chapter-1-quest-1', 'chapter-1-quest-2'],
    xpToNextLevel: 100,
    totalQuestsCompleted: 2,
  };

  const mockOnChapterClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data fetching', () => {
    it('should fetch chapters and user progress on mount', async () => {
      vi.mocked(questApi.questApi.getAllChapters).mockResolvedValue(mockChapters);
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(mockProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        expect(questApi.questApi.getAllChapters).toHaveBeenCalled();
        expect(progressApi.progressApi.getUserProgress).toHaveBeenCalled();
      });
    });

    it('should display loading state while fetching data', () => {
      vi.mocked(questApi.questApi.getAllChapters).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      vi.mocked(progressApi.progressApi.getUserProgress).mockImplementation(
        () => new Promise(() => {})
      );

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      expect(screen.getByText('Loading your journey...')).toBeInTheDocument();
    });

    it('should render ProgressMap after data is loaded', async () => {
      vi.mocked(questApi.questApi.getAllChapters).mockResolvedValue(mockChapters);
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(mockProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        const svg = document.querySelector('.progress-map__svg');
        expect(svg).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should display error message when API call fails', async () => {
      const errorMessage = 'Failed to fetch chapters';
      vi.mocked(questApi.questApi.getAllChapters).mockRejectedValue(new Error(errorMessage));
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(mockProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display retry button on error', async () => {
      vi.mocked(questApi.questApi.getAllChapters).mockRejectedValue(new Error('Network error'));
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(mockProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('should retry fetching data when retry button is clicked', async () => {
      const user = userEvent.setup();

      // First call fails
      vi.mocked(questApi.questApi.getAllChapters).mockRejectedValueOnce(new Error('Network error'));
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(mockProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      // Second call succeeds
      vi.mocked(questApi.questApi.getAllChapters).mockResolvedValue(mockChapters);

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      await waitFor(() => {
        const svg = document.querySelector('.progress-map__svg');
        expect(svg).toBeInTheDocument();
      });
    });
  });

  describe('Progress integration', () => {
    it('should pass completed chapters to ProgressMap', async () => {
      vi.mocked(questApi.questApi.getAllChapters).mockResolvedValue(mockChapters);
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(mockProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        const svg = document.querySelector('.progress-map__svg');
        expect(svg).toBeInTheDocument();
      });

      // Chapter 1 should be marked as completed (has completed quests)
      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks.length).toBeGreaterThan(0);
    });

    it('should pass current chapter to ProgressMap', async () => {
      vi.mocked(questApi.questApi.getAllChapters).mockResolvedValue(mockChapters);
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(mockProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        const svg = document.querySelector('.progress-map__svg');
        expect(svg).toBeInTheDocument();
      });

      // Current chapter should have glow effect
      const glowFilter = document.querySelector('#glowCurrent');
      expect(glowFilter).toBeInTheDocument();
    });

    it('should determine completed chapters based on quest completions', async () => {
      const progressWithMultipleCompletions = {
        ...mockProgress,
        completedQuests: ['chapter-1-quest-1', 'chapter-1-quest-2', 'chapter-2-quest-1'],
        totalQuestsCompleted: 3,
      };

      vi.mocked(questApi.questApi.getAllChapters).mockResolvedValue(mockChapters);
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(
        progressWithMultipleCompletions
      );

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        const checkmarks = screen.getAllByText('✓');
        // Should have checkmarks for both chapter-1 and chapter-2
        expect(checkmarks.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Navigation', () => {
    it('should call onChapterClick when region is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(questApi.questApi.getAllChapters).mockResolvedValue(mockChapters);
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(mockProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        const svg = document.querySelector('.progress-map__svg');
        expect(svg).toBeInTheDocument();
      });

      const unlockedRegion = document.querySelector('.progress-map__region--unlocked');
      if (unlockedRegion) {
        await user.click(unlockedRegion);
      }

      expect(mockOnChapterClick).toHaveBeenCalled();
    });

    it('should pass correct chapter ID to onChapterClick', async () => {
      const user = userEvent.setup();

      vi.mocked(questApi.questApi.getAllChapters).mockResolvedValue(mockChapters);
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(mockProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        const svg = document.querySelector('.progress-map__svg');
        expect(svg).toBeInTheDocument();
      });

      const unlockedRegions = document.querySelectorAll('.progress-map__region--unlocked');
      if (unlockedRegions[0]) {
        await user.click(unlockedRegions[0]);
      }

      expect(mockOnChapterClick).toHaveBeenCalledWith(expect.stringContaining('chapter-'));
    });
  });

  describe('Empty state', () => {
    it('should handle empty chapters array', async () => {
      vi.mocked(questApi.questApi.getAllChapters).mockResolvedValue([]);
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(mockProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        const svg = document.querySelector('.progress-map__svg');
        expect(svg).toBeInTheDocument();
      });

      // Should render without errors - map still shows all regions even with empty chapters
      const regions = document.querySelectorAll('.progress-map__region');
      expect(regions.length).toBeGreaterThan(0);
    });

    it('should handle new user with no progress', async () => {
      const newUserProgress = {
        ...mockProgress,
        currentChapter: 'chapter-1',
        completedQuests: [],
        totalQuestsCompleted: 0,
      };

      vi.mocked(questApi.questApi.getAllChapters).mockResolvedValue(mockChapters);
      vi.mocked(progressApi.progressApi.getUserProgress).mockResolvedValue(newUserProgress);

      render(<ConnectedProgressMap onChapterClick={mockOnChapterClick} />);

      await waitFor(() => {
        const svg = document.querySelector('.progress-map__svg');
        expect(svg).toBeInTheDocument();
      });

      // Only first chapter should be unlocked
      const unlockedRegions = document.querySelectorAll('.progress-map__region--unlocked');
      expect(unlockedRegions.length).toBeGreaterThan(0);

      // No completed chapters
      const checkmarks = screen.queryAllByText('✓');
      expect(checkmarks.length).toBe(0);
    });
  });
});
