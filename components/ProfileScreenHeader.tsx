import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';
import { palette } from '@constants/design';

type Props = {
  title: string;
};

export default function ProfileScreenHeader({ title }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dark, classes } = useAppTheme();

  return (
    <View
      style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12 }}
      className={`border-b ${dark ? 'border-night-border' : 'border-cream-200'}`}>
      <View className='flex-row items-center'>
        <TouchableOpacity
          onPress={() => router.back()}
          className='mr-3 p-2'
          accessibilityLabel='Retour'
          accessibilityRole='button'>
          <Ionicons
            name='chevron-back'
            size={24}
            color={dark ? palette.nightText : palette.matcha900}
          />
        </TouchableOpacity>
        <Text
          className={`flex-1 text-lg font-bold ${dark ? 'text-night-text' : 'text-matcha-900'}`}>
          {title}
        </Text>
      </View>
      <Text className={`mt-1 ml-11 ${classes.meta}`}>Réglages du compte</Text>
    </View>
  );
}
