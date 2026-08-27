import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';

const FloatingMapButton: React.FC = () => {
  const { primaryColor, colors } = useAppTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/carte')}
      activeOpacity={0.8}
      accessibilityLabel='Ouvrir la carte'
      accessibilityRole='button'
      style={[
        styles.button,
        {
          backgroundColor: colors.elevated,
          borderWidth: 1,
          borderColor: colors.border,
        },
        colors.softShadow,
      ]}>
      <Ionicons name='map' size={24} color={primaryColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    height: 54,
    width: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
});

export default FloatingMapButton;
