/**
 * Color contrast accessibility tests
 * Validates WCAG 2.1 AA compliance for all GitQuest color combinations
 * Requirements: 13.4, 13.5
 */

import { describe, it, expect } from 'vitest';
import {
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  analyzeColorPair,
  validateGitQuestColors,
  GITQUEST_COLORS,
} from '../colorContrast';

describe('Color Contrast Accessibility', () => {
  describe('WCAG AA Compliance - Normal Text (4.5:1)', () => {
    it('should pass for primary text on dark background', () => {
      const ratio = getContrastRatio(
        GITQUEST_COLORS.textPrimary,
        GITQUEST_COLORS.background
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAG_AA(GITQUEST_COLORS.textPrimary, GITQUEST_COLORS.background)).toBe(
        true
      );
    });

    it('should pass for secondary text on dark background', () => {
      const ratio = getContrastRatio(
        GITQUEST_COLORS.textSecondary,
        GITQUEST_COLORS.background
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAG_AA(GITQUEST_COLORS.textSecondary, GITQUEST_COLORS.background)).toBe(
        true
      );
    });

    it('should pass for primary color on dark background', () => {
      const ratio = getContrastRatio(
        GITQUEST_COLORS.primary,
        GITQUEST_COLORS.background
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAG_AA(GITQUEST_COLORS.primary, GITQUEST_COLORS.background)).toBe(
        true
      );
    });

    it('should pass for accent blue on dark background', () => {
      const ratio = getContrastRatio(
        GITQUEST_COLORS.accentBlue,
        GITQUEST_COLORS.background
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAG_AA(GITQUEST_COLORS.accentBlue, GITQUEST_COLORS.background)).toBe(
        true
      );
    });

    it('should pass for accent yellow on dark background', () => {
      const ratio = getContrastRatio(
        GITQUEST_COLORS.accentYellow,
        GITQUEST_COLORS.background
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAG_AA(GITQUEST_COLORS.accentYellow, GITQUEST_COLORS.background)).toBe(
        true
      );
    });

    it('should pass for error color on dark background', () => {
      const ratio = getContrastRatio(
        GITQUEST_COLORS.error,
        GITQUEST_COLORS.background
      );
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(meetsWCAG_AA(GITQUEST_COLORS.error, GITQUEST_COLORS.background)).toBe(
        true
      );
    });
  });

  describe('WCAG AA Compliance - Large Text (3:1)', () => {
    it('should pass for muted text on dark background (large text)', () => {
      const ratio = getContrastRatio(
        GITQUEST_COLORS.textMuted,
        GITQUEST_COLORS.background
      );
      expect(meetsWCAG_AA(GITQUEST_COLORS.textMuted, GITQUEST_COLORS.background, true)).toBe(
        true
      );
    });
  });

  describe('WCAG AAA Compliance (7:1)', () => {
    it('should check AAA compliance for primary text', () => {
      const passesAAA = meetsWCAG_AAA(
        GITQUEST_COLORS.textPrimary,
        GITQUEST_COLORS.background
      );
      // AAA is stricter, so we just verify the function works
      expect(typeof passesAAA).toBe('boolean');
    });
  });

  describe('Color Pair Analysis', () => {
    it('should provide detailed analysis for color pairs', () => {
      const analysis = analyzeColorPair(
        GITQUEST_COLORS.textPrimary,
        GITQUEST_COLORS.background
      );

      expect(analysis).toHaveProperty('foreground');
      expect(analysis).toHaveProperty('background');
      expect(analysis).toHaveProperty('ratio');
      expect(analysis).toHaveProperty('passes');
      expect(analysis).toHaveProperty('level');
      expect(analysis.passes).toBe(true);
      expect(['AA', 'AAA']).toContain(analysis.level);
    });

    it('should identify failing color pairs', () => {
      const analysis = analyzeColorPair('#888', '#999');
      expect(analysis.passes).toBe(false);
      expect(analysis.level).toBe('Fail');
    });
  });

  describe('GitQuest Color Validation', () => {
    it('should validate all GitQuest color combinations', () => {
      const results = validateGitQuestColors();

      // Check that all key combinations are tested
      expect(results).toHaveProperty('primary-text-on-dark');
      expect(results).toHaveProperty('secondary-text-on-dark');
      expect(results).toHaveProperty('green-on-dark');
      expect(results).toHaveProperty('blue-on-dark');
      expect(results).toHaveProperty('yellow-on-dark');
      expect(results).toHaveProperty('red-on-dark');

      // All should pass WCAG AA
      Object.values(results).forEach((result) => {
        expect(result.passes).toBe(true);
        expect(result.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it('should ensure primary text meets high contrast standards', () => {
      const results = validateGitQuestColors();
      const primaryTextResult = results['primary-text-on-dark'];
      
      expect(primaryTextResult.passes).toBe(true);
      expect(primaryTextResult.ratio).toBeGreaterThan(7); // Should be very high contrast
    });
  });

  describe('Edge Cases', () => {
    it('should handle colors without # prefix', () => {
      const ratio = getContrastRatio('ffffff', '000000');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should handle 3-digit hex codes', () => {
      const ratio = getContrastRatio('#fff', '#000');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should return 1 for identical colors', () => {
      const ratio = getContrastRatio('#123456', '#123456');
      expect(ratio).toBe(1);
    });

    it('should handle invalid hex codes gracefully', () => {
      const ratio = getContrastRatio('invalid', '#ffffff');
      expect(ratio).toBe(0);
    });
  });
});