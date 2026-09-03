import { Text, type TextProps, type StyleProp, type TextStyle } from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';

type TypeVariant = keyof ReturnType<typeof useAppTheme>['typeStyles'];

type AppTextProps = TextProps & {
  variant?: TypeVariant;
  className?: string;
};

/**
 * Texte thématisé : typo NativeWind + couleur inline (fiable en mode sombre).
 */
export default function AppText({
  variant = 'body',
  className,
  style,
  ...rest
}: AppTextProps) {
  const { classes, typeStyles } = useAppTheme();
  const baseClass = (classes as Record<string, string>)[variant] ?? classes.body;
  const baseStyle = typeStyles[variant] ?? typeStyles.body;

  return (
    <Text
      className={[baseClass, className].filter(Boolean).join(' ')}
      style={[baseStyle as StyleProp<TextStyle>, style]}
      {...rest}
    />
  );
}
