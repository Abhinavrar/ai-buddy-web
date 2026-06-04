import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppThemeName = 'Light' | 'Ocean' | 'Dark';

export type AppThemeColors = {
  background: string;
  surface: string;
  text: string;
  tint: string;
  icon: string;
  muted: string;
  border: string;
  tabIconDefault: string;
  tabIconSelected: string;
};

export const appThemeOptions: Record<AppThemeName, { label: AppThemeName; colors: AppThemeColors }> = {
  'Light': {
    label: 'Light',
    colors: {
      background: '#F8FAFF',
      surface: '#FFFFFF',
      text: '#0F172A',
      tint: '#2563EB',
      icon: '#475569',
      muted: '#64748B',
      border: '#E2E8F0',
      tabIconDefault: '#64748B',
      tabIconSelected: '#2563EB',
    },
  },
  'Ocean': {
    label: 'Ocean',
    colors: {
      background: '#EFF6FF',
      surface: '#DBEAFE',
      text: '#1E3A8A',
      tint: '#0EA5E9',
      icon: '#0C4A6E',
      muted: '#2563EB',
      border: '#93C5FD',
      tabIconDefault: '#1E40AF',
      tabIconSelected: '#0EA5E9',
    },
  },
  'Dark': {
    label: 'Dark',
    colors: {
      background: '#0F172A',
      surface: '#111827',
      text: '#E2E8F0',
      tint: '#38BDF8',
      icon: '#94A3B8',
      muted: '#8CA3AF',
      border: '#334155',
      tabIconDefault: '#94A3B8',
      tabIconSelected: '#38BDF8',
    },
  },
};

const AppThemeContext = createContext({
  themeName: 'Light' as AppThemeName,
  setThemeName: (_themeName: AppThemeName) => {},
  colors: appThemeOptions['Light'].colors,
});

const THEME_STORAGE_KEY = 'buddy_theme_name';

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<AppThemeName>('Light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedTheme) => {
        if (savedTheme && Object.keys(appThemeOptions).includes(savedTheme)) {
          setThemeName(savedTheme as AppThemeName);
        }
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(THEME_STORAGE_KEY, themeName).catch(() => null);
  }, [themeName]);

  const value = useMemo(
    () => ({ themeName, setThemeName, colors: appThemeOptions[themeName].colors }),
    [themeName]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
