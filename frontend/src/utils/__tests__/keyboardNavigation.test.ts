import { describe, it, expect, vi } from 'vitest';
import {
  handleKeyboardActivation,
  handleArrowNavigation,
  getFocusableElements,
  isElementFocusable,
} from '../keyboardNavigation';

describe('keyboardNavigation', () => {
  describe('handleKeyboardActivation', () => {
    it('should call callback on Enter key', () => {
      const callback = vi.fn();
      const event = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyboardActivation(event, callback);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it('should call callback on Space key', () => {
      const callback = vi.fn();
      const event = {
        key: ' ',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyboardActivation(event, callback);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it('should not call callback on other keys', () => {
      const callback = vi.fn();
      const event = {
        key: 'a',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyboardActivation(event, callback);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('handleArrowNavigation', () => {
    it('should navigate down with ArrowDown', () => {
      const onNavigate = vi.fn();
      const event = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowNavigation(event, 0, 5, onNavigate);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(1);
    });

    it('should wrap around at end with ArrowDown', () => {
      const onNavigate = vi.fn();
      const event = {
        key: 'ArrowDown',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowNavigation(event, 4, 5, onNavigate);

      expect(onNavigate).toHaveBeenCalledWith(0);
    });

    it('should navigate up with ArrowUp', () => {
      const onNavigate = vi.fn();
      const event = {
        key: 'ArrowUp',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowNavigation(event, 2, 5, onNavigate);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(1);
    });

    it('should wrap around at start with ArrowUp', () => {
      const onNavigate = vi.fn();
      const event = {
        key: 'ArrowUp',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowNavigation(event, 0, 5, onNavigate);

      expect(onNavigate).toHaveBeenCalledWith(4);
    });

    it('should navigate to first item with Home', () => {
      const onNavigate = vi.fn();
      const event = {
        key: 'Home',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowNavigation(event, 3, 5, onNavigate);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(0);
    });

    it('should navigate to last item with End', () => {
      const onNavigate = vi.fn();
      const event = {
        key: 'End',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowNavigation(event, 0, 5, onNavigate);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalledWith(4);
    });
  });

  describe('getFocusableElements', () => {
    it('should find all focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button 1</button>
        <a href="#">Link</a>
        <input type="text" />
        <button disabled>Disabled</button>
        <div tabindex="0">Focusable div</div>
        <div tabindex="-1">Not focusable</div>
      `;

      const focusable = getFocusableElements(container);

      // Should find button, link, input, and focusable div (not disabled button or tabindex="-1")
      expect(focusable.length).toBe(4);
    });
  });

  describe('isElementFocusable', () => {
    it('should return true for focusable button', () => {
      const button = document.createElement('button');
      expect(isElementFocusable(button)).toBe(true);
    });

    it('should return false for disabled button', () => {
      const button = document.createElement('button');
      button.disabled = true;
      expect(isElementFocusable(button)).toBe(false);
    });

    it('should return false for element with tabindex="-1"', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '-1');
      expect(isElementFocusable(div)).toBe(false);
    });
  });
});
