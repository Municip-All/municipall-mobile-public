import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@context/themecontext';

const EventsScreen: React.FC = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  return (
    <View className={`flex-1 items-center justify-center ${dark ? 'bg-black' : 'bg-white'}`}>
      <Text className={`${dark ? 'text-white' : 'text-black'} text-lg`}>Évènements (à venir)</Text>
    </View>
  );
};

export default EventsScreen;
