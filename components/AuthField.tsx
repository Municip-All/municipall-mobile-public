import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { useAppTheme } from '@hooks/useAppTheme';
import type { IconName, KeyboardType } from '../lib/types';

type AuthFieldProps = {
  label: string;
  icon: IconName;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardType;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
  dark: boolean;
  colors: ReturnType<typeof useAppTheme>['colors'];
  classes: ReturnType<typeof useAppTheme>['classes'];
  typeStyles: ReturnType<typeof useAppTheme>['typeStyles'];
};

export default function AuthField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  dark: _dark,
  colors,
  classes,
  typeStyles,
}: AuthFieldProps) {
  return (
    <View className='mb-5'>
      <Text className={classes.formLabel} style={typeStyles.formLabel}>
        {label}
      </Text>
      <View
        className={`flex-row items-center px-4 py-3.5 ${classes.formField}`}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}>
        <Ionicons name={icon} size={20} color={colors.iconMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={colors.placeholder}
          className={`ml-3 flex-1 text-base ${classes.formFieldText}`}
          style={{ color: colors.textPrimary }}
        />
        {showPasswordToggle ? (
          <Pressable
            onPress={onTogglePassword}
            hitSlop={12}
            accessibilityRole='button'
            accessibilityLabel={
              showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            }>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.iconMuted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
