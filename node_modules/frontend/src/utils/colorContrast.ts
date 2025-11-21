/**
 * Color contrast utility for WCAG 2.1 AA compliance
 * Ensures all color combinations meet minimum contrast ratios
 */

export interface ColorPair {
  foreground: string;
  background: string;
  ratio: number;
  passes: boolean;
  level: 'AAA' | 'AA' | 'Fail';
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present and convert to lowercase
  const cleanHex = hex.replace('#', '').toLowerCase();
  
  // Handle 3-digit hex codes
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  
  // Handle 6-digit hex codes
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  
  return null;
}

/**
 * Calculate relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return 0;
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color pair meets WCAG AA standards
 * Normal text: 4.5:1
 * Large text (18pt+ or 14pt+ bold): 3:1
 */
export function meetsWCAG_AA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? 3 : 4.5;
  return ratio >= threshold;
}

/**
 * Check if color pair meets WCAG AAA standards
 * Normal text: 7:1
 * Large text: 4.5:1
 */
export function meetsWCAG_AAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? 4.5 : 7;
  return ratio >= threshold;
}

/**
 * Analyze color pair and return detailed information
 */
export function analyzeColorPair(
  foreground: string,
  background: string,
  isLargeText = false
): ColorPair {
  const ratio = getContrastRatio(foreground, background);
  const passesAAA = meetsWCAG_AAA(foreground, background, isLargeText);
  const passesAA = meetsWCAG_AA(foreground, background, isLargeText);

  return {
    foreground,
    background,
    ratio: Math.round(ratio * 100) / 100,
    passes: passesAA,
    level: passesAAA ? 'AAA' : passesAA ? 'AA' : 'Fail',
  };
}

/**
 * GitQuest color palette with WCAG compliance
 */
export const GITQUEST_COLORS = {
  // Primary colors
  primary: '#00ff41', // Bright green
  primaryDark: '#00cc33',
  background: '#1a1a2e', // Dark blue-black
  backgroundLight: '#16213e',
  
  // Text colors
  textPrimary: '#eee', // Light gray
  textSecondary: '#ddd',
  textMuted: '#999',
  
  // Accent colors
  accentBlue: '#6bcfff',
  accentYellow: '#ffd93d',
  accentRed: '#ff6b6b',
  accentPurple: '#9f7aea',
  
  // Status colors
  success: '#00ff41',
  error: '#ff6b6b',
  warning: '#ffd93d',
  info: '#6bcfff',
};

/**
 * Validate all GitQuest color combinations
 */
export function validateGitQuestColors(): Record<string, ColorPair> {
  const results: Record<string, ColorPair> = {};
  
  // Test primary text on backgrounds
  results['primary-text-on-dark'] = analyzeColorPair(
    GITQUEST_COLORS.textPrimary,
    GITQUEST_COLORS.background
  );
  
  results['secondary-text-on-dark'] = analyzeColorPair(
    GITQUEST_COLORS.textSecondary,
    GITQUEST_COLORS.background
  );
  
  // Test accent colors on backgrounds
  results['green-on-dark'] = analyzeColorPair(
    GITQUEST_COLORS.primary,
    GITQUEST_COLORS.background
  );
  
  results['blue-on-dark'] = analyzeColorPair(
    GITQUEST_COLORS.accentBlue,
    GITQUEST_COLORS.background
  );
  
  results['yellow-on-dark'] = analyzeColorPair(
    GITQUEST_COLORS.accentYellow,
    GITQUEST_COLORS.background
  );
  
  results['red-on-dark'] = analyzeColorPair(
    GITQUEST_COLORS.error,
    GITQUEST_COLORS.background
  );
  
  return results;
}
