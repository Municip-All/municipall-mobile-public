import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';

const ChatBotFloatingButton: React.FC<{ bottomOffset?: number }> = ({ bottomOffset = 120 }) => {
  const { primaryColor, colors } = useAppTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/chat-bot')}
      activeOpacity={0.8}
      accessibilityLabel='Ouvrir le chat avec l’assistant municipal'
      accessibilityRole='button'
      style={[
        styles.button,
        { bottom: bottomOffset, backgroundColor: primaryColor },
        colors.softShadow,
      ]}>
      <Ionicons name='chatbubble-ellipses' size={22} color={colors.onPrimary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    height: 54,
    width: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
});

export default ChatBotFloatingButton;
