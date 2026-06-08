import type { CityConfig } from '../services/cityService';
import { DEFAULT_PRIMARY } from './design';

export type BrandTheme = {
  appName: string;
  primaryColor: string;
  secondaryColor: string;
  useGradient: boolean;
  logoUrl?: string;
  /** Texte/icônes sur fond primary (boutons, FAB) */
  onPrimary: string;
  /** Fond léger teinté (chips actifs, badges) */
  primarySoft: string;
  /** Bordure / halo discret */
  primaryMuted: string;
};

function normalizeHex(hex: string): string {
  const h = hex.trim();
  if (!h) return DEFAULT_PRIMARY;
  return h.startsWith('#') ? h : `#${h}`;
}

/** Luminance relative WCAG (sRGB) */
export function getLuminance(hex: string): number {
  const normalized = normalizeHex(hex).replace('#', '');
  if (normalized.length !== 6) return 0;

  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(normalized.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

/** Blanc ou noir selon contraste sur la couleur de marque */
export function getOnPrimaryColor(primaryHex: string): string {
  return getLuminance(primaryHex) > 0.45 ? '#111827' : '#FFFFFF';
}

/** Alerte si la couleur primaire est trop claire sur fond blanc */
export function isPrimaryReadableOnWhite(primaryHex: string): boolean {
  const lum = getLuminance(primaryHex);
  const whiteLum = 1;
  const ratio = (Math.max(lum, whiteLum) + 0.05) / (Math.min(lum, whiteLum) + 0.05);
  return ratio >= 3;
}

export function tintHex(hex: string, alphaHex: string): string {
  return `${normalizeHex(hex)}${alphaHex}`;
}

export function buildBrandTheme(config: CityConfig | null | undefined): BrandTheme {
  const primaryColor = normalizeHex(config?.theme?.primaryColor ?? DEFAULT_PRIMARY);
  const secondaryColor = normalizeHex(config?.theme?.secondaryColor ?? primaryColor);

  return {
    appName: config?.name?.trim() || "Municip'All",
    primaryColor,
    secondaryColor,
    useGradient: config?.theme?.useGradient ?? false,
    logoUrl: config?.theme?.logoUrl,
    onPrimary: getOnPrimaryColor(primaryColor),
    primarySoft: tintHex(primaryColor, '18'),
    primaryMuted: tintHex(primaryColor, '30'),
  };
}
