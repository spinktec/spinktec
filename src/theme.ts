// Theme token definitions. Every color in component JSX must reference a token
// from here — no hardcoded hex values in components.

export interface ThemeTokens {
  bg: string;
  surface: string;
  border: string;
  text: string;
  textDim: string;
  textVeryDim: string;
  accent: string;
  accentAlt: string;
  success: string;
  danger: string;
  warning: string;
  compassBg: string;
}

export type ThemeName = 'dark' | 'light';

export const themes: Record<ThemeName, ThemeTokens> = {
  dark: {
    bg: '#070A13',
    surface: '#0C1120',
    border: '#172038',
    text: '#CBD5E1',
    textDim: '#475569',
    textVeryDim: '#1E293B',
    accent: '#60A5FA',
    accentAlt: '#C084FC',
    success: '#4ADE80',
    danger: '#F87171',
    warning: '#FBBF24',
    compassBg: '#060A13',
  },
  light: {
    bg: '#F1F5F9',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
    textDim: '#64748B',
    textVeryDim: '#CBD5E1',
    accent: '#2563EB',
    accentAlt: '#7C3AED',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#D97706',
    compassBg: '#E8EDF5',
  },
};

// Fixed candidate palette (candidates 1–10). Kept vivid in both themes.
export const CANDIDATE_COLORS: string[] = [
  '#FBBF24', // amber
  '#60A5FA', // sky blue
  '#4ADE80', // green
  '#F87171', // red
  '#C084FC', // purple
  '#F472B6', // pink
  '#FB923C', // orange
  '#22D3EE', // cyan
  '#A3E635', // lime
  '#818CF8', // indigo
];
