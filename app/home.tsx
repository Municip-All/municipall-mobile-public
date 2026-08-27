import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { useHomeHighlights } from '@hooks/useHomeHighlights';
import type { HomeHighlight } from '../services/homeHighlights';
import BottomBar from '@components/BottomBar';
import BrandedLogo from '@components/BrandedLogo';
import FloatingMapButton from '@components/FloatingMapButton';
import ChatBotFloatingButton from '@components/ChatBotFloatingButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@context/authcontext';
import { ensureAuthenticatedForReport } from '../lib/requireAuthForReport';
import type { IconName, RouteHref } from '../lib/types';

export default function Home() {
  const { dark, primaryColor, classes, colors, brand, layoutStyles } = useAppTheme();
  const { config, weatherData, weatherLoading, weatherError, fetchWeather, refreshConfig } =
    useCity();
  const {
    highlights,
    loading: highlightsLoading,
    refresh: refreshHighlights,
  } = useHomeHighlights(config);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshHighlights(), refreshConfig(), fetchWeather()]);
    setRefreshing(false);
  }, [refreshHighlights, refreshConfig, fetchWeather]);

  useFocusEffect(
    useCallback(() => {
      refreshHighlights();
      void refreshConfig();
    }, [refreshHighlights, refreshConfig])
  );

  const iconBg = (item: HomeHighlight) => {
    switch (item.type) {
      case 'waste':
        return dark ? 'bg-night-elevated' : 'bg-matcha-100';
      case 'work':
        return item.iconColor === '#FF9500'
          ? dark
            ? 'bg-night-elevated'
            : 'bg-matcha-100'
          : dark
            ? 'bg-night-elevated'
            : 'bg-matcha-100';
      case 'event':
        return dark ? 'bg-night-elevated' : 'bg-matcha-100';
    }
  };
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const handleReport = () => {
    if (!ensureAuthenticatedForReport(isAuthenticated, router)) return;
    router.push({ pathname: '/carte', params: { action: 'report' } } as RouteHref);
  };

  const weatherEnabled = config?.features?.includes('weather') ?? false;
  const transportEnabled =
    (config?.isTransportFeatureAllowed && config?.isTransportFeatureEnabled) ?? false;

  const explorerItems = [
    { label: 'Ma commune', sub: 'Actualités et infos', icon: 'business', path: '/ma-commune' },
    { label: 'Événements', sub: 'Agenda citoyen', icon: 'calendar', path: '/events' },
    { label: 'Collecte', sub: 'Jours de ramassage', icon: 'trash', path: '/collecte' },
    { label: 'Social', sub: 'Associations', icon: 'heart', path: '/social' },
    ...(transportEnabled
      ? [{ label: 'Transports', sub: 'Horaires en temps réel', icon: 'bus', path: '/transport' }]
      : []),
    { label: 'Contact', sub: 'Écrire à la mairie', icon: 'chatbubble', path: '/contact' },
  ];

  const appDisplayName = brand.appName;
  const weatherLocation = weatherData?.city;

  return (
    <View style={layoutStyles.page}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }>
        <View className='mb-8 flex-row items-end justify-between'>
          <View>
            <Text className={classes.eyebrow}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
            <Text className={classes.title}>{appDisplayName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/ma-commune')}
            activeOpacity={0.85}
            accessibilityRole='button'
            accessibilityLabel='Ma commune'>
            <BrandedLogo size={48} radius={24} mode='contain' />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleReport}
          activeOpacity={0.9}
          className='shadow-soft mb-6'
          accessibilityRole='button'
          accessibilityLabel='Signaler un problème'>
          <View
            className='overflow-hidden rounded-[20px]'
            style={{ backgroundColor: primaryColor }}>
            <View className='flex-row items-center justify-between p-6'>
              <View className='flex-1 pr-4'>
                <Text
                  className='text-lg font-extrabold tracking-tight'
                  style={{ color: colors.onPrimary }}>
                  Un problème dans votre ville ?
                </Text>
                <Text
                  className='mt-1 text-sm leading-5 font-medium'
                  style={{ color: colors.onPrimary, opacity: 0.85 }}>
                  Signalez-le en quelques secondes, la mairie est notifiée instantanément.
                </Text>
              </View>
              <View
                className='h-14 w-14 items-center justify-center rounded-full'
                style={{ backgroundColor: `${colors.onPrimary}26` }}>
                <Ionicons name='add-circle' size={30} color={colors.onPrimary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {weatherEnabled && (
          <Pressable
            onPress={() => void fetchWeather()}
            disabled={weatherLoading}
            className='shadow-soft mb-6 rounded-[20px] active:opacity-90'
            accessibilityRole='button'
            accessibilityLabel='Actualiser la météo'>
            <BlurView
              intensity={dark ? 40 : 80}
              tint={dark ? 'dark' : 'light'}
              className='border-cream-200 dark:border-night-border overflow-hidden rounded-[20px] border'>
              <View className='flex-row items-center justify-between p-6' pointerEvents='none'>
                <View className='flex-1 pr-4'>
                  <Text className={classes.subtitle}>Météo</Text>
                  <Text
                    className={`mt-1 text-3xl font-bold ${dark ? 'text-night-text' : 'text-matcha-900'}`}>
                    {weatherLoading ? '...' : weatherData ? `${weatherData.temp}°` : '--°'}
                  </Text>
                  <Text
                    className={`text-sm font-medium ${dark ? 'text-night-muted' : 'text-muted'}`}>
                    {weatherLoading
                      ? 'Actualisation…'
                      : weatherError
                        ? weatherError
                        : weatherData?.description || 'Appuyez pour actualiser'}
                  </Text>
                  {weatherLocation &&
                    weatherLocation.toLowerCase() !== appDisplayName.toLowerCase() && (
                      <Text
                        className={`mt-1 text-xs font-medium ${dark ? 'text-night-muted' : 'text-muted'}`}>
                        {weatherLocation}
                      </Text>
                    )}
                </View>
                <View className='items-center'>
                  <Ionicons
                    name={
                      weatherLoading ? 'refresh' : weatherData ? 'cloud-outline' : 'partly-sunny'
                    }
                    size={48}
                    color={primaryColor}
                  />
                </View>
              </View>
            </BlurView>
          </Pressable>
        )}

        <View className='mb-8 flex-row flex-wrap justify-between gap-y-4'>
          {[
            {
              label: 'Signalement',
              icon: 'alert-circle',
              color: colors.destructive,
              path: '/demandes',
            },
            { label: 'Déchets', icon: 'trash', color: colors.success, path: '/collecte' },
            { label: 'Travaux', icon: 'construct', color: colors.warning, path: '/travaux' },
            ...(transportEnabled
              ? [{ label: 'Transports', icon: 'bus', color: colors.info, path: '/transport' }]
              : []),
            { label: 'Social', icon: 'heart', color: colors.accent, path: '/social' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(item.path as RouteHref)}
              className='w-[18%] min-w-[64px] items-center'
              accessibilityRole='button'
              accessibilityLabel={item.label}>
              <View
                className='shadow-soft mb-2 h-16 w-16 items-center justify-center rounded-2xl'
                style={{
                  backgroundColor: dark ? colors.palette.nightElevated : colors.palette.cream50,
                }}>
                <Ionicons name={item.icon as IconName} size={28} color={item.color} />
              </View>
              <Text className={classes.caption}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className={`mb-4 ${classes.sectionTitle}`}>À ne pas manquer</Text>

        {highlightsLoading ? (
          <View className='items-center py-8'>
            <ActivityIndicator color={primaryColor} />
          </View>
        ) : highlights.length === 0 ? (
          <View className={`mb-4 p-5 ${classes.cardRounded}`}>
            <Text className={classes.body}>
              Rien à signaler pour le moment. Consultez les travaux, la collecte ou les événements
              de votre ville.
            </Text>
          </View>
        ) : (
          highlights.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.path as RouteHref)}
              className={`mb-4 ${classes.cardRounded}`}>
              <View className='flex-row p-5'>
                <View
                  className={`mr-4 h-12 w-12 items-center justify-center rounded-full ${iconBg(item)}`}>
                  <Ionicons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <View className='flex-1'>
                  <Text
                    className={`text-base font-bold ${dark ? 'text-night-text' : 'text-charcoal'}`}>
                    {item.title}
                  </Text>
                  <Text className={`mt-1 ${classes.body}`}>{item.body}</Text>
                  <Text className={`mt-3 ${classes.meta}`}>{item.meta}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <Text className={`mb-4 ${classes.sectionTitle}`}>Explorer votre commune</Text>
        <View className='flex-row flex-wrap justify-between'>
          {explorerItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => router.push(item.path as RouteHref)}
              className='mb-4 w-[48.5%] active:opacity-80'
              accessibilityRole='button'
              accessibilityLabel={item.label}>
              <View
                className={`rounded-[20px] border p-5 ${
                  dark ? 'border-night-border bg-night-surface' : 'border-cream-200 bg-cream-50'
                }`}>
                <View
                  className='h-11 w-11 items-center justify-center rounded-full'
                  style={{
                    backgroundColor: dark ? colors.palette.nightElevated : colors.palette.matcha100,
                  }}>
                  <Ionicons
                    name={item.icon as IconName}
                    size={22}
                    color={dark ? colors.palette.matcha300 : colors.palette.matcha700}
                  />
                </View>
                <Text
                  className={`mt-3 text-base font-bold ${dark ? 'text-night-text' : 'text-matcha-900'}`}>
                  {item.label}
                </Text>
                <Text className={`mt-1 text-xs ${dark ? 'text-night-muted' : 'text-muted'}`}>
                  {item.sub}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <FloatingMapButton />
      <ChatBotFloatingButton bottomOffset={182} />
      <BottomBar />
    </View>
  );
}
