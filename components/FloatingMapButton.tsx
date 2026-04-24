import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';

const FloatingMapButton: React.FC = () => {
  const { colorScheme } = useTheme();
  const { config } = useCity();
  const router = useRouter();
  const dark = colorScheme === 'dark';
  const primaryColor = config?.theme.primaryColor || '#0B0080';

  return (
    <TouchableOpacity
      onPress={() => router.push('/carte')}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: dark ? '#2C2C2E' : '#FFFFFF',
          shadowColor: '#000',
        },
      ]}
      className='shadow-2xl'>
      <Ionicons name='map' size={24} color={primaryColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 120, // Adjusted to be above the bottom bar
    right: 20,
    height: 54,
    width: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 50,
  },
});

export default FloatingMapButton;
