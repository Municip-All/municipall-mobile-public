import type { ViewStyle } from 'react-native';

export const palette = {
  matcha900: '#2E4029',
  matcha700: '#4A6741',
  matcha500: '#7A9B6D',
  matcha300: '#A8C69F',
  matcha100: '#E3EDDE',
  cream50: '#FDFCF9',
  cream100: '#F7F4EC',
  cream200: '#EFEAE0',
  charcoal: '#3A4238',
  muted: '#7C8378',
  sake400: '#C65D4E',
  amber400: '#D9A441',
  info400: '#7A8FA6',
  nightBg: '#1C241A',
  nightSurface: '#252E22',
  nightElevated: '#2A3426',
  nightBorder: '#39442F',
  nightText: '#E8EDE4',
  nightMuted: '#9FAA96',
} as const;

export const DEFAULT_PRIMARY = palette.matcha700;

export const softShadow: ViewStyle = {
  shadowColor: palette.matcha700,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 1,
};

export const semanticColors = {
  surface: { light: palette.cream100, dark: palette.nightBg },
  surfaceAuth: { light: palette.cream50, dark: palette.nightBg },
  card: { light: palette.cream50, dark: palette.nightSurface },
  elevated: { light: palette.cream50, dark: palette.nightElevated },
  border: { light: palette.cream200, dark: palette.nightBorder },
  borderSubtle: { light: '#F2EFE5', dark: palette.nightSurface },
  destructive: palette.sake400,
  info: palette.info400,
  success: palette.matcha700,
  successDark: palette.matcha300,
  warning: palette.amber400,
  accent: { light: palette.matcha700, dark: palette.matcha300 },
  points: palette.amber400,
  muted: { light: palette.muted, dark: palette.nightMuted },
  label: { light: '#565E50', dark: '#C9D1C3' },
  secondary: { light: palette.charcoal, dark: palette.nightText },
  tertiary: { light: palette.muted, dark: palette.nightMuted },
} as const;

export function tintColor(hex: string, alphaHex = '15') {
  const normalized = hex.startsWith('#') ? hex : `#${hex}`;
  return `${normalized}${alphaHex}`;
}
