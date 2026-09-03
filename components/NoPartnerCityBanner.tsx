import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { openReferCityEmail } from '../lib/referCity';

type NoPartnerCityBannerProps = {
  compact?: boolean;
  onSelectCity?: () => void;
};

export default function NoPartnerCityBanner({ compact, onSelectCity }: NoPartnerCityBannerProps) {
  const { dark, primaryColor, classes, colors, typeStyles } = useAppTheme();
  const router = useRouter();

  if (compact) {
    return (
      <View
        className='mb-4 rounded-2xl border p-4'
        style={{
          borderColor: dark ? '#312E81' : '#E0E7FF',
          backgroundColor: dark ? '#1E1B4B66' : '#EEF2FF',
        }}>
        <Text className='text-sm font-bold' style={{ color: dark ? '#C7D2FE' : '#312E81' }}>
          Votre commune n&apos;est pas encore partenaire
        </Text>
        <Text
          className='mt-1 text-xs leading-5'
          style={{ color: dark ? '#A5B4FC' : '#4338CA' }}>
          Les services municipaux seront disponibles lorsque votre mairie rejoindra Municip&apos;All.
        </Text>
        <TouchableOpacity
          onPress={openReferCityEmail}
          className='mt-3'
          accessibilityRole='button'
          accessibilityLabel='Inviter ma mairie'>
          <Text className='text-xs font-bold' style={{ color: primaryColor }}>
            Inviter ma mairie
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className='mb-6 overflow-hidden rounded-[28px] border p-6'
      style={{
        borderColor: dark ? '#312E81' : '#E0E7FF',
        backgroundColor: dark ? colors.palette.nightSurface : '#FFFFFF',
      }}>
      <View
        className='mb-4 h-12 w-12 items-center justify-center rounded-2xl'
        style={{ backgroundColor: dark ? '#312E814D' : '#EEF2FF' }}>
        <Ionicons name='megaphone-outline' size={24} color='#6366F1' />
      </View>
      <Text className='text-lg font-black' style={{ color: colors.textPrimary }}>
        Commune non partenaire
      </Text>
      <Text className={`mt-2 text-sm leading-6 ${classes.body}`} style={typeStyles.body}>
        Votre compte Municip&apos;All est actif, mais les services de votre mairie (signalements,
        contact, collecte, événements…) ne sont disponibles que pour les communes partenaires.
      </Text>
      <Text className={`mt-2 text-sm leading-6 ${classes.body}`} style={typeStyles.body}>
        Invitez votre mairie à rejoindre la plateforme, ou sélectionnez votre commune si elle figure
        désormais dans la liste.
      </Text>
      <View className='mt-5 flex-row flex-wrap gap-3'>
        <TouchableOpacity
          onPress={openReferCityEmail}
          className='rounded-2xl px-5 py-3'
          style={{ backgroundColor: primaryColor }}
          accessibilityRole='button'
          accessibilityLabel='Inviter ma mairie'>
          <Text className='text-sm font-bold' style={{ color: colors.onPrimary }}>
            Inviter ma mairie
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (onSelectCity) {
              onSelectCity();
              return;
            }
            router.push('/profile');
          }}
          className='rounded-2xl border px-5 py-3'
          style={{ borderColor: colors.border }}
          accessibilityRole='button'
          accessibilityLabel='Choisir ma commune'>
          <Text className='text-sm font-bold' style={{ color: colors.textPrimary }}>
            Choisir ma commune
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
