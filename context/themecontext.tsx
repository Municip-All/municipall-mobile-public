import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'nativewind';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemePreference; // user preference
  setTheme: (theme: ThemePreference) => void;
  colorScheme: 'light' | 'dark'; // resolved runtime scheme
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme.preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const nativewind = useColorScheme();
  const [pref, setPref] = useState<ThemePreference>('system');

  // Load persisted preference on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setPref(saved);
          nativewind.setColorScheme(saved);
        }
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback(
    async (t: ThemePreference) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, t);
      } catch {}
      setPref(t);
      nativewind.setColorScheme(t);
    },
    [nativewind]
  );

  const resolved: 'light' | 'dark' = useMemo(() => {
    if (pref === 'system') {
      return Appearance.getColorScheme() ?? 'light';
    }
    return pref;
  }, [pref]);

  const value: ThemeContextType = useMemo(
    () => ({ theme: pref, setTheme, colorScheme: resolved }),
    [pref, resolved, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
