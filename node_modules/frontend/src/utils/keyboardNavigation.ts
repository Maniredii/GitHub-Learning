/**
 * Keyboard navigation utilities for accessibility
 * Provides helpers for implementing keyboard-friendly interactions
 */

/**
 * Handle keyboard activation (Enter or Space)
 */
export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: () => void
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
}

/**
 * Handle arrow key navigation in a list
 */
export function handleArrowNavigation(
  event: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onNavigate: (newIndex: number) => void
): void {
  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowDown':
    case 'ArrowRight':
      event.preventDefault();
      newIndex = (currentIndex + 1) % totalItems;
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      event.preventDefault();
      newIndex = (currentIndex - 1 + totalItems) % totalItems;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = totalItems - 1;
      break;
    default:
      return;
  }

  onNavigate(newIndex);
}

/**
 * Trap focus within a modal or dialog
 */
export function trapFocus(
  container: HTMLElement,
  event: KeyboardEvent
): void {
  if (event.key !== 'Tab') return;

  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstElement(container: HTMLElement): void {
  const focusable = getFocusableElements(container);
  if (focusable.length > 0) {
    focusable[0].focus();
  }
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'visually-hidden';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if element is visible and focusable
 */
export function isElementFocusable(element: HTMLElement): boolean {
  // Check if element is disabled (for form elements)
  if ('disabled' in element && (element as HTMLButtonElement | HTMLInputElement).disabled) {
    return false;
  }
  
  if (element.getAttribute('tabindex') === '-1') return false;
  
  // In test environment, offsetParent might not work correctly
  // Check if element is in the document and not hidden
  if (typeof document !== 'undefined' && document.body.contains(element)) {
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    return true;
  }
  
  // Fallback for test environment
  if (element.offsetParent === null && element.style.display !== 'none') {
    // Element might not be attached to DOM in tests
    return true;
  }
  
  return element.offsetParent !== null;
}

/**
 * Skip to main content (for skip links)
 */
export function skipToMainContent(): void {
  const main = document.querySelector('main, [role="main"]') as HTMLElement;
  if (main) {
    main.setAttribute('tabindex', '-1');
    main.focus();
    main.removeAttribute('tabindex');
  }
}
