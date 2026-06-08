import React from 'react';
import { Image, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@hooks/useAppTheme';

type BrandedLogoProps = {
  size?: number;
  radius?: number;
  backgroundColor?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  /** cover = avatar rond ; contain = logo municipal (recommandé) */
  mode?: 'cover' | 'contain';
};

/**
 * Logo communal avec repli gracieux — object-contain pour préserver les blasons.
 */
export default function BrandedLogo({
  size = 48,
  radius = 16,
  backgroundColor,
  iconColor,
  style,
  imageStyle,
  mode = 'contain',
}: BrandedLogoProps) {
  const { brand } = useAppTheme();
  const bg = backgroundColor ?? brand.primarySoft;
  const icon = iconColor ?? brand.primaryColor;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}>
      {brand.logoUrl ? (
        <Image
          source={{ uri: brand.logoUrl }}
          style={[
            {
              width: mode === 'contain' ? size * 0.78 : size,
              height: mode === 'contain' ? size * 0.78 : size,
            },
            imageStyle,
          ]}
          resizeMode={mode}
        />
      ) : (
        <Ionicons name='business' size={size * 0.45} color={icon} />
      )}
    </View>
  );
}
