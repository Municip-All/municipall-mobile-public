import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '@constants/design';

type CityNotListedChipProps = {
  onPress: () => void;
  dark: boolean;
};

export default function CityNotListedChip({ onPress, dark }: CityNotListedChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel='Pas dans les choix'
      accessibilityRole='button'
      className={`flex-row items-center gap-1.5 rounded-xl border border-dashed px-3 py-2 ${
        dark ? 'border-night-border bg-night-elevated' : 'border-cream-200 bg-cream-50'
      }`}>
      <Ionicons
        name='help-circle-outline'
        size={14}
        color={dark ? palette.nightMuted : palette.muted}
      />
      <Text className={`text-xs font-bold ${dark ? 'text-night-text' : 'text-charcoal'}`}>
        Pas dans les choix
      </Text>
    </TouchableOpacity>
  );
}
