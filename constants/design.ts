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
  /** Secondaire light — ≥ 4.5:1 sur cream/blanc (WCAG AA) */
  muted: '#5C6654',
  sake400: '#D2543F',
  amber400: '#E09A2D',
  info400: '#5B87B0',
  nightBg: '#09090B',
  nightSurface: '#18181B',
  nightElevated: '#27272A',
  nightBorder: '#3F3F46',
  nightText: '#FAFAFA',
  nightMuted: '#A1A1AA',
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
  label: { light: '#4D5743', dark: '#D4D4D8' },
  secondary: { light: palette.charcoal, dark: palette.nightText },
  tertiary: { light: palette.muted, dark: palette.nightMuted },
} as const;

export function tintColor(hex: string, alphaHex = '15') {
  const normalized = hex.startsWith('#') ? hex : `#${hex}`;
  return `${normalized}${alphaHex}`;
}
