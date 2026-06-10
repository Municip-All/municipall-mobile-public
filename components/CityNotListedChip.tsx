import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type CityNotListedChipProps = {
  onPress: () => void;
  dark: boolean;
};

export default function CityNotListedChip({ onPress, dark }: CityNotListedChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`flex-row items-center gap-1.5 rounded-xl border border-dashed px-3 py-2 ${
        dark ? 'border-zinc-600 bg-zinc-800/50' : 'border-zinc-300 bg-zinc-50'
      }`}>
      <Ionicons name='help-circle-outline' size={14} color={dark ? '#a1a1aa' : '#71717a'} />
      <Text className={`text-xs font-bold ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>
        Pas dans les choix
      </Text>
    </TouchableOpacity>
  );
}
