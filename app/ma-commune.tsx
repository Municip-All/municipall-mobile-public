import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BrandedLogo from '@components/BrandedLogo';
import BottomBar from '@components/BottomBar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MaCommuneScreen() {
  const { dark, primaryColor, classes, colors, layoutStyles, brand, typeStyles } = useAppTheme();
  const { config, refreshConfig, loading } = useCity();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshConfig();
      setError(null);
    } catch {
      setError('Impossible de charger les informations de la commune.');
    }
    setRefreshing(false);
  }, [refreshConfig]);

  const profile = config?.publicProfile;
  const cityName = config?.officialName || config?.name || brand.appName;
  const appName = config?.name || brand.appName;
  const mayorTitle = profile?.mayorTitle?.trim() || 'Maire';
  const mayorName = profile?.mayorName?.trim();

  if (loading) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center'>
        <ActivityIndicator size='large' color={primaryColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center px-6'>
        <Text className={`text-center text-base ${classes.body}`} style={typeStyles.body}>{error}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            onRefresh();
          }}
          className='mt-4 rounded-xl px-6 py-3'
          style={{ backgroundColor: primaryColor }}>
          <Text className='font-bold' style={{ color: colors.onPrimary }}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={layoutStyles.page}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }>
        <TouchableOpacity
          onPress={() => router.back()}
          className='mb-4 flex-row items-center gap-1 self-start'
          hitSlop={12}
          accessibilityRole='button'
          accessibilityLabel='Retour'>
          <Ionicons name='chevron-back' size={22} color={primaryColor} />
          <Text style={{ color: primaryColor }} className='text-sm font-semibold'>
            Retour
          </Text>
        </TouchableOpacity>

        <View className={`mb-6 items-center p-8 ${classes.cardRounded}`} style={layoutStyles.cardRounded}>
          <BrandedLogo size={88} radius={44} mode='contain' />
          <Text
 className={`mt-4 text-center text-2xl font-extrabold`} style={{ color: colors.textPrimary }}>
            {cityName}
          </Text>
          {appName !== cityName && (
            <Text className={`mt-1 text-center ${classes.subtitle}`} style={typeStyles.subtitle}>Application {appName}</Text>
          )}
          {profile?.welcomeText ? (
            <Text className={`mt-4 text-center text-sm leading-6 ${classes.body}`} style={typeStyles.body}>
              {profile.welcomeText}
            </Text>
          ) : (
            <Text className={`mt-4 text-center text-sm leading-6 ${classes.body}`} style={typeStyles.body}>
              Bienvenue sur l&apos;application municipale de {cityName}. Retrouvez ici les services,
              l&apos;actualité et les démarches de votre commune.
            </Text>
          )}
        </View>

        {mayorName ? (
          <View className={`mb-4 p-5 ${classes.cardRounded}`} style={layoutStyles.cardRounded}>
            <Text className={`tracking-widest uppercase ${classes.caption}`} style={typeStyles.caption}>Élu référent</Text>
            <Text
 className={`mt-2 text-lg font-bold`} style={{ color: colors.textPrimary }}>
              {mayorName}
            </Text>
            <Text className={`mt-0.5 ${classes.subtitle}`} style={typeStyles.subtitle}>{mayorTitle}</Text>
          </View>
        ) : null}

        {profile?.description ? (
          <View className={`mb-4 p-5 ${classes.cardRounded}`} style={layoutStyles.cardRounded}>
            <Text
 className={`mb-2 text-sm font-bold`} style={{ color: colors.textPrimary }}>
              À propos
            </Text>
            <Text className={classes.body} style={typeStyles.body}>{profile.description}</Text>
          </View>
        ) : null}
        <View
          className={`mb-4 p-5 ${classes.cardRounded}`}
          accessibilityLabel='Informations pratiques' style={layoutStyles.cardRounded}>
          <Text
 className={`mb-3 text-sm font-bold`} style={{ color: colors.textPrimary }}>
            Informations pratiques
          </Text>
          {profile?.address ? (
            <View className='mb-3 flex-row gap-3'>
              <Ionicons name='location-outline' size={18} color={primaryColor} />
              <Text className={`flex-1 ${classes.body}`} style={typeStyles.body}>{profile.address}</Text>
            </View>
          ) : null}
          {profile?.openingHours ? (
            <View className='mb-3 flex-row gap-3'>
              <Ionicons name='time-outline' size={18} color={primaryColor} />
              <Text className={`flex-1 ${classes.body}`} style={typeStyles.body}>{profile.openingHours}</Text>
            </View>
          ) : null}
          {config?.contact?.phone ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${config.contact!.phone!.replace(/\s/g, '')}`)}
              className='mb-3 flex-row gap-3'>
              <Ionicons name='call-outline' size={18} color={primaryColor} />
              <Text style={{ color: primaryColor }} className='flex-1 text-sm font-semibold'>
                {config.contact.phone}
              </Text>
            </TouchableOpacity>
          ) : null}
          {config?.contact?.email ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(`mailto:${config.contact!.email}`)}
              className='mb-3 flex-row gap-3'>
              <Ionicons name='mail-outline' size={18} color={primaryColor} />
              <Text style={{ color: primaryColor }} className='flex-1 text-sm font-semibold'>
                {config.contact.email}
              </Text>
            </TouchableOpacity>
          ) : null}
          {profile?.website ? (
            <TouchableOpacity
              onPress={() => {
                const url = profile.website!.startsWith('http')
                  ? profile.website!
                  : `https://${profile.website}`;
                Linking.openURL(url);
              }}
              className='flex-row gap-3'>
              <Ionicons name='globe-outline' size={18} color={primaryColor} />
              <Text style={{ color: primaryColor }} className='flex-1 text-sm font-semibold'>
                Site de la mairie
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View className='flex-row flex-wrap gap-2'>
          <TouchableOpacity
            onPress={() => router.push('/contact')}
            className='flex-1 items-center rounded-xl py-4'
            style={{ backgroundColor: primaryColor, minWidth: '45%' }}
            accessibilityRole='button'
            accessibilityLabel='Contacter la mairie'>
            <Text className='text-sm font-bold' style={{ color: colors.onPrimary }}>
              Contacter la mairie
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/social')}
            className={`flex-1 items-center rounded-xl border py-4 ${ dark ? 'border-night-border bg-night-surface' : 'border-cream-200 bg-cream-50' }`}
            style={{ minWidth: '45%' }}
            accessibilityRole='button'
            accessibilityLabel='Vie associative'>
            <Text className={`text-sm font-bold`} style={{ color: colors.textPrimary }}>
              Vie associative
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
