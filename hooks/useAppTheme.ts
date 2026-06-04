import { useMemo } from 'react';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { DEFAULT_PRIMARY, semanticColors, tintColor } from '@constants/design';

/**
 * Hook unifié pour le thème : préférence utilisateur, schéma résolu,
 * couleur primaire ville, classes Tailwind et couleurs sémantiques.
 */
export function useAppTheme() {
  const { colorScheme, theme, setTheme } = useTheme();
  const { config } = useCity();
  const dark = colorScheme === 'dark';
  const primaryColor = config?.theme.primaryColor ?? DEFAULT_PRIMARY;

  const classes = useMemo(
    () => ({
      page: dark ? 'bg-black' : 'bg-surface',
      pageAuth: dark ? 'bg-zinc-950' : 'bg-surface-auth',
      card: dark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200',
      cardRounded: dark
        ? 'overflow-hidden rounded-[28px] bg-zinc-900 border border-zinc-800 shadow-sm'
        : 'overflow-hidden rounded-[28px] bg-white border border-zinc-200 shadow-sm',
      cardRoundedLg: dark
        ? 'overflow-hidden rounded-[32px] bg-zinc-900 border border-zinc-800 shadow-sm'
        : 'overflow-hidden rounded-[32px] bg-white border border-zinc-200 shadow-sm',
      listGroup: dark
        ? 'overflow-hidden rounded-[24px] bg-zinc-900 border border-zinc-800 shadow-sm'
        : 'overflow-hidden rounded-[24px] bg-white border border-zinc-200 shadow-sm',
      eyebrow: `text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-400' : 'text-zinc-500'}`,
      title: `text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`,
      sectionTitle: `text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`,
      subtitle: `text-sm font-medium ${dark ? 'text-zinc-300' : 'text-zinc-600'}`,
      body: `text-sm leading-5 ${dark ? 'text-zinc-300' : 'text-zinc-700'}`,
      meta: `text-[11px] font-bold ${dark ? 'text-zinc-500' : 'text-zinc-500'}`,
      caption: `text-[10px] font-bold ${dark ? 'text-zinc-400' : 'text-zinc-500'}`,
      chipInactive: dark
        ? 'border border-zinc-700 bg-transparent'
        : 'border border-zinc-200 bg-transparent',
      input: dark
        ? 'border border-white/15 bg-zinc-900/80 text-white'
        : 'border border-zinc-200 bg-white text-zinc-900',
      /** Labels de formulaire (modales, champs) */
      formLabel: `mb-3 mt-1 text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-400' : 'text-zinc-500'}`,
      formField: dark
        ? 'rounded-2xl border border-zinc-600 bg-zinc-800'
        : 'rounded-2xl border border-zinc-200 bg-white shadow-sm',
      formFieldText: `text-base font-medium ${dark ? 'text-white' : 'text-zinc-900'}`,
      chipUnselected: dark
        ? 'rounded-full border border-zinc-600 bg-zinc-800 px-6 py-3'
        : 'rounded-full border border-zinc-200 bg-white px-6 py-3',
      chipUnselectedText: `text-sm font-bold ${dark ? 'text-zinc-200' : 'text-zinc-600'}`,
      photoDropzone: dark
        ? 'rounded-3xl border-2 border-dashed border-zinc-600 bg-zinc-800'
        : 'rounded-3xl border-2 border-dashed border-zinc-300 bg-white',
      photoHint: `mt-2 text-sm font-semibold ${dark ? 'text-zinc-300' : 'text-zinc-500'}`,
    }),
    [dark]
  );

  const colors = useMemo(
    () => ({
      semantic: semanticColors,
      primary: primaryColor,
      primaryTint: tintColor(primaryColor),
      iconMuted: dark ? semanticColors.muted.dark : semanticColors.muted.light,
      chevron: dark ? semanticColors.muted.dark : semanticColors.muted.light,
      surface: dark ? semanticColors.surface.dark : semanticColors.surface.light,
      card: dark ? semanticColors.card.dark : semanticColors.card.light,
      elevated: dark ? semanticColors.elevated.dark : semanticColors.elevated.light,
      tabBar: dark ? '#18181B' : '#FFFFFF',
      fabBorder: dark ? '#27272A' : '#F4F4F5',
      destructive: semanticColors.destructive,
      info: semanticColors.info,
      success: semanticColors.success,
      warning: semanticColors.warning,
      accent: semanticColors.accent,
      placeholder: dark ? '#A1A1AA' : '#71717A',
      modalSheet: dark ? semanticColors.card.dark : semanticColors.surface.light,
      handle: dark ? '#52525B' : '#D1D1D6',
    }),
    [dark, primaryColor]
  );

  return {
    dark,
    colorScheme,
    theme,
    setTheme,
    primaryColor,
    classes,
    colors,
    tintColor,
  };
}
