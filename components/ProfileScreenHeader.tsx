import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';

type Props = {
  title: string;
};

export default function ProfileScreenHeader({ title }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { classes, typeStyles, colors } = useAppTheme();

  return (
    <View
      className='border-b'
      style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderColor: colors.border,
      }}>
      <View className='flex-row items-center'>
        <TouchableOpacity
          onPress={() => router.back()}
          className='mr-3 p-2'
          accessibilityLabel='Retour'
          accessibilityRole='button'>
          <Ionicons name='chevron-back' size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className='flex-1 text-lg font-bold' style={{ color: colors.textPrimary }}>
          {title}
        </Text>
      </View>
      <Text className={`mt-1 ml-11 ${classes.meta}`} style={typeStyles.meta}>
        Réglages du compte
      </Text>
    </View>
  );
}
