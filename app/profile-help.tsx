import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import ProfileScreenHeader from '@components/ProfileScreenHeader';

const FAQ = [
  {
    q: 'Comment signaler un problème dans ma ville ?',
    a: "Depuis l'onglet Carte ou l'accueil, créez un signalement en indiquant le lieu et une description. Vous pouvez joindre une photo.",
  },
  {
    q: 'Comment changer ma ville de résidence ?',
    a: 'Dans Profil, section « Ma Résidence », appuyez sur Modifier et sélectionnez votre commune.',
  },
  {
    q: 'Je ne reçois pas les notifications',
    a: 'Vérifiez les autorisations dans Réglages iOS/Android. Les alertes push nécessitent une version installée via TestFlight ou l’App Store.',
  },
];

export default function ProfileHelpScreen() {
  const { dark, classes, primaryColor, colors } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  const links = [
    {
      label: 'Contacter le support',
      icon: 'chatbubbles-outline' as const,
      color: '#007AFF',
      onPress: () => router.push('/contact'),
    },
    {
      label: 'Informations légales & RGPD',
      icon: 'shield-checkmark-outline' as const,
      color: '#34C759',
      onPress: () => router.push('/legal'),
    },
    {
      label: 'Site Municipall',
      icon: 'globe-outline' as const,
      color: '#FF9500',
      onPress: () => Linking.openURL('https://municipall.dev'),
    },
  ];

  return (
    <View className={`flex-1 ${classes.page}`}>
      <ProfileScreenHeader title="Centre d'aide" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
          paddingTop: 16,
        }}>
        <Text className={`mb-3 ml-1 ${classes.meta}`}>Questions fréquentes</Text>
        <View className={`mb-8 rounded-[24px] p-4 ${classes.listGroup}`}>
          {FAQ.map((item, i) => (
            <View
              key={item.q}
              className={
                i < FAQ.length - 1 ? 'mb-5 border-b border-zinc-50 pb-5 dark:border-zinc-800' : ''
              }>
              <Text className={`text-sm font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>
                {item.q}
              </Text>
              <Text className={`mt-2 ${classes.body}`}>{item.a}</Text>
            </View>
          ))}
        </View>

        <Text className={`mb-3 ml-1 ${classes.meta}`}>Liens utiles</Text>
        <View className={`overflow-hidden rounded-[24px] ${classes.listGroup}`}>
          {links.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              className={`flex-row items-center justify-between p-4 ${i < links.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
              <View className='flex-row items-center'>
                <View
                  className='mr-3 h-8 w-8 items-center justify-center rounded-lg'
                  style={{ backgroundColor: `${item.color}15` }}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <Text
                  className={`text-sm font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={16} color={colors.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL('mailto:support@municipall.dev?subject=Aide%20application%20Municipall')
          }
          className='mt-6 items-center rounded-2xl border border-zinc-200 py-4 dark:border-zinc-700'>
          <Text style={{ color: primaryColor }} className='text-base font-bold'>
            Écrire au support
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
