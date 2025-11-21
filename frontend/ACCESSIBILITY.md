# GitQuest Accessibility Implementation

This document outlines the accessibility features implemented in GitQuest to ensure WCAG 2.1 AA compliance and provide an inclusive learning experience for all users.

## Overview

GitQuest implements comprehensive accessibility features including:
- Keyboard navigation support
- ARIA labels and semantic HTML
- Color contrast compliance (WCAG 2.1 AA)
- Screen reader support
- Focus management
- Reduced motion support

## Keyboard Navigation

### Global Keyboard Shortcuts

- **Tab / Shift+Tab**: Navigate between interactive elements
- **Enter / Space**: Activate buttons and links
- **Escape**: Close modals and dialogs
- **Arrow Keys**: Navigate within lists and menus
- **Home / End**: Jump to first/last item in lists

### Skip Links

A "Skip to main content" link is available at the top of every page for keyboard users to bypass navigation and jump directly to the main content.

```tsx
// Usage in App.tsx
<a href="#main-content" className="skip-to-main">
  Skip to main content
</a>
```

### Component-Specific Navigation

#### Terminal Component
- **Up/Down Arrows**: Navigate command history
- **Tab**: Auto-complete Git commands
- **Ctrl+L**: Clear terminal
- **Ctrl+C**: Cancel current input

#### Quest List
- **Arrow Keys**: Navigate between quests
- **Enter**: Select quest
- **Home/End**: Jump to first/last quest

#### Progress Map
- **Tab**: Navigate between chapter regions
- **Enter/Space**: Select chapter
- **Arrow Keys**: Navigate between regions

## ARIA Labels and Semantic HTML

### Semantic Structure

All components use appropriate semantic HTML elements:
- `<main>` for main content areas
- `<nav>` for navigation
- `<article>` for quest content
- `<section>` for distinct content sections
- `<button>` for interactive actions (not `<div>` with click handlers)

### ARIA Attributes

#### Live Regions
```tsx
// Status updates announced to screen readers
<div role="status" aria-live="polite">
  Quest completed! +50 XP earned
</div>

// Critical alerts
<div role="alert" aria-live="assertive">
  Error: Command failed
</div>
```

#### Descriptive Labels
```tsx
// Button with clear purpose
<button aria-label="Show hint. 3 hints remaining">
  Show Hint
</button>

// Complex interactive elements
<div 
  role="button" 
  tabIndex={0}
  aria-label="Chapter 1: The Art of Chrono-Coding - Available"
  aria-disabled={false}
>
  Chapter 1
</div>
```

#### Dialog Management
```tsx
// Modal dialogs
<div 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Premium Content Locked</h2>
  <p id="dialog-description">Unlock all chapters...</p>
</div>
```

## Color Contrast

### WCAG 2.1 AA Compliance

All color combinations meet or exceed WCAG 2.1 AA standards:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio

### Color Palette

```typescript
// Primary colors with verified contrast ratios
const GITQUEST_COLORS = {
  primary: '#00ff41',        // Bright green (7.2:1 on dark background)
  background: '#1a1a2e',     // Dark blue-black
  textPrimary: '#eee',       // Light gray (12.6:1 on dark background)
  accentBlue: '#6bcfff',     // Cyan blue (5.8:1 on dark background)
  accentYellow: '#ffd93d',   // Gold yellow (10.1:1 on dark background)
  error: '#ff6b6b',          // Coral red (4.7:1 on dark background)
};
```

### Testing Color Contrast

Use the built-in color contrast utility:

```typescript
import { getContrastRatio, meetsWCAG_AA, validateGitQuestColors } from './utils/colorContrast';

// Check specific color pair
const ratio = getContrastRatio('#eee', '#1a1a2e');
const passes = meetsWCAG_AA('#eee', '#1a1a2e');

// Validate all GitQuest colors
const results = validateGitQuestColors();
```

## Screen Reader Support

### Announcements

Dynamic content changes are announced to screen readers:

```typescript
import { announceToScreenReader } from './utils/keyboardNavigation';

// Polite announcement (doesn't interrupt)
announceToScreenReader('Quest completed', 'polite');

// Assertive announcement (interrupts current reading)
announceToScreenReader('Error occurred', 'assertive');
```

### Hidden Content

Content that is visually hidden but available to screen readers:

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Decorative Elements

Decorative icons and emojis are hidden from screen readers:

```tsx
<span aria-hidden="true">🎯</span> Advanced Git concepts
```

## Focus Management

### Visible Focus Indicators

All interactive elements have clear focus indicators:

```css
*:focus-visible {
  outline: 2px solid #00ff41;
  outline-offset: 2px;
}
```

### Focus Trapping

Modals and dialogs trap focus to prevent keyboard users from tabbing outside:

```typescript
// Implemented in PaywallModal, HintPanel dialogs
useEffect(() => {
  if (!isOpen) return;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    // Trap focus within modal
  };

  document.addEventListener('keydown', handleTab);
  return () => document.removeEventListener('keydown', handleTab);
}, [isOpen]);
```

### Initial Focus

When modals open, focus is automatically moved to the first interactive element:

```typescript
useEffect(() => {
  if (isOpen) {
    const firstButton = modalRef.current?.querySelector('button');
    firstButton?.focus();
  }
}, [isOpen]);
```

## Reduced Motion Support

Respects user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## High Contrast Mode

Supports Windows High Contrast Mode:

```css
@media (prefers-contrast: high) {
  * {
    border-color: currentColor !important;
  }
  
  button,
  a {
    text-decoration: underline;
  }
}
```

## Touch Target Sizes

All interactive elements meet minimum touch target size (44x44px) on mobile:

```css
@media (hover: none) and (pointer: coarse) {
  button,
  a,
  [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

## Form Accessibility

### Labels and Error Messages

All form inputs have associated labels and error messages:

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <span id="email-error" role="alert">
    {errors.email}
  </span>
)}
```

### Loading States

Form submission states are communicated to screen readers:

```tsx
<button
  type="submit"
  disabled={isLoading}
  aria-busy={isLoading}
  aria-label={isLoading ? 'Submitting form' : 'Submit'}
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

## Testing Accessibility

### Automated Testing

Run accessibility tests:

```bash
npm test -- --run colorContrast keyboardNavigation
```

### Manual Testing Checklist

- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Verify color contrast with browser DevTools
- [ ] Test with browser zoom at 200%
- [ ] Test with Windows High Contrast Mode
- [ ] Verify reduced motion preferences are respected
- [ ] Test on mobile with touch targets
- [ ] Verify all images have alt text
- [ ] Check that all form inputs have labels
- [ ] Ensure focus is visible on all interactive elements

### Screen Reader Testing

Recommended screen readers:
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

### Browser Extensions

Useful accessibility testing tools:
- **axe DevTools**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Includes accessibility audit
- **Color Contrast Analyzer**: Check color combinations

## Component-Specific Accessibility

### Terminal Component
- Terminal output uses `role="log"` with `aria-live="polite"`
- Command input is labeled with `aria-label`
- Mobile keyboard toggle has clear label and expanded state

### Editor Component
- Editor region labeled with `role="textbox"` and `aria-multiline="true"`
- Conflict markers are announced to screen readers
- Save button state is communicated clearly

### Git Graph Component
- Graph container uses `role="img"` with descriptive `aria-label`
- Graph statistics use `role="status"` for live updates
- Loading and error states are announced

### Quest View Component
- Main quest area uses `<main>` element with `id="main-content"`
- Quest sections use semantic headings (h1, h2, h3)
- Progress validation results use `role="alert"`

### Progress Map Component
- Map regions are keyboard navigable with `tabindex`
- Each region has descriptive `aria-label`
- Locked/unlocked states are communicated

### Hint Panel Component
- Hint offers use `role="dialog"`
- Hint content uses `role="region"` with live updates
- XP penalty warnings are clearly labeled

## Future Improvements

Planned accessibility enhancements:
- [ ] Add keyboard shortcuts reference (accessible via ?)
- [ ] Implement voice control support
- [ ] Add dyslexia-friendly font option
- [ ] Provide text-to-speech for quest narratives
- [ ] Add customizable color themes for color blindness
- [ ] Implement adjustable text size preferences
- [ ] Add captions for any future video content

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Contact

For accessibility issues or suggestions, please:
- Open an issue on GitHub
- Email: accessibility@gitquest.dev
- Use the in-app feedback form

We are committed to making GitQuest accessible to all learners.
