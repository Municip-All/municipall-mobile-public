import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@context/themecontext';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, colorScheme } = useTheme();

  const toggleTheme = () => {
    setTheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const cycleTheme = () => {
    const order: ('system' | 'light' | 'dark')[] = ['system', 'light', 'dark'];
    const idx = order.indexOf(theme);
    const next = order[(idx + 1) % order.length];
    setTheme(next);
  };

  return (
    <View>
      <TouchableOpacity
        className='flex-row items-center justify-between rounded-xl bg-gray-100 p-3 dark:bg-gray-800'
        onPress={toggleTheme}
        onLongPress={cycleTheme}
        delayLongPress={300}
        accessibilityRole='button'
        accessibilityLabel='Changer le thème'>
        <View className='flex-row items-center'>
          <Ionicons
            name={colorScheme === 'dark' ? 'moon' : 'sunny'}
            size={20}
            color={colorScheme === 'dark' ? 'white' : 'black'}
          />
          <Text className='ml-3 text-base text-black dark:text-white'>
            {theme === 'system'
              ? 'Thème: Système'
              : `Thème: ${colorScheme === 'dark' ? 'Sombre' : 'Clair'}`}
          </Text>
        </View>
        <Text className='text-xs text-gray-500 dark:text-gray-400'>(appui long: cycle)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ThemeSelector;
