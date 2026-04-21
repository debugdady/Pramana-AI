import { FONTS, FONT_VARIANTS, type Theme } from '@/lib/theme';
import type { TextStyle } from 'react-native';

/**
 * Hook to get font family based on text variant
 * @param variant - Text variant name (h1, h2, p, etc.)
 * @returns fontFamily string for the variant
 */
export function useFont(variant: keyof typeof FONT_VARIANTS = 'default'): string {
  const fontKey = FONT_VARIANTS[variant] || 'regular';
  return FONTS[fontKey];
}

/**
 * Get font style object with fontFamily
 * @param variant - Text variant name
 * @returns Style object with fontFamily
 */
export function getFontStyle(variant: keyof typeof FONT_VARIANTS = 'default'): TextStyle {
  return {
    fontFamily: useFont(variant),
  };
}

/**
 * Create a text style with font and custom styles
 * @param variant - Text variant name
 * @param customStyle - Additional style properties
 * @returns Combined style object
 */
export function createFontStyle(
  variant: keyof typeof FONT_VARIANTS = 'default',
  customStyle?: TextStyle
): TextStyle {
  return {
    ...getFontStyle(variant),
    ...customStyle,
  };
}
