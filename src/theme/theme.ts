import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export type ColorMode = 'light' | 'dark';

export type AppTheme = Theme & {
  colors: Theme['colors'] & {
    background2: string;
    surface: string;
    surface2: string;
    surface3: string;
    textMuted: string;
    borderStrong: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
};

const LIGHT_COLORS: AppTheme['colors'] = {
  ...DefaultTheme.colors,
  primary: '#111111',
  background: '#FFFFFF',
  card: '#F7F7F7',
  text: '#111111',
  border: '#E6E6E6',
  notification: '#111111',

  background2: '#F9F9F9',
  surface: '#FFFFFF',
  surface2: '#F5F5F5',
  surface3: '#EDEDED',
  textMuted: '#6B7280',
  borderStrong: '#D1D5DB',
  accent: '#111111',
  success: '#0F766E',
  warning: '#B45309',
  danger: '#B91C1C',
};

const DARK_COLORS: AppTheme['colors'] = {
  ...DarkTheme.colors,
  primary: '#FFFFFF',
  background: '#0A0A0A',
  card: '#111111',
  text: '#F5F5F5',
  border: '#262626',
  notification: '#FFFFFF',

  background2: '#0F0F0F',
  surface: '#111111',
  surface2: '#161616',
  surface3: '#1D1D1D',
  textMuted: '#9CA3AF',
  borderStrong: '#3A3A3A',
  accent: '#FFFFFF',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
};

export const NAV_THEME: Record<ColorMode, AppTheme> = {
  light: {
    ...DefaultTheme,
    dark: false,
    colors: LIGHT_COLORS,
  },
  dark: {
    ...DarkTheme,
    dark: true,
    colors: DARK_COLORS,
  },
};

export const APP_TOKENS = {
  light: {
    bg: '#FFFFFF',
    bg2: '#F9F9F9',
    surface: '#FFFFFF',
    surface2: '#F5F5F5',
    surface3: '#EDEDED',
    text: '#111111',
    textMuted: '#6B7280',
    border: '#E6E6E6',
    borderStrong: '#D1D5DB',
    accent: '#111111',
    success: '#0F766E',
    warning: '#B45309',
    danger: '#B91C1C',
  },
  dark: {
    bg: '#0A0A0A',
    bg2: '#0F0F0F',
    surface: '#111111',
    surface2: '#161616',
    surface3: '#1D1D1D',
    text: '#F5F5F5',
    textMuted: '#9CA3AF',
    border: '#262626',
    borderStrong: '#3A3A3A',
    accent: '#FFFFFF',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
} as const;

export const SHADOW = {
  light: {
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
} as const;

export function getAppTokens(mode: ColorMode) {
  return APP_TOKENS[mode];
}