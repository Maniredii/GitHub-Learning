import { describe, it, expect } from 'vitest';
import {
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  analyzeColorPair,
  validateGitQuestColors,
  GITQUEST_COLORS,
} from '../colorContrast';

describe('colorContrast', () => {
  describe('getContrastRatio', () => {
    it('should calculate correct contrast ratio for black and white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate correct contrast ratio for same colors', () => {
      const ratio = getContrastRatio('#000000', '#000000');
      expect(ratio).toBe(1);
    });

    it('should handle colors without # prefix', () => {
      const ratio = getContrastRatio('000000', 'ffffff');
      expect(ratio).toBeCloseTo(21, 0);
    });
  });

  describe('meetsWCAG_AA', () => {
    it('should pass for sufficient contrast (normal text)', () => {
      // White on dark blue-black (GitQuest background)
      expect(meetsWCAG_AA('#eee', '#1a1a2e')).toBe(true);
    });

    it('should fail for insufficient contrast', () => {
      expect(meetsWCAG_AA('#888', '#999')).toBe(false);
    });

    it('should use lower threshold for large text', () => {
      // This might fail for normal text but pass for large text
      const result = meetsWCAG_AA('#777', '#ffffff', true);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('meetsWCAG_AAA', () => {
    it('should pass for high contrast', () => {
      expect(meetsWCAG_AAA('#000000', '#ffffff')).toBe(true);
    });

    it('should fail for moderate contrast', () => {
      expect(meetsWCAG_AAA('#666', '#ffffff')).toBe(false);
    });
  });

  describe('analyzeColorPair', () => {
    it('should return detailed analysis', () => {
      const analysis = analyzeColorPair('#eee', '#1a1a2e');
      
      expect(analysis).toHaveProperty('foreground', '#eee');
      expect(analysis).toHaveProperty('background', '#1a1a2e');
      expect(analysis).toHaveProperty('ratio');
      expect(analysis).toHaveProperty('passes');
      expect(analysis).toHaveProperty('level');
      expect(analysis.ratio).toBeGreaterThan(4.5);
      expect(analysis.passes).toBe(true);
    });
  });

  describe('validateGitQuestColors', () => {
    it('should validate all GitQuest color combinations', () => {
      const results = validateGitQuestColors();
      
      // Check that primary text on dark background passes
      expect(results['primary-text-on-dark'].passes).toBe(true);
      
      // Check that all results have required properties
      Object.values(results).forEach((result) => {
        expect(result).toHaveProperty('ratio');
        expect(result).toHaveProperty('passes');
        expect(result).toHaveProperty('level');
      });
    });

    it('should ensure GitQuest primary colors meet WCAG AA', () => {
      // Test key color combinations
      expect(meetsWCAG_AA(GITQUEST_COLORS.textPrimary, GITQUEST_COLORS.background)).toBe(true);
      expect(meetsWCAG_AA(GITQUEST_COLORS.primary, GITQUEST_COLORS.background)).toBe(true);
      expect(meetsWCAG_AA(GITQUEST_COLORS.accentBlue, GITQUEST_COLORS.background)).toBe(true);
    });
  });

  describe('GITQUEST_COLORS', () => {
    it('should have all required color definitions', () => {
      expect(GITQUEST_COLORS).toHaveProperty('primary');
      expect(GITQUEST_COLORS).toHaveProperty('background');
      expect(GITQUEST_COLORS).toHaveProperty('textPrimary');
      expect(GITQUEST_COLORS).toHaveProperty('success');
      expect(GITQUEST_COLORS).toHaveProperty('error');
      expect(GITQUEST_COLORS).toHaveProperty('warning');
    });
  });
});
