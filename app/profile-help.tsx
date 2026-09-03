import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import ProfileScreenHeader from '@components/ProfileScreenHeader';
import { Config } from '../constants/Config';

const FAQ = [
  {
    q: 'Comment signaler un problème dans ma ville ?',
    a: "Depuis l'onglet Carte ou l'accueil, créez un signalement en indiquant le lieu et une description. Vous pouvez joindre une photo. La mairie peut vous répondre dans la conversation du signalement (onglet Signalements).",
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
  const { dark, classes, primaryColor, colors, layoutStyles, typeStyles } = useAppTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated && !authLoading) {
      if (!cancelled) {
        setAuthError(true);
        router.replace('/login');
      }
    }
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading, router]);

  if (!isAuthenticated) {
    if (authLoading) {
      return (
        <View style={layoutStyles.page} className='items-center justify-center'>
          <ActivityIndicator color={primaryColor} />
        </View>
      );
    }
    if (authError) {
      return (
        <View style={layoutStyles.page} className='items-center justify-center px-6'>
          <Text className={`text-center text-base ${classes.body}`} style={typeStyles.body}>
            Vous devez être connecté pour accéder à cette page.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/login')}
            accessibilityRole='button'
            accessibilityLabel='Se connecter'
            className='mt-4 rounded-xl px-6 py-3'
            style={{ backgroundColor: primaryColor }}>
            <Text className='font-bold' style={{ color: colors.onPrimary }}>
              Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }

  const links = [
    {
      label: 'Contacter le support',
      icon: 'chatbubbles-outline' as const,
      color: colors.info,
      onPress: () => router.push('/contact'),
    },
    {
      label: 'Informations légales & RGPD',
      icon: 'shield-checkmark-outline' as const,
      color: colors.success,
      onPress: () => router.push('/legal'),
    },
    {
      label: 'Site Municipall',
      icon: 'globe-outline' as const,
      color: colors.warning,
      onPress: () => Linking.openURL(Config.WEBSITE_URL),
    },
  ];

  return (
    <View style={layoutStyles.page}>
      <ProfileScreenHeader title="Centre d'aide" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
          paddingTop: 16,
        }}>
        <Text className={`mb-3 ml-1 ${classes.meta}`} style={typeStyles.meta}>Questions fréquentes</Text>
        <View className={`mb-8 p-4 ${classes.listGroup}`}>
          {FAQ.map((item, i) => (
            <View
              key={item.q}
              className={
                i < FAQ.length - 1
                  ? `mb-5 border-b pb-5 ${dark ? 'border-night-border' : 'border-cream-200'}`
                  : ''
              }>
              <Text className={`text-sm font-bold`} style={{ color: colors.textPrimary }}>
                {item.q}
              </Text>
              <Text className={`mt-2 ${classes.body}`} style={typeStyles.body}>{item.a}</Text>
            </View>
          ))}
        </View>

        <Text className={`mb-3 ml-1 ${classes.meta}`} style={typeStyles.meta}>Liens utiles</Text>
        <View className={classes.listGroup}>
          {links.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              accessibilityLabel={item.label}
              accessibilityRole='button'
              className={`flex-row items-center justify-between p-4 ${i < links.length - 1 ? `border-b ${dark ? 'border-night-border' : 'border-cream-200'}` : ''}`}>
              <View className='flex-row items-center'>
                <View
                  className='mr-3 h-8 w-8 items-center justify-center rounded-lg'
                  style={{ backgroundColor: `${item.color}15` }}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <Text
 className={`text-sm font-semibold`} style={{ color: colors.textBody }}>
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
          accessibilityLabel='Écrire au support par e-mail'
          accessibilityRole='button'
          className='border-cream-200 dark:border-night-border mt-6 items-center rounded-xl border py-4'>
          <Text style={{ color: primaryColor }} className='text-base font-bold'>
            Écrire au support
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
