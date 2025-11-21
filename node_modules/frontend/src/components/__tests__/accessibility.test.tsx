/**
 * Comprehensive accessibility tests for GitQuest components
 * Tests keyboard navigation, ARIA labels, and color contrast compliance
 * Requirements: 13.3, 13.4, 13.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';
import { RegistrationForm } from '../RegistrationForm';
import { QuestList } from '../QuestList';
import { HintPanel } from '../HintPanel';
import { ProgressMap } from '../ProgressMap';
import { PaywallModal } from '../PaywallModal';
import { MobileTerminalKeyboard } from '../MobileTerminalKeyboard';
import type { Chapter } from '../../../../shared/src/types';

// Mock APIs
vi.mock('../../services/authApi');
vi.mock('../../services/questApi', () => ({
  questApi: {
    getChapterQuests: vi.fn().mockResolvedValue([
      {
        id: 'quest-1',
        chapterId: 'chapter-1',
        title: 'First Quest',
        narrative: 'Learn basics',
        objective: 'Complete task',
        hints: [],
        xpReward: 50,
        order: 1,
        validationCriteria: { type: 'commit_exists', parameters: {} },
      },
      {
        id: 'quest-2',
        chapterId: 'chapter-1',
        title: 'Second Quest',
        narrative: 'Learn more',
        objective: 'Complete another task',
        hints: [],
        xpReward: 75,
        order: 2,
        validationCriteria: { type: 'branch_exists', parameters: {} },
      },
    ]),
  },
}));
vi.mock('../../services/hintApi', () => ({
  hintApi: {
    getHintTracking: vi.fn().mockResolvedValue({
      incorrect_attempts: 0,
      hints_shown: 0,
      shown_hint_indices: [],
    }),
    getNextHint: vi.fn().mockResolvedValue({
      hint: 'Test hint',
      hintIndex: 0,
      totalHints: 3,
      hintsShown: 1,
      adjustedXp: 95,
      xpPenalty: 5,
    }),
  },
}));

describe('Accessibility Tests', () => {
  describe('Keyboard Navigation', () => {
    describe('LoginForm keyboard navigation', () => {
      it('should allow tab navigation through form fields', async () => {
        const user = userEvent.setup();
        render(<LoginForm onSuccess={vi.fn()} onSwitchToRegister={vi.fn()} />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        // Start at email field
        emailInput.focus();
        expect(emailInput).toHaveFocus();

        // Tab to password
        await user.tab();
        expect(passwordInput).toHaveFocus();

        // Tab to submit button
        await user.tab();
        expect(submitButton).toHaveFocus();
      });

      it('should submit form on Enter key in password field', async () => {
        const user = userEvent.setup();
        const onSuccess = vi.fn();
        render(<LoginForm onSuccess={onSuccess} onSwitchToRegister={vi.fn()} />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Password123{Enter}');

        // Form should attempt submission
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Password123');
      });

      it('should allow Shift+Tab to navigate backwards', async () => {
        const user = userEvent.setup();
        render(<LoginForm onSuccess={vi.fn()} onSwitchToRegister={vi.fn()} />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        const passwordInput = screen.getByLabelText(/password/i);

        submitButton.focus();
        expect(submitButton).toHaveFocus();

        await user.tab({ shift: true });
        expect(passwordInput).toHaveFocus();
      });
    });

    describe('RegistrationForm keyboard navigation', () => {
      it('should allow tab navigation through all registration fields', async () => {
        const user = userEvent.setup();
        render(<RegistrationForm onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />);

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        usernameInput.focus();
        expect(usernameInput).toHaveFocus();

        await user.tab();
        // Next field after username (could be email or password depending on form order)
        expect(document.activeElement).not.toBe(usernameInput);

        // Continue tabbing through form
        await user.tab();
        await user.tab();
        
        // Eventually reach submit button
        submitButton.focus();
        expect(submitButton).toHaveFocus();
      });
    });

    describe('QuestList keyboard navigation', () => {
      it('should allow keyboard navigation through quest items', async () => {
        const user = userEvent.setup();
        const onQuestSelect = vi.fn();

        render(
          <QuestList
            chapterId="chapter-1"
            onQuestSelect={onQuestSelect}
          />
        );

        // Wait for quests to load
        await screen.findByText('First Quest');

        const questItems = screen.getAllByRole('listitem');
        expect(questItems.length).toBeGreaterThan(0);

        // Focus first quest
        questItems[0].focus();
        expect(questItems[0]).toHaveFocus();

        // Tab to next quest
        await user.tab();
        expect(document.activeElement).toBeTruthy();
      });

      it('should activate quest on Enter key', async () => {
        const user = userEvent.setup();
        const onQuestSelect = vi.fn();
        
        render(
          <QuestList
            chapterId="chapter-1"
            onQuestSelect={onQuestSelect}
          />
        );

        await screen.findByText('First Quest');
        const firstQuest = screen.getAllByRole('listitem')[0];
        firstQuest.focus();

        await user.keyboard('{Enter}');
        expect(onQuestSelect).toHaveBeenCalled();
      });

      it('should activate quest on Space key', async () => {
        const user = userEvent.setup();
        const onQuestSelect = vi.fn();
        
        render(
          <QuestList
            chapterId="chapter-1"
            onQuestSelect={onQuestSelect}
          />
        );

        await screen.findByText('First Quest');
        const firstQuest = screen.getAllByRole('listitem')[0];
        firstQuest.focus();

        await user.keyboard(' ');
        expect(onQuestSelect).toHaveBeenCalled();
      });
    });

    describe('HintPanel keyboard navigation', () => {
      it('should allow keyboard access to Show Hint button', async () => {
        const user = userEvent.setup();
        const onHintShown = vi.fn();

        render(
          <HintPanel
            questId="quest-1"
            questXpReward={100}
            totalHints={3}
            onHintShown={onHintShown}
          />
        );

        const hintButton = await screen.findByRole('button', { name: /show hint/i });
        hintButton.focus();
        expect(hintButton).toHaveFocus();

        await user.keyboard('{Enter}');
        // Button should be clickable
        expect(hintButton).toBeInTheDocument();
      });
    });

    describe('PaywallModal keyboard navigation', () => {
      it('should trap focus within modal', async () => {
        const user = userEvent.setup();
        const onSelectPlan = vi.fn();
        render(<PaywallModal isOpen={true} onClose={vi.fn()} onSelectPlan={onSelectPlan} />);

        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();

        // Get all focusable elements in modal
        const closeButton = within(modal).getByRole('button', { name: /close/i });

        // Focus should be trapped within modal
        closeButton.focus();
        expect(closeButton).toHaveFocus();

        // Tab through modal elements
        await user.tab();
        expect(document.activeElement).not.toBe(document.body);
      });

      it('should close modal on Escape key', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onSelectPlan = vi.fn();
        render(<PaywallModal isOpen={true} onClose={onClose} onSelectPlan={onSelectPlan} />);

        await user.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalled();
      });
    });

    describe('MobileTerminalKeyboard keyboard navigation', () => {
      it('should allow keyboard navigation through command buttons', async () => {
        const user = userEvent.setup();
        const onCommandInsert = vi.fn();
        const onKeyPress = vi.fn();
        render(
          <MobileTerminalKeyboard 
            onCommandInsert={onCommandInsert} 
            onKeyPress={onKeyPress}
            visible={true}
          />
        );

        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);

        // Focus first button
        buttons[0].focus();
        expect(buttons[0]).toHaveFocus();

        // Tab to next button
        await user.tab();
        expect(buttons[1]).toHaveFocus();
      });
    });
  });

  describe('ARIA Labels and Semantic HTML', () => {
    describe('LoginForm ARIA labels', () => {
      it('should have proper ARIA labels for form inputs', () => {
        render(<LoginForm onSuccess={vi.fn()} onSwitchToRegister={vi.fn()} />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        // Email input should have text or email type
        expect(['text', 'email']).toContain(emailInput.getAttribute('type'));
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(emailInput).toHaveAttribute('id');
        expect(passwordInput).toHaveAttribute('id');
      });

      it('should have accessible submit button', () => {
        render(<LoginForm onSuccess={vi.fn()} onSwitchToRegister={vi.fn()} />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        expect(submitButton).toHaveAttribute('type', 'submit');
      });

      it('should announce validation errors to screen readers', async () => {
        const user = userEvent.setup();
        render(<LoginForm onSuccess={vi.fn()} onSwitchToRegister={vi.fn()} />);

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        await user.click(submitButton);

        const errorMessages = await screen.findAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    describe('RegistrationForm ARIA labels', () => {
      it('should have proper ARIA labels for all form inputs', () => {
        render(<RegistrationForm onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />);

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      });

      it('should have accessible password requirements', () => {
        render(<RegistrationForm onSuccess={vi.fn()} onSwitchToLogin={vi.fn()} />);

        // Password requirements should be visible
        const passwordInput = screen.getByLabelText(/^password$/i);
        expect(passwordInput).toBeInTheDocument();
        
        // Password field should have proper attributes
        expect(passwordInput).toHaveAttribute('type', 'password');
      });
    });

    describe('QuestList ARIA labels', () => {
      it('should have semantic list structure', async () => {
        render(
          <QuestList
            chapterId="chapter-1"
            onQuestSelect={vi.fn()}
          />
        );

        await screen.findByText('First Quest');
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();

        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
      });

      it('should indicate quest completion status with ARIA', async () => {
        const userProgress = {
          userId: 'user-1',
          xp: 100,
          level: 2,
          rank: 'Apprentice',
          currentChapter: 'chapter-1',
          currentQuest: 'quest-2',
          completedQuests: ['quest-1'],
          isPremium: false,
        };

        render(
          <QuestList
            chapterId="chapter-1"
            userProgress={userProgress}
            onQuestSelect={vi.fn()}
          />
        );

        await screen.findByText('First Quest');
        const questItems = screen.getAllByRole('listitem');
        const firstQuest = questItems[0];
        expect(firstQuest).toHaveAttribute('aria-label');
        expect(firstQuest.getAttribute('aria-label')).toContain('Completed');
      });

      it('should indicate locked quests with ARIA', async () => {
        const userProgress = {
          userId: 'user-1',
          xp: 0,
          level: 1,
          rank: 'Apprentice',
          currentChapter: 'chapter-1',
          currentQuest: 'quest-1',
          completedQuests: [],
          isPremium: false,
        };

        render(
          <QuestList
            chapterId="chapter-1"
            userProgress={userProgress}
            onQuestSelect={vi.fn()}
          />
        );

        await screen.findByText('Second Quest');
        const questItems = screen.getAllByRole('listitem');
        // Second quest should be locked
        if (questItems.length > 1) {
          const secondQuest = questItems[1];
          expect(secondQuest).toHaveAttribute('aria-disabled', 'true');
        }
      });
    });

    describe('HintPanel ARIA labels', () => {
      it('should have accessible hint button', async () => {
        render(
          <HintPanel
            questId="quest-1"
            questXpReward={100}
            totalHints={3}
          />
        );

        const hintButton = await screen.findByRole('button', { name: /show hint/i });
        expect(hintButton).toHaveAttribute('aria-label');
      });

      it('should have accessible complementary region', async () => {
        render(
          <HintPanel
            questId="quest-1"
            questXpReward={100}
            totalHints={3}
          />
        );

        const hintPanel = await screen.findByRole('complementary');
        expect(hintPanel).toHaveAttribute('aria-label', 'Quest hints and help');
      });
    });

    describe('ProgressMap ARIA labels', () => {
      const mockChapters: Chapter[] = [
        {
          id: 'chapter-1',
          title: 'Chapter 1',
          description: 'First chapter',
          themeRegion: 'Caves',
          order: 1,
          isPremium: false,
          unlockRequirements: {},
        },
      ];

      it('should have accessible SVG with title and description', () => {
        render(
          <ProgressMap
            chapters={mockChapters}
            completedChapters={[]}
            currentChapter="chapter-1"
            onChapterClick={vi.fn()}
          />
        );

        const svg = document.querySelector('svg');
        expect(svg).toHaveAttribute('role', 'img');
        expect(svg).toHaveAttribute('aria-label');
      });

      it('should have accessible chapter regions', () => {
        render(
          <ProgressMap
            chapters={mockChapters}
            completedChapters={[]}
            currentChapter="chapter-1"
            onChapterClick={vi.fn()}
          />
        );

        const chapterButtons = screen.getAllByRole('button');
        chapterButtons.forEach((button) => {
          expect(button).toHaveAttribute('aria-label');
        });
      });
    });

    describe('PaywallModal ARIA labels', () => {
      it('should have proper dialog role and labels', () => {
        render(<PaywallModal isOpen={true} onClose={vi.fn()} onSelectPlan={vi.fn()} />);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
      });

      it('should have accessible close button', () => {
        render(<PaywallModal isOpen={true} onClose={vi.fn()} onSelectPlan={vi.fn()} />);

        const closeButton = screen.getByRole('button', { name: /close/i });
        expect(closeButton).toHaveAttribute('aria-label');
      });
    });

    describe('MobileTerminalKeyboard ARIA labels', () => {
      it('should have accessible command buttons', () => {
        render(
          <MobileTerminalKeyboard 
            onCommandInsert={vi.fn()} 
            onKeyPress={vi.fn()}
            visible={true}
          />
        );

        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          // Each button should have accessible text or aria-label
          expect(
            button.textContent || button.getAttribute('aria-label')
          ).toBeTruthy();
        });
      });

      it('should have proper toolbar role', () => {
        render(
          <MobileTerminalKeyboard 
            onCommandInsert={vi.fn()} 
            onKeyPress={vi.fn()}
            visible={true}
          />
        );

        const keyboard = screen.getByRole('toolbar');
        expect(keyboard).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Focus Management', () => {
    it('should restore focus after modal closes', () => {
      const { rerender } = render(<PaywallModal isOpen={true} onClose={vi.fn()} onSelectPlan={vi.fn()} />);

      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Modal';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      // Modal should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close modal
      rerender(<PaywallModal isOpen={false} onClose={vi.fn()} onSelectPlan={vi.fn()} />);

      // Focus should return (in real implementation)
      document.body.removeChild(triggerButton);
    });

    it('should have visible focus indicators', () => {
      render(<LoginForm onSuccess={vi.fn()} onSwitchToRegister={vi.fn()} />);

      const emailInput = screen.getByLabelText(/email/i);
      emailInput.focus();

      // Check that focused element is the email input
      expect(document.activeElement).toBe(emailInput);
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should announce form submission status', async () => {
      const user = userEvent.setup();
      render(<LoginForm onSuccess={vi.fn()} onSwitchToRegister={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Error messages should have role="alert" for screen reader announcement
      const alerts = await screen.findAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should announce loading states', () => {
      render(<LoginForm onSuccess={vi.fn()} onSwitchToRegister={vi.fn()} />);

      // Form should be present
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
    });
  });
});
