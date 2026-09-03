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
import BottomBar from '@components/BottomBar';
import BrandedLogo from '@components/BrandedLogo';
import FloatingMapButton from '@components/FloatingMapButton';
import ChatBotFloatingButton from '@components/ChatBotFloatingButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@context/authcontext';
import { ensureCanReport } from '../lib/requireAuthForReport';
import { useCityServicesAccess } from '@hooks/useCityServicesAccess';
import NoPartnerCityBanner from '@components/NoPartnerCityBanner';
import { cityDisplayName } from '../lib/cityDisplay';
import type { IconName, RouteHref } from '../lib/types';

export default function Home() {
  const { dark, primaryColor, classes, colors, brand, layoutStyles, typeStyles } = useAppTheme();
  const { config, weatherData, weatherLoading, weatherError, fetchWeather, refreshConfig } =
    useCity();
  const { cityServicesEnabled, needsPartnerCity } = useCityServicesAccess();
  const {
    highlights,
    loading: highlightsLoading,
    refresh: refreshHighlights,
  } = useHomeHighlights(config, cityServicesEnabled);

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

  const iconBgColor = dark ? colors.elevated : colors.palette.matcha100;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  const handleReport = () => {
    if (!ensureCanReport(isAuthenticated, cityServicesEnabled, router)) return;
    router.push({ pathname: '/carte', params: { action: 'report' } } as RouteHref);
  };

  const weatherEnabled = cityServicesEnabled && (config?.features?.includes('weather') ?? false);
  const transportEnabled =
    cityServicesEnabled &&
    ((config?.isTransportFeatureAllowed && config?.isTransportFeatureEnabled) ?? false);

  /** Nom de commune (pas le libellé marque blanche type « Municip'All — … ») */
  const homeTitle = config ? cityDisplayName(config) : brand.appName;
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
        <View className='mb-8 flex-row items-end justify-between gap-3'>
          <View className='min-w-0 flex-1 pr-2'>
            <Text className={classes.eyebrow} style={typeStyles.eyebrow}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
            <Text className={classes.title} numberOfLines={2} style={typeStyles.title}>
              {homeTitle}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/ma-commune')}
            activeOpacity={0.85}
            accessibilityRole='button'
            accessibilityLabel='Ma commune'
            className='shrink-0'>
            <BrandedLogo
              size={48}
              radius={24}
              mode='contain'
              backgroundColor={dark ? colors.palette.nightElevated : '#FFFFFF'}
              style={
                dark
                  ? undefined
                  : {
                      borderWidth: 1,
                      borderColor: colors.palette.cream200,
                    }
              }
            />
          </TouchableOpacity>
        </View>

        {needsPartnerCity ? <NoPartnerCityBanner /> : null}

        {cityServicesEnabled ? (
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
        ) : null}

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
              className='overflow-hidden rounded-[20px] border'
              style={{
                borderColor: colors.border,
                backgroundColor: dark ? colors.card : 'rgba(255,255,255,0.72)',
              }}>
              <View className='flex-row items-center justify-between p-6' pointerEvents='none'>
                <View className='flex-1 pr-4'>
                  <Text className={classes.subtitle} style={typeStyles.subtitle}>
                    Météo
                  </Text>
                  <Text className='mt-1 text-3xl font-bold' style={{ color: colors.textPrimary }}>
                    {weatherLoading ? '...' : weatherData ? `${weatherData.temp}°` : '--°'}
                  </Text>
                  <Text className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                    {weatherLoading
                      ? 'Actualisation…'
                      : weatherError
                        ? weatherError
                        : weatherData?.description || 'Appuyez pour actualiser'}
                  </Text>
                  {weatherLocation &&
                    weatherLocation.toLowerCase() !== homeTitle.toLowerCase() && (
                      <Text
                        className='mt-1 text-xs font-medium'
                        style={{ color: colors.textSecondary }}>
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
                    color={dark ? colors.palette.nightText : primaryColor}
                  />
                </View>
              </View>
            </BlurView>
          </Pressable>
        )}

        {cityServicesEnabled ? (
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
                className='mb-2 h-16 w-16 items-center justify-center rounded-2xl'
                style={{
                  backgroundColor: dark ? colors.elevated : colors.palette.cream50,
                  borderWidth: dark ? 1 : 0,
                  borderColor: colors.border,
                }}>
                <Ionicons name={item.icon as IconName} size={28} color={item.color} />
              </View>
              <Text
                className='text-center text-[11px] font-semibold'
                style={{ color: colors.textPrimary }}
                numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        ) : null}

        {cityServicesEnabled ? (
        <Text className={`mb-4 ${classes.sectionTitle}`} style={typeStyles.sectionTitle}>À ne pas manquer</Text>
        ) : null}

        {cityServicesEnabled ? (
        highlightsLoading ? (
          <View className='items-center py-8'>
            <ActivityIndicator color={primaryColor} />
          </View>
        ) : highlights.length === 0 ? (
          <View className={`mb-4 p-5 ${classes.cardRounded}`} style={layoutStyles.cardRounded}>
            <Text className={classes.body} style={typeStyles.body}>
              Rien à signaler pour le moment. Consultez les travaux, la collecte ou les événements
              de votre ville.
            </Text>
          </View>
        ) : (
          highlights.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.path as RouteHref)}
              className={`mb-4 ${classes.cardRounded}`}
              style={layoutStyles.cardRounded}>
              <View className='flex-row p-5'>
                <View
                  className='mr-4 h-12 w-12 items-center justify-center rounded-full'
                  style={{ backgroundColor: iconBgColor }}>
                  <Ionicons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <View className='flex-1'>
                  <Text className='text-base font-bold' style={{ color: colors.textPrimary }}>
                    {item.title}
                  </Text>
                  <Text className={`mt-1 ${classes.body}`} style={typeStyles.body}>
                    {item.body}
                  </Text>
                  <Text className={`mt-3 ${classes.meta}`} style={typeStyles.meta}>
                    {item.meta}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )
        ) : null}
      </ScrollView>

      <FloatingMapButton />
      <ChatBotFloatingButton bottomOffset={182} />
      <BottomBar />
    </View>
  );
}
