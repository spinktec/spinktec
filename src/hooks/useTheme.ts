// Theme preference, toggle, and persistence.
//
// Three preferences: 'system' (a.k.a. "routine" — follows the OS setting),
// 'light', and 'dark'. The default is 'system'; the toggle button cycles
// system → light → dark. The resolved theme follows the OS while on 'system'
// and updates live if the OS theme changes.

import { useCallback, useEffect, useState } from 'react';
import { themes, type ThemeName, type ThemeTokens } from '../theme';

const STORAGE_KEY = 'ess-theme';

export type ThemePreference = 'system' | 'light' | 'dark';

const ORDER: ThemePreference[] = ['system', 'light', 'dark'];

function getStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'system' || stored === 'light' || stored === 'dark') return stored;
  return 'system';
}

function getSystemTheme(): ThemeName {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export interface UseThemeResult {
  preference: ThemePreference;
  themeName: ThemeName;
  tokens: ThemeTokens;
  cycle: () => void;
}

export function useTheme(): UseThemeResult {
  const [preference, setPreference] = useState<ThemePreference>(getStoredPreference);
  const [systemTheme, setSystemTheme] = useState<ThemeName>(getSystemTheme);

  // Keep the resolved theme in sync with the OS while on 'system' (routine).
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (): void => setSystemTheme(mql.matches ? 'light' : 'dark');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const themeName: ThemeName = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, preference);
    document.documentElement.style.colorScheme = themeName;
  }, [preference, themeName]);

  const cycle = useCallback(() => {
    setPreference((prev) => ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length]);
  }, []);

  return { preference, themeName, tokens: themes[themeName], cycle };
}
