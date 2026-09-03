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
  const { dark, primaryColor, classes } = useAppTheme();
  const router = useRouter();

  if (compact) {
    return (
      <View
        className={`mb-4 rounded-2xl border p-4 ${dark ? 'border-indigo-900/50 bg-indigo-950/40' : 'border-indigo-100 bg-indigo-50'}`}>
        <Text className={`text-sm font-bold ${dark ? 'text-indigo-200' : 'text-indigo-900'}`}>
          Votre commune n&apos;est pas encore partenaire
        </Text>
        <Text className={`mt-1 text-xs leading-5 ${dark ? 'text-indigo-300/80' : 'text-indigo-700'}`}>
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
      className={`mb-6 overflow-hidden rounded-[28px] border p-6 ${dark ? 'border-indigo-900/50 bg-zinc-900' : 'border-indigo-100 bg-white'}`}>
      <View
        className={`mb-4 h-12 w-12 items-center justify-center rounded-2xl ${dark ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
        <Ionicons name='megaphone-outline' size={24} color='#6366F1' />
      </View>
      <Text className={`text-lg font-black ${dark ? 'text-white' : 'text-zinc-900'}`}>
        Commune non partenaire
      </Text>
      <Text className={`mt-2 text-sm leading-6 ${classes.body}`}>
        Votre compte Municip&apos;All est actif, mais les services de votre mairie (signalements,
        contact, collecte, événements…) ne sont disponibles que pour les communes partenaires.
      </Text>
      <Text className={`mt-2 text-sm leading-6 ${classes.body}`}>
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
          <Text className='text-sm font-bold text-white'>Inviter ma mairie</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (onSelectCity) {
              onSelectCity();
              return;
            }
            router.push('/profile');
          }}
          className={`rounded-2xl border px-5 py-3 ${dark ? 'border-zinc-700' : 'border-zinc-200'}`}
          accessibilityRole='button'
          accessibilityLabel='Choisir ma commune'>
          <Text className={`text-sm font-bold ${dark ? 'text-white' : 'text-zinc-800'}`}>
            Choisir ma commune
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
