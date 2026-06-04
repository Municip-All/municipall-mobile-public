import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';

const FloatingMapButton: React.FC = () => {
  const { dark, primaryColor, colors } = useAppTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/carte')}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: colors.elevated,
          borderWidth: 1,
          borderColor: dark ? '#3F3F46' : '#E4E4E7',
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
