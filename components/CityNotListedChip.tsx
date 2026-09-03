import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@hooks/useAppTheme';

type CityNotListedChipProps = {
  onPress: () => void;
  dark?: boolean;
  selected?: boolean;
  primaryColor?: string;
};

export default function CityNotListedChip({
  onPress,
  selected,
  primaryColor,
}: CityNotListedChipProps) {
  const { colors } = useAppTheme();
  const accent = primaryColor ?? colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel="Ma commune n'est pas dans la liste"
      accessibilityRole='button'
      className='flex-row items-center gap-1.5 rounded-xl border px-3 py-2'
      style={
        selected
          ? { backgroundColor: accent, borderColor: accent, borderWidth: 1 }
          : {
              borderStyle: 'dashed',
              borderColor: colors.border,
              backgroundColor: colors.elevated,
              borderWidth: 1,
            }
      }>
      <Ionicons
        name='help-circle-outline'
        size={14}
        color={selected ? colors.onPrimary : colors.textSecondary}
      />
      <Text
        className='text-xs font-bold'
        style={{ color: selected ? colors.onPrimary : colors.textSecondary }}>
        Pas dans les choix
      </Text>
    </TouchableOpacity>
  );
}
