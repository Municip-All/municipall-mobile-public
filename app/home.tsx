import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { useHomeHighlights } from '@hooks/useHomeHighlights';
import type { HomeHighlight } from '../services/homeHighlights';
import BottomBar from '@components/bottombar';
import BrandedLogo from '@components/BrandedLogo';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const { dark, primaryColor, classes, brand, layoutStyles } = useAppTheme();
  const { config, weatherData, weatherLoading, weatherError, fetchWeather, refreshConfig } =
    useCity();
  const {
    highlights,
    loading: highlightsLoading,
    refresh: refreshHighlights,
  } = useHomeHighlights(config);

  useFocusEffect(
    useCallback(() => {
      refreshHighlights();
      void refreshConfig();
    }, [refreshHighlights, refreshConfig])
  );

  const iconBg = (item: HomeHighlight) => {
    switch (item.type) {
      case 'waste':
        return dark ? 'bg-green-900/30' : 'bg-green-100';
      case 'work':
        return item.iconColor === '#FF9500'
          ? dark
            ? 'bg-orange-900/30'
            : 'bg-orange-100'
          : dark
            ? 'bg-blue-900/30'
            : 'bg-blue-100';
      case 'event':
        return dark ? 'bg-purple-900/30' : 'bg-purple-100';
    }
  };
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const weatherEnabled = config?.features?.includes('weather') ?? false;
  const transportEnabled =
    (config?.isTransportFeatureAllowed && config?.isTransportFeatureEnabled) ?? false;
  /** Nom d'app marque blanche (backoffice) — pas le libellé météo géolocalisé */
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
        showsVerticalScrollIndicator={false}>
        {/* Apple Style Header */}
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
          <TouchableOpacity onPress={() => router.push('/ma-commune')} activeOpacity={0.85}>
            <BrandedLogo size={48} radius={24} mode='contain' />
          </TouchableOpacity>
        </View>

        {weatherEnabled && (
          <Pressable
            onPress={() => void fetchWeather()}
            disabled={weatherLoading}
            className='mb-6 rounded-[28px] shadow-sm active:opacity-90'
            accessibilityRole='button'
            accessibilityLabel='Actualiser la météo'>
            <BlurView
              intensity={dark ? 40 : 80}
              tint={dark ? 'dark' : 'light'}
              className='overflow-hidden rounded-[28px] border border-white/20 dark:border-zinc-800/50'>
              <View className='flex-row items-center justify-between p-6' pointerEvents='none'>
                <View className='flex-1 pr-4'>
                  <Text className={classes.subtitle}>Météo</Text>
                  <Text className={`mt-1 text-3xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
                    {weatherLoading ? '...' : weatherData ? `${weatherData.temp}°` : '--°'}
                  </Text>
                  <Text
                    className={`text-sm font-medium ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    {weatherLoading
                      ? 'Actualisation…'
                      : weatherError
                        ? weatherError
                        : weatherData?.description || 'Appuyez pour actualiser'}
                  </Text>
                  {weatherLocation &&
                    weatherLocation.toLowerCase() !== appDisplayName.toLowerCase() && (
                      <Text
                        className={`mt-1 text-xs font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
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

        {/* Quick Actions Grid */}
        <View className='mb-8 flex-row flex-wrap justify-between gap-y-4'>
          {[
            { label: 'Signalement', icon: 'alert-circle', color: '#FF3B30', path: '/demandes' },
            { label: 'Déchets', icon: 'trash', color: '#34C759', path: '/collecte' },
            { label: 'Travaux', icon: 'construct', color: '#FF9500', path: '/travaux' },
            ...(transportEnabled
              ? [{ label: 'Transports', icon: 'bus', color: '#007AFF', path: '/transport' }]
              : []),
            { label: 'Social', icon: 'heart', color: '#AF52DE', path: '/social' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(item.path as any)}
              className='w-[18%] min-w-[64px] items-center'>
              <View
                className='mb-2 h-16 w-16 items-center justify-center rounded-2xl shadow-sm'
                style={{ backgroundColor: dark ? '#1C1C1E' : '#FFFFFF' }}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
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
              onPress={() => router.push(item.path as any)}
              className={`mb-4 ${classes.cardRounded}`}>
              <View className='flex-row p-5'>
                <View
                  className={`mr-4 h-12 w-12 items-center justify-center rounded-full ${iconBg(item)}`}>
                  <Ionicons name={item.icon} size={24} color={item.iconColor} />
                </View>
                <View className='flex-1'>
                  <Text className={`text-base font-bold ${dark ? 'text-white' : 'text-zinc-900'}`}>
                    {item.title}
                  </Text>
                  <Text className={`mt-1 ${classes.body}`}>{item.body}</Text>
                  <Text className={`mt-3 ${classes.meta}`}>{item.meta}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
