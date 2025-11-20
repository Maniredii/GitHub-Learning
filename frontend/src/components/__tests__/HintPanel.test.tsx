import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HintPanel } from '../HintPanel';
import * as hintApi from '../../services/hintApi';

vi.mock('../../services/hintApi');

describe('HintPanel', () => {
  const mockQuestId = 'quest-123';
  const mockQuestXpReward = 100;
  const mockTotalHints = 3;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Hint Tracking', () => {
    it('should load hint tracking on mount', async () => {
      const mockTracking = {
        incorrect_attempts: 0,
        hints_shown: 0,
        shown_hint_indices: [],
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
        />
      );

      await waitFor(() => {
        expect(hintApi.getHintTracking).toHaveBeenCalledWith(mockQuestId);
      });
    });

    it('should display hints used count', async () => {
      const mockTracking = {
        incorrect_attempts: 2,
        hints_shown: 1,
        shown_hint_indices: [0],
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
      });
    });
  });

  describe('Show Hint Button', () => {
    it('should show hint when button clicked', async () => {
      const user = userEvent.setup();
      const mockTracking = {
        incorrect_attempts: 0,
        hints_shown: 0,
        shown_hint_indices: [],
      };
      const mockHintResponse = {
        hint: 'This is a helpful hint',
        hintIndex: 0,
        totalHints: 3,
        hintsShown: 1,
        adjustedXp: 95,
        xpPenalty: 5,
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);
      vi.spyOn(hintApi, 'getNextHint').mockResolvedValue(mockHintResponse);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
        />
      );

      const showHintButton = await screen.findByText('Show Hint');
      await user.click(showHintButton);

      await waitFor(() => {
        expect(screen.getByText('This is a helpful hint')).toBeInTheDocument();
      });
    });

    it('should call onHintShown callback with penalty', async () => {
      const user = userEvent.setup();
      const mockOnHintShown = vi.fn();
      const mockTracking = {
        incorrect_attempts: 0,
        hints_shown: 0,
        shown_hint_indices: [],
      };
      const mockHintResponse = {
        hint: 'Hint text',
        hintIndex: 0,
        totalHints: 3,
        hintsShown: 1,
        adjustedXp: 95,
        xpPenalty: 5,
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);
      vi.spyOn(hintApi, 'getNextHint').mockResolvedValue(mockHintResponse);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
          onHintShown={mockOnHintShown}
        />
      );

      const showHintButton = await screen.findByText('Show Hint');
      await user.click(showHintButton);

      await waitFor(() => {
        expect(mockOnHintShown).toHaveBeenCalledWith(1, 5);
      });
    });

    it('should disable button when no hints left', async () => {
      const mockTracking = {
        incorrect_attempts: 5,
        hints_shown: 3,
        shown_hint_indices: [0, 1, 2],
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
        />
      );

      await waitFor(() => {
        const button = screen.getByText('No Hints Left');
        expect(button).toBeDisabled();
      });
    });
  });

  describe('XP Penalty Display', () => {
    it('should show XP penalty when hints used', async () => {
      const mockTracking = {
        incorrect_attempts: 2,
        hints_shown: 2,
        shown_hint_indices: [0, 1],
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('10%')).toBeInTheDocument();
      });
    });

    it('should not show penalty when no hints used', async () => {
      const mockTracking = {
        incorrect_attempts: 1,
        hints_shown: 0,
        shown_hint_indices: [],
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText(/XP Penalty/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Automatic Hint Offer', () => {
    it('should show hint offer after 3 incorrect attempts', async () => {
      const mockTracking = {
        incorrect_attempts: 3,
        hints_shown: 0,
        shown_hint_indices: [],
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Need a hint?')).toBeInTheDocument();
      });
    });

    it('should not show offer before 3 attempts', async () => {
      const mockTracking = {
        incorrect_attempts: 2,
        hints_shown: 0,
        shown_hint_indices: [],
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Need a hint?')).not.toBeInTheDocument();
      });
    });

    it('should dismiss hint offer when "No Thanks" clicked', async () => {
      const user = userEvent.setup();
      const mockTracking = {
        incorrect_attempts: 3,
        hints_shown: 0,
        shown_hint_indices: [],
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
        />
      );

      const noThanksButton = await screen.findByText('No Thanks');
      await user.click(noThanksButton);

      await waitFor(() => {
        expect(screen.queryByText('Need a hint?')).not.toBeInTheDocument();
      });
    });
  });

  describe('Contextual Hints', () => {
    it('should display contextual hint when error provided', async () => {
      const mockTracking = {
        incorrect_attempts: 1,
        hints_shown: 0,
        shown_hint_indices: [],
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
          lastError="nothing to commit"
          lastCommand="git commit -m 'test'"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Quick Tip/)).toBeInTheDocument();
      });
    });
  });

  describe('Progressive Hints', () => {
    it('should show hint index in display', async () => {
      const user = userEvent.setup();
      const mockTracking = {
        incorrect_attempts: 0,
        hints_shown: 0,
        shown_hint_indices: [],
      };
      const mockHintResponse = {
        hint: 'Second hint',
        hintIndex: 1,
        totalHints: 3,
        hintsShown: 2,
        adjustedXp: 90,
        xpPenalty: 10,
      };

      vi.spyOn(hintApi, 'getHintTracking').mockResolvedValue(mockTracking);
      vi.spyOn(hintApi, 'getNextHint').mockResolvedValue(mockHintResponse);

      render(
        <HintPanel
          questId={mockQuestId}
          questXpReward={mockQuestXpReward}
          totalHints={mockTotalHints}
        />
      );

      const showHintButton = await screen.findByText('Show Hint');
      await user.click(showHintButton);

      await waitFor(() => {
        expect(screen.getByText(/Hint 2 of 3/)).toBeInTheDocument();
      });
    });
  });
});
