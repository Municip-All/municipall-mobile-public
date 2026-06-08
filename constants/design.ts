/** Couleur primaire par défaut (alignée sur la marque Municip'All) */
export const DEFAULT_PRIMARY = '#0B0080';

/** Palette sémantique iOS — contrastes validés clair/sombre */
export const semanticColors = {
  surface: { light: '#F2F2F7', dark: '#000000' },
  surfaceAuth: { light: '#F8FAFC', dark: '#09090B' },
  card: { light: '#FFFFFF', dark: '#18181B' },
  elevated: { light: '#FFFFFF', dark: '#1C1C1E' },
  border: { light: '#E4E4E7', dark: '#3F3F46' },
  borderSubtle: { light: '#F4F4F5', dark: '#27272A' },
  destructive: '#FF3B30',
  info: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  accent: '#AF52DE',
  points: '#FFCC00',
  muted: { light: '#71717A', dark: '#A1A1AA' },
  label: { light: '#52525B', dark: '#D4D4D8' },
  secondary: { light: '#3F3F46', dark: '#A1A1AA' },
  tertiary: { light: '#71717A', dark: '#71717A' },
} as const;

/** Fond teinté à partir d'une couleur primaire (ex. `#0B008015`) */
export function tintColor(hex: string, alphaHex = '15') {
  const normalized = hex.startsWith('#') ? hex : `#${hex}`;
  return `${normalized}${alphaHex}`;
}
