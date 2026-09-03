import { useMemo } from 'react';
import { type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { DEFAULT_PRIMARY, palette, semanticColors, softShadow, tintColor } from '@constants/design';
import { buildBrandTheme } from '@constants/brand';

/**
 * Couleurs de texte / surfaces via StyleSheet — NativeWind + TW4 n'applique pas
 * de façon fiable les tokens custom (text-night-text, bg-night-surface, …).
 */
export function useAppTheme() {
  const { colorScheme, theme, setTheme } = useTheme();
  const { config } = useCity();
  const dark = colorScheme === 'dark';
  const brand = useMemo(() => buildBrandTheme(config), [config]);
  const hasCityColor = Boolean(config?.theme?.primaryColor?.trim());
  const primaryColor = useMemo(() => {
    if (hasCityColor) return brand.primaryColor;
    return dark ? palette.matcha500 : DEFAULT_PRIMARY;
  }, [hasCityColor, brand.primaryColor, dark]);

  const pageBackground = dark
    ? (brand.backgroundColorDark ?? semanticColors.surface.dark)
    : (brand.backgroundColorLight ?? semanticColors.surface.light);

  const pageAuthBackground = dark
    ? (brand.backgroundColorDark ?? semanticColors.surfaceAuth.dark)
    : (brand.backgroundColorLight ?? semanticColors.surfaceAuth.light);

  const textPrimary = dark ? palette.nightText : palette.matcha900;
  const textBody = dark ? '#F4F4F5' : palette.charcoal;
  /** Secondaire lisible sur fond sombre (évite le muted trop bas) */
  const textSecondary = dark ? '#D4D4D8' : palette.muted;
  const cardBg = dark ? palette.nightSurface : palette.cream50;
  const cardBorder = dark ? palette.nightBorder : palette.cream200;
  const elevatedBg = dark ? palette.nightElevated : palette.cream100;

  const layoutStyles = useMemo(
    () => ({
      page: { flex: 1, backgroundColor: pageBackground } satisfies ViewStyle,
      pageAuth: { flex: 1, backgroundColor: pageAuthBackground } satisfies ViewStyle,
      card: {
        backgroundColor: cardBg,
        borderColor: cardBorder,
        borderWidth: 1,
        borderRadius: 16,
      } satisfies ViewStyle,
      cardRounded: {
        backgroundColor: cardBg,
        borderColor: cardBorder,
        borderWidth: 1,
        borderRadius: 20,
        overflow: 'hidden',
      } satisfies ViewStyle,
      cardRoundedLg: {
        backgroundColor: cardBg,
        borderColor: cardBorder,
        borderWidth: 1,
        borderRadius: 20,
        overflow: 'hidden',
      } satisfies ViewStyle,
    }),
    [pageBackground, pageAuthBackground, cardBg, cardBorder]
  );

  /** Typo sans couleur (NativeWind) — toujours coupler avec typeStyles.* */
  const classes = useMemo(
    () => ({
      card: 'rounded-2xl border',
      cardRounded: 'overflow-hidden rounded-[20px] border',
      cardRoundedLg: 'overflow-hidden rounded-[20px] border',
      listGroup: 'overflow-hidden rounded-2xl border',
      eyebrow: 'text-xs font-semibold tracking-widest uppercase',
      title: 'text-4xl font-extrabold tracking-tight',
      sectionTitle: 'text-2xl font-bold',
      subtitle: 'text-sm font-medium',
      body: 'text-sm leading-5',
      meta: 'text-[11px] font-semibold',
      caption: 'text-[10px] font-semibold',
      chipInactive: 'border bg-transparent',
      input: 'rounded-xl border',
      formLabel: 'mb-3 mt-1 text-xs font-semibold tracking-widest uppercase',
      formField: 'rounded-xl border',
      formFieldText: 'text-base font-medium',
      chipUnselected: 'rounded-xl border px-6 py-3',
      chipUnselectedText: 'text-sm font-semibold',
      photoDropzone: 'rounded-2xl border-2 border-dashed',
      photoHint: 'mt-2 text-sm font-medium',
    }),
    []
  );

  const typeStyles = useMemo(
    () =>
      ({
        eyebrow: { color: textSecondary } satisfies TextStyle,
        title: { color: textPrimary } satisfies TextStyle,
        sectionTitle: { color: textPrimary } satisfies TextStyle,
        subtitle: { color: textSecondary } satisfies TextStyle,
        body: { color: textBody } satisfies TextStyle,
        meta: { color: textSecondary } satisfies TextStyle,
        caption: { color: textSecondary } satisfies TextStyle,
        formLabel: { color: textSecondary } satisfies TextStyle,
        formFieldText: { color: textPrimary } satisfies TextStyle,
        chipUnselectedText: { color: textBody } satisfies TextStyle,
        photoHint: { color: textSecondary } satisfies TextStyle,
        input: {
          color: textPrimary,
          borderColor: cardBorder,
          backgroundColor: cardBg,
        } satisfies TextStyle,
      }) as const,
    [textPrimary, textBody, textSecondary, cardBorder, cardBg]
  );

  const colors = useMemo(
    () => ({
      semantic: semanticColors,
      palette,
      primary: primaryColor,
      onPrimary: brand.onPrimary,
      primarySoft: brand.primarySoft,
      primaryTint: tintColor(primaryColor),
      textPrimary,
      textBody,
      textSecondary,
      iconMuted: textSecondary,
      chevron: textSecondary,
      text: textBody,
      surface: pageBackground,
      card: cardBg,
      elevated: elevatedBg,
      border: cardBorder,
      tabBar: dark ? palette.nightBg : palette.cream50,
      fabBorder: cardBorder,
      softShadow,
      destructive: semanticColors.destructive,
      info: semanticColors.info,
      success: dark ? semanticColors.successDark : semanticColors.success,
      warning: semanticColors.warning,
      accent: dark ? semanticColors.accent.dark : semanticColors.accent.light,
      points: semanticColors.points,
      placeholder: textSecondary,
      modalSheet: cardBg,
      handle: cardBorder,
    }),
    [
      dark,
      primaryColor,
      brand.onPrimary,
      brand.primarySoft,
      pageBackground,
      textPrimary,
      textBody,
      textSecondary,
      cardBg,
      cardBorder,
      elevatedBg,
    ]
  );

  return {
    dark,
    colorScheme,
    theme,
    setTheme,
    primaryColor,
    brand,
    classes,
    typeStyles,
    layoutStyles,
    colors,
    tintColor,
  };
}
