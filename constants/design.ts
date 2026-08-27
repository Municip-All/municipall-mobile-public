import type { ViewStyle } from 'react-native';

export const palette = {
  matcha900: '#24391C',
  matcha700: '#3D6B2F',
  matcha500: '#5C9A4E',
  matcha300: '#A3C98F',
  matcha100: '#E6F1DC',
  cream50: '#FEFDFB',
  cream100: '#F8F6EF',
  cream200: '#EBE6D9',
  charcoal: '#313B2B',
  muted: '#76806C',
  sake400: '#D2543F',
  amber400: '#E09A2D',
  info400: '#5B87B0',
  nightBg: '#161D10',
  nightSurface: '#1E2715',
  nightElevated: '#26301C',
  nightBorder: '#36422B',
  nightText: '#EDF3E3',
  nightMuted: '#A6B397',
} as const;

export const DEFAULT_PRIMARY = palette.matcha700;

export const softShadow: ViewStyle = {
  shadowColor: palette.matcha700,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 1,
};

export const semanticColors = {
  surface: { light: palette.cream100, dark: palette.nightBg },
  surfaceAuth: { light: palette.cream50, dark: palette.nightBg },
  card: { light: palette.cream50, dark: palette.nightSurface },
  elevated: { light: palette.cream50, dark: palette.nightElevated },
  border: { light: palette.cream200, dark: palette.nightBorder },
  borderSubtle: { light: '#F1EEE3', dark: palette.nightSurface },
  destructive: palette.sake400,
  info: palette.info400,
  success: palette.matcha700,
  successDark: palette.matcha300,
  warning: palette.amber400,
  accent: { light: palette.matcha700, dark: palette.matcha300 },
  points: palette.amber400,
  muted: { light: palette.muted, dark: palette.nightMuted },
  label: { light: '#4D5743', dark: '#CFDAC4' },
  secondary: { light: palette.charcoal, dark: palette.nightText },
  tertiary: { light: palette.muted, dark: palette.nightMuted },
} as const;

export function tintColor(hex: string, alphaHex = '15') {
  const normalized = hex.startsWith('#') ? hex : `#${hex}`;
  return `${normalized}${alphaHex}`;
}
