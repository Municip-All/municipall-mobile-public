import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'nativewind';
import { Appearance } from 'react-native';

// Le type pour la préférence de thème. NativeWind gère 'system' nativement.
type ThemePreference = 'light' | 'dark' | 'system';

// Le type pour notre contexte. On expose directement les fonctions de NativeWind.
interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  colorScheme: 'light' | 'dark';
}

// Création du contexte
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Le Provider qui va envelopper l'application
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // On utilise le hook de NativeWind qui est la SEULE source de vérité.
  const { colorScheme, setColorScheme } = useColorScheme();

  const value: ThemeContextType = {
    // On utilise `colorScheme` comme base pour la préférence, car c'est ce que NativeWind stocke.
    theme: colorScheme as ThemePreference,
    setTheme: setColorScheme,
    // On expose le `colorScheme` actuel ('light' ou 'dark'), jamais 'system'.
    // C'est utile pour savoir quel est le thème *réellement* appliqué.
    colorScheme: colorScheme === 'system' ? (Appearance.getColorScheme() ?? 'light') : colorScheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Le hook personnalisé pour consommer le contexte
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
