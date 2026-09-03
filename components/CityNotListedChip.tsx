import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CityNotListedChipProps = {
  onPress: () => void;
  dark: boolean;
  selected?: boolean;
  primaryColor?: string;
};

export default function CityNotListedChip({
  onPress,
  dark,
  selected,
  primaryColor,
}: CityNotListedChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel="Ma commune n'est pas dans la liste"
      accessibilityRole='button'
      className={`flex-row items-center gap-1.5 rounded-xl border px-3 py-2 ${
        selected
          ? ''
          : `border-dashed ${dark ? 'border-zinc-600 bg-zinc-800/50' : 'border-zinc-300 bg-zinc-50'}`
      }`}
      style={
        selected && primaryColor
          ? { backgroundColor: primaryColor, borderColor: primaryColor, borderWidth: 1 }
          : undefined
      }>
      <Ionicons
        name='help-circle-outline'
        size={14}
        color={selected ? '#fff' : dark ? '#a1a1aa' : '#71717a'}
      />
      <Text
        className={`text-xs font-bold ${
          selected ? 'text-white' : dark ? 'text-zinc-300' : 'text-zinc-600'
        }`}>
        Pas dans les choix
      </Text>
    </TouchableOpacity>
  );
}
