import { useMemo } from 'react';
import { type ViewStyle } from 'react-native';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { DEFAULT_PRIMARY, palette, semanticColors, softShadow, tintColor } from '@constants/design';
import { buildBrandTheme } from '@constants/brand';

export function useAppTheme() {
  const { colorScheme, theme, setTheme } = useTheme();
  const { config } = useCity();
  const dark = colorScheme === 'dark';
  const brand = useMemo(() => buildBrandTheme(config), [config]);
  const primaryColor = brand.primaryColor || DEFAULT_PRIMARY;

  const pageBackground = dark
    ? (brand.backgroundColorDark ?? semanticColors.surface.dark)
    : (brand.backgroundColorLight ?? semanticColors.surface.light);

  const pageAuthBackground = dark
    ? (brand.backgroundColorDark ?? semanticColors.surfaceAuth.dark)
    : (brand.backgroundColorLight ?? semanticColors.surfaceAuth.light);

  const layoutStyles = useMemo(
    () => ({
      page: { flex: 1, backgroundColor: pageBackground } satisfies ViewStyle,
      pageAuth: { flex: 1, backgroundColor: pageAuthBackground } satisfies ViewStyle,
    }),
    [pageBackground, pageAuthBackground]
  );

  const classes = useMemo(
    () => ({
      card: dark
        ? 'rounded-2xl border border-night-border bg-night-surface'
        : 'rounded-2xl border border-cream-200 bg-cream-50',
      cardRounded: dark
        ? 'overflow-hidden rounded-[20px] border border-night-border bg-night-surface'
        : 'overflow-hidden rounded-[20px] border border-cream-200 bg-cream-50',
      cardRoundedLg: dark
        ? 'overflow-hidden rounded-[20px] border border-night-border bg-night-surface'
        : 'overflow-hidden rounded-[20px] border border-cream-200 bg-cream-50',
      listGroup: dark
        ? 'overflow-hidden rounded-2xl border border-night-border bg-night-surface'
        : 'overflow-hidden rounded-2xl border border-cream-200 bg-cream-50',
      eyebrow: `text-xs font-semibold tracking-widest uppercase ${dark ? 'text-night-muted' : 'text-muted'}`,
      title: `text-4xl font-extrabold tracking-tight ${dark ? 'text-night-text' : 'text-matcha-900'}`,
      sectionTitle: `text-2xl font-bold ${dark ? 'text-night-text' : 'text-matcha-900'}`,
      subtitle: `text-sm font-medium ${dark ? 'text-night-muted' : 'text-muted'}`,
      body: `text-sm leading-5 ${dark ? 'text-night-text' : 'text-charcoal'}`,
      meta: `text-[11px] font-semibold ${dark ? 'text-night-muted' : 'text-muted'}`,
      caption: `text-[10px] font-semibold ${dark ? 'text-night-muted' : 'text-muted'}`,
      chipInactive: dark
        ? 'border border-night-border bg-transparent'
        : 'border border-cream-200 bg-transparent',
      input: dark
        ? 'rounded-xl border border-night-border bg-night-surface text-night-text'
        : 'rounded-xl border border-cream-200 bg-cream-100 text-matcha-900',
      formLabel: `mb-3 mt-1 text-xs font-semibold tracking-widest uppercase ${dark ? 'text-night-muted' : 'text-muted'}`,
      formField: dark
        ? 'rounded-xl border border-night-border bg-night-surface'
        : 'rounded-xl border border-cream-200 bg-cream-100',
      formFieldText: `text-base font-medium ${dark ? 'text-night-text' : 'text-matcha-900'}`,
      chipUnselected: dark
        ? 'rounded-xl border border-night-border bg-night-surface px-6 py-3'
        : 'rounded-xl border border-cream-200 bg-cream-50 px-6 py-3',
      chipUnselectedText: `text-sm font-semibold ${dark ? 'text-night-text' : 'text-charcoal'}`,
      photoDropzone: dark
        ? 'rounded-2xl border-2 border-dashed border-night-border bg-night-surface'
        : 'rounded-2xl border-2 border-dashed border-cream-200 bg-cream-50',
      photoHint: `mt-2 text-sm font-medium ${dark ? 'text-night-muted' : 'text-muted'}`,
    }),
    [dark]
  );

  const colors = useMemo(
    () => ({
      semantic: semanticColors,
      palette,
      primary: primaryColor,
      onPrimary: brand.onPrimary,
      primarySoft: brand.primarySoft,
      primaryTint: tintColor(primaryColor),
      iconMuted: dark ? semanticColors.muted.dark : semanticColors.muted.light,
      chevron: dark ? semanticColors.muted.dark : semanticColors.muted.light,
      text: dark ? semanticColors.secondary.dark : semanticColors.secondary.light,
      surface: pageBackground,
      card: dark ? semanticColors.card.dark : semanticColors.card.light,
      elevated: dark ? semanticColors.elevated.dark : semanticColors.elevated.light,
      border: dark ? semanticColors.border.dark : semanticColors.border.light,
      tabBar: dark ? palette.nightBg : palette.cream50,
      fabBorder: dark ? palette.nightBorder : palette.cream200,
      softShadow,
      destructive: semanticColors.destructive,
      info: semanticColors.info,
      success: dark ? semanticColors.successDark : semanticColors.success,
      warning: semanticColors.warning,
      accent: dark ? semanticColors.accent.dark : semanticColors.accent.light,
      points: semanticColors.points,
      placeholder: dark ? palette.nightMuted : palette.muted,
      modalSheet: dark ? semanticColors.card.dark : semanticColors.card.light,
      handle: dark ? palette.nightBorder : palette.cream200,
    }),
    [dark, primaryColor, brand.onPrimary, brand.primarySoft, pageBackground]
  );

  return {
    dark,
    colorScheme,
    theme,
    setTheme,
    primaryColor,
    brand,
    classes,
    layoutStyles,
    colors,
    tintColor,
  };
}
