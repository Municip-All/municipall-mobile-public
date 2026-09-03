import { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/BottomBar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { getNextCollection, formatCollectionDay } from '../utils/wasteSchedule';
import type { IconName } from '../lib/types';
import { useCityServicesAccess } from '@hooks/useCityServicesAccess';
import NoPartnerCityBanner from '@components/NoPartnerCityBanner';

export default function Collecte() {
  const { dark, primaryColor, classes, colors, layoutStyles, typeStyles } = useAppTheme();
  const { config, refreshConfig, loading, fetchWeather } = useCity();
  const { cityServicesEnabled, needsPartnerCity } = useCityServicesAccess();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshConfig();
      await fetchWeather();
      setError(null);
    } catch {
      setError('Impossible de charger les données.');
    }
    setRefreshing(false);
  }, [refreshConfig, fetchWeather]);

  const schedule = config?.wasteConfig?.services || [
    {
      type: 'Ordures ménagères',
      days: [1, 4],
      time: '19:00',
      icon: 'trash',
      color: colors.iconMuted,
    },
    {
      type: 'Emballages & Papiers',
      days: [3],
      time: '08:30',
      icon: 'refresh',
      color: colors.points,
    },
  ];

  const next = getNextCollection(schedule);

  const formatNextDate = (date: Date) => {
    const label = formatCollectionDay(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const formatDays = (days: number[]) => {
    const dayMap: Record<number, string> = {
      1: 'Lun',
      2: 'Mar',
      3: 'Mer',
      4: 'Jeu',
      5: 'Ven',
      6: 'Sam',
      0: 'Dim',
    };
    return days.map((d) => dayMap[d]).join(', ');
  };

  if (loading) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center'>
        <ActivityIndicator size='large' color={primaryColor} />
      </View>
    );
  }

  if (!cityServicesEnabled) {
    return (
      <View style={layoutStyles.page}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 20,
            paddingBottom: 120,
            paddingHorizontal: 20,
          }}>
          <Text className={classes.eyebrow} style={typeStyles.eyebrow}>
            Environnement
          </Text>
          <Text className={`mb-6 ${classes.title}`} style={typeStyles.title}>
            Collecte
          </Text>
          {needsPartnerCity ? (
            <NoPartnerCityBanner />
          ) : (
            <Text style={{ color: colors.textSecondary }}>
              Les horaires de collecte ne sont pas disponibles pour cette commune.
            </Text>
          )}
        </ScrollView>
        <BottomBar />
      </View>
    );
  }

  if (error) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center px-6'>
        <Text className={`text-center text-base`} style={{ color: colors.textBody }}>
          {error}
        </Text>
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
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
        }>
        <View className='mb-8'>
          <Text className={classes.eyebrow} style={typeStyles.eyebrow}>Services</Text>
          <Text className={classes.title} style={typeStyles.title}>Collecte</Text>
        </View>

        <View className='shadow-soft mb-8 rounded-[20px]'>
          <BlurView
            intensity={dark ? 40 : 80}
            tint={dark ? 'dark' : 'light'}
            className={`overflow-hidden rounded-[20px] border ${ dark ? 'border-night-border' : 'border-cream-200' }`}>
            <View className='p-6'>
              <Text className={classes.subtitle} style={typeStyles.subtitle}>Prochaine collecte</Text>
              <Text className={`mt-1 ${classes.sectionTitle}`} style={typeStyles.sectionTitle}>
                {next
                  ? `${formatNextDate(next.date)}, ${next.date.getHours()}h${next.date.getMinutes().toString().padStart(2, '0')}`
                  : 'Aucune collecte prévue'}
              </Text>
              {next && (
                <View
                  className='mt-3 flex-row items-center self-start rounded-full px-3 py-1'
                  style={{ backgroundColor: `${next.service.color}20` }}>
                  <Ionicons
                    name={next.service.icon as IconName}
                    size={14}
                    color={next.service.color}
                  />
                  <Text className='ml-2 text-xs font-bold' style={{ color: next.service.color }}>
                    {next.service.type}
                  </Text>
                </View>
              )}
            </View>
          </BlurView>
        </View>

        <Text className={`mb-4 ${classes.sectionTitle}`} style={typeStyles.sectionTitle}>Calendrier</Text>
        <View className={`shadow-soft ${classes.listGroup}`}>
          {schedule.map((item, i) => (
            <View
              key={i}
              accessibilityLabel={`${item.type}, ${formatDays(item.days)} à ${item.time}`}
              className={`flex-row items-center p-5 ${ i !== schedule.length - 1 ? `border-b ${dark ? 'border-night-border' : 'border-cream-200'}` : '' }`}>
              <View
                className='mr-4 h-12 w-12 items-center justify-center rounded-2xl'
                style={{ backgroundColor: `${item.color}15` }}>
                <Ionicons name={item.icon as IconName} size={24} color={item.color} />
              </View>
              <View className='flex-1'>
                <Text
 className={`text-base font-bold`} style={{ color: colors.textPrimary }}>
                  {item.type}
                </Text>
                <Text className={`mt-0.5 ${classes.subtitle}`} style={typeStyles.subtitle}>
                  {formatDays(item.days)} • {item.time}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View
          className={`mt-8 rounded-[20px] border border-transparent p-6 ${ dark ? 'bg-night-elevated' : 'bg-cream-100' }`}>
          <View className='mb-2 flex-row items-center'>
            <Ionicons name='information-circle' size={20} color={primaryColor} />
            <Text
 className={`ml-2 text-sm font-bold`} style={{ color: colors.textPrimary }}>
              Consignes de tri
            </Text>
          </View>
          <Text className={`text-xs leading-5`} style={{ color: colors.textSecondary }}>
            Pensez à sortir vos bacs la veille au soir. Les couvercles doivent être fermés. Pour les
            encombrants, merci de les déposer sur le trottoir sans gêner le passage.
          </Text>
        </View>
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
