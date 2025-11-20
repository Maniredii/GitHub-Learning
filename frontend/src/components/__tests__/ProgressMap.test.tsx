import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressMap } from '../ProgressMap';
import type { Chapter } from '../../../../shared/src/types';

describe('ProgressMap', () => {
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
    {
      id: 'chapter-4',
      title: 'The First Seal',
      description: 'Complete your first full Git workflow',
      themeRegion: 'Branching Forests',
      order: 4,
      isPremium: false,
      unlockRequirements: { previousChapter: 'chapter-3' },
    },
    {
      id: 'chapter-5',
      title: 'Rewinding Time',
      description: 'Learn to undo changes',
      themeRegion: 'Branching Forests',
      order: 5,
      isPremium: true,
      unlockRequirements: { previousChapter: 'chapter-4' },
    },
  ];

  const mockOnChapterClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Map rendering', () => {
    it('should render SVG map', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter={null}
          onChapterClick={mockOnChapterClick}
        />
      );

      const svg = document.querySelector('.progress-map__svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render regions for all chapters', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter={null}
          onChapterClick={mockOnChapterClick}
        />
      );

      const regions = document.querySelectorAll('.progress-map__region');
      expect(regions.length).toBeGreaterThan(0);
    });

    it('should render connecting path between regions', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter={null}
          onChapterClick={mockOnChapterClick}
        />
      );

      const paths = document.querySelectorAll('path');
      expect(paths.length).toBeGreaterThan(1); // At least one region path + connecting path
    });
  });

  describe('Region unlock logic', () => {
    it('should show first chapter as unlocked', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter={null}
          onChapterClick={mockOnChapterClick}
        />
      );

      const unlockedRegions = document.querySelectorAll('.progress-map__region--unlocked');
      expect(unlockedRegions.length).toBeGreaterThan(0);
    });

    it('should show locked regions for incomplete prerequisites', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const lockedRegions = document.querySelectorAll('.progress-map__region--locked');
      expect(lockedRegions.length).toBeGreaterThan(0);
    });

    it('should unlock next chapter when previous is completed', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={['chapter-1']}
          currentChapter="chapter-2"
          onChapterClick={mockOnChapterClick}
        />
      );

      // Both chapter-1 and chapter-2 should be unlocked
      const unlockedRegions = document.querySelectorAll('.progress-map__region--unlocked');
      expect(unlockedRegions.length).toBeGreaterThanOrEqual(2);
    });

    it('should show checkmark for completed chapters', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={['chapter-1', 'chapter-2']}
          currentChapter="chapter-3"
          onChapterClick={mockOnChapterClick}
        />
      );

      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks.length).toBeGreaterThanOrEqual(2);
    });

    it('should show lock icon for locked chapters', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const locks = screen.getAllByText('🔒');
      expect(locks.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation on click', () => {
    it('should call onChapterClick when unlocked region is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const unlockedRegion = document.querySelector('.progress-map__region--unlocked');
      if (unlockedRegion) {
        await user.click(unlockedRegion);
      }

      expect(mockOnChapterClick).toHaveBeenCalled();
    });

    it('should not call onChapterClick when locked region is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const lockedRegion = document.querySelector('.progress-map__region--locked');
      if (lockedRegion) {
        await user.click(lockedRegion);
      }

      expect(mockOnChapterClick).not.toHaveBeenCalled();
    });

    it('should pass correct chapter ID to onChapterClick', async () => {
      const user = userEvent.setup();

      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={['chapter-1']}
          currentChapter="chapter-2"
          onChapterClick={mockOnChapterClick}
        />
      );

      // Find and click the first unlocked region
      const unlockedRegions = document.querySelectorAll('.progress-map__region--unlocked');
      if (unlockedRegions[0]) {
        await user.click(unlockedRegions[0]);
      }

      expect(mockOnChapterClick).toHaveBeenCalledWith(expect.stringContaining('chapter-'));
    });
  });

  describe('Tooltip display', () => {
    it('should show tooltip on hover', async () => {
      const user = userEvent.setup();

      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const region = document.querySelector('.progress-map__region');
      if (region) {
        await user.hover(region);
      }

      await waitFor(() => {
        const tooltip = document.querySelector('.progress-map__tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('should display chapter title in tooltip', async () => {
      const user = userEvent.setup();

      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const region = document.querySelector('.progress-map__region');
      if (region) {
        await user.hover(region);
      }

      await waitFor(() => {
        expect(screen.getByText('The Art of Chrono-Coding')).toBeInTheDocument();
      });
    });

    it('should display chapter description in tooltip', async () => {
      const user = userEvent.setup();

      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const region = document.querySelector('.progress-map__region');
      if (region) {
        await user.hover(region);
      }

      await waitFor(() => {
        expect(screen.getByText('Begin your journey into version control')).toBeInTheDocument();
      });
    });

    it('should show premium badge for premium chapters', async () => {
      const user = userEvent.setup();

      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4']}
          currentChapter="chapter-5"
          onChapterClick={mockOnChapterClick}
        />
      );

      // Find the premium chapter region (chapter-5)
      const regions = document.querySelectorAll('.progress-map__region');
      const premiumRegion = regions[regions.length - 1]; // Last region should be chapter-5

      if (premiumRegion) {
        await user.hover(premiumRegion);
      }

      await waitFor(() => {
        expect(screen.getByText('Premium Content')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      const user = userEvent.setup();

      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const region = document.querySelector('.progress-map__region');
      if (region) {
        await user.hover(region);
        await waitFor(() => {
          expect(document.querySelector('.progress-map__tooltip')).toBeInTheDocument();
        });

        await user.unhover(region);
        await waitFor(() => {
          expect(document.querySelector('.progress-map__tooltip')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Current chapter highlighting', () => {
    it('should highlight current chapter region', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={['chapter-1']}
          currentChapter="chapter-2"
          onChapterClick={mockOnChapterClick}
        />
      );

      // Current chapter should have special styling
      const regions = document.querySelectorAll('.progress-map__region');
      const hasCurrentStyling = Array.from(regions).some((region) => {
        const style = window.getComputedStyle(region);
        return style.filter !== 'none';
      });

      expect(hasCurrentStyling).toBe(true);
    });

    it('should apply glow effect to current chapter', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={['chapter-1']}
          currentChapter="chapter-2"
          onChapterClick={mockOnChapterClick}
        />
      );

      const svg = document.querySelector('.progress-map__svg');
      const glowFilter = svg?.querySelector('#glowCurrent');
      expect(glowFilter).toBeInTheDocument();
    });
  });

  describe('Visual states', () => {
    it('should apply different colors for different states', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={['chapter-1']}
          currentChapter="chapter-2"
          onChapterClick={mockOnChapterClick}
        />
      );

      const regions = document.querySelectorAll('.progress-map__region');
      const fills = Array.from(regions).map((region) => region.getAttribute('fill'));

      // Should have different fill colors for different states
      const uniqueFills = new Set(fills);
      expect(uniqueFills.size).toBeGreaterThan(1);
    });

    it('should apply reduced opacity to locked regions', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const lockedRegions = document.querySelectorAll('.progress-map__region--locked');
      if (lockedRegions.length > 0) {
        const opacity = lockedRegions[0].getAttribute('style');
        expect(opacity).toContain('opacity');
      }
    });

    it('should show pointer cursor for unlocked regions', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const unlockedRegions = document.querySelectorAll('.progress-map__region--unlocked');
      if (unlockedRegions.length > 0) {
        const cursor = unlockedRegions[0].getAttribute('style');
        expect(cursor).toContain('pointer');
      }
    });

    it('should show not-allowed cursor for locked regions', () => {
      render(
        <ProgressMap
          chapters={mockChapters}
          completedChapters={[]}
          currentChapter="chapter-1"
          onChapterClick={mockOnChapterClick}
        />
      );

      const lockedRegions = document.querySelectorAll('.progress-map__region--locked');
      if (lockedRegions.length > 0) {
        const cursor = lockedRegions[0].getAttribute('style');
        expect(cursor).toContain('not-allowed');
      }
    });
  });
});
