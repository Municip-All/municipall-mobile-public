import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, dark, primaryColor, classes } = useAppTheme();

  const options = [
    { id: 'light' as const, label: 'Clair' },
    { id: 'dark' as const, label: 'Sombre' },
    { id: 'system' as const, label: 'Système' },
  ];

  return (
    <View className={`rounded-2xl p-1 ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-200 dark:border-zinc-800`}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          onPress={() => setTheme(option.id)}
          className={`rounded-xl px-4 py-3 ${theme === option.id ? (dark ? 'bg-zinc-800' : 'bg-zinc-100') : ''}`}>
          <Text
            className={`text-sm font-semibold ${theme === option.id ? (dark ? 'text-white' : 'text-black') : dark ? 'text-zinc-400' : 'text-zinc-600'}`}
            style={theme === option.id ? { color: primaryColor } : undefined}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ThemeSelector;
