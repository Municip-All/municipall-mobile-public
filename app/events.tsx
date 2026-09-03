import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/BottomBar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '@constants/design';
import { eventsService, CityEvent } from '../services/eventsService';
import { useCityServicesAccess } from '@hooks/useCityServicesAccess';
import NoPartnerCityBanner from '@components/NoPartnerCityBanner';
import { cityDisplayName } from '../lib/cityDisplay';

const FILTERS = ['Tous', 'Culture', 'Sport', 'Social', 'Éducation', 'Cérémonie'] as const;

function formatEventDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  };
  const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${start.toLocaleDateString('fr-FR', dateOpts)} • ${start.toLocaleTimeString('fr-FR', timeOpts)}`;
  }
  return `${start.toLocaleDateString('fr-FR', dateOpts)} → ${end.toLocaleDateString('fr-FR', dateOpts)}`;
}

function categoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  switch (category) {
    case 'Sport':
      return 'basketball';
    case 'Social':
      return 'people';
    case 'Éducation':
      return 'school';
    case 'Cérémonie':
      return 'business';
    case 'Culture':
    default:
      return 'color-palette';
  }
}

function categoryAccent(category: string, dark: boolean, fallback: string): string {
  switch (category) {
    case 'Sport':
      return palette.amber400;
    case 'Social':
      return dark ? palette.matcha300 : palette.matcha700;
    case 'Cérémonie':
      return palette.info400;
    case 'Éducation':
    case 'Culture':
    default:
      return fallback;
  }
}

function EventCard({ event }: { event: CityEvent }) {
  const { dark, primaryColor, classes, colors, typeStyles, layoutStyles } = useAppTheme();
  const accent = categoryAccent(event.category, dark, primaryColor);

  return (
    <View className={`shadow-soft mb-4 ${classes.cardRounded}`} style={layoutStyles.cardRounded}>
      {event.imageUrl ? (
        <Image
          source={{ uri: event.imageUrl }}
          className='h-40 w-full'
          resizeMode='cover'
          accessible={false}
          accessibilityElementsHidden
        />
      ) : null}
      <View className='p-6'>
        <View className='mb-4 flex-row items-center'>
          <View
            className='mr-4 h-12 w-12 items-center justify-center rounded-2xl'
            style={{ backgroundColor: `${accent}22` }}>
            <Ionicons name={categoryIcon(event.category)} size={24} color={accent} />
          </View>
          <View className='flex-1'>
            <Text className={`text-xl font-bold`} style={{ color: colors.textPrimary }}>
              {event.title}
            </Text>
            <Text className={classes.subtitle} style={typeStyles.subtitle}>{event.category}</Text>
          </View>
        </View>

        {event.description ? (
          <Text className={`mb-4 ${classes.body}`} numberOfLines={3} style={typeStyles.body}>
            {event.description}
          </Text>
        ) : null}

        <View className='mb-2 space-y-2'>
          <View className='flex-row items-center'>
            <Ionicons name='calendar-clear-outline' size={16} color={colors.iconMuted} />
            <Text className={`ml-2 ${classes.subtitle}`} style={typeStyles.subtitle}>
              {formatEventDateRange(event.startDate, event.endDate)}
            </Text>
          </View>
          <View className='flex-row items-center'>
            <Ionicons name='location-outline' size={16} color={colors.iconMuted} />
            <Text className={`ml-2 flex-1 ${classes.subtitle}`} numberOfLines={2} style={typeStyles.subtitle}>
              {event.location}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function Events() {
  const { primaryColor, classes, colors, layoutStyles, typeStyles } = useAppTheme();
  const { config, refreshConfig } = useCity();
  const { cityServicesEnabled, needsPartnerCity } = useCityServicesAccess();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('Tous');
  const [events, setEvents] = useState<CityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agendaEnabled =
    cityServicesEnabled && (config?.features?.includes('agenda') ?? false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      refreshConfig();
      setLoading(true);
      setError(null);
      eventsService
        .getEvents()
        .then((data) => {
          const now = Date.now();
          const upcoming = data
            .filter((e) => new Date(e.endDate).getTime() >= now)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
          if (!cancelled) setEvents(upcoming);
        })
        .catch(() => {
          if (!cancelled) {
            setError('Impossible de charger les événements.');
            setEvents([]);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [refreshConfig])
  );

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'Tous') return events;
    return events.filter((e) => e.category === activeFilter);
  }, [events, activeFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await eventsService.getEvents();
      const now = Date.now();
      const upcoming = data
        .filter((e) => new Date(e.endDate).getTime() >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      setEvents(upcoming);
      setError(null);
    } catch {
      setError('Impossible de charger les événements.');
    } finally {
      setRefreshing(false);
    }
  }, []);

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
        <View className='mb-6'>
          <Text className={classes.eyebrow} style={typeStyles.eyebrow}>Agenda</Text>
          <Text className={classes.title} style={typeStyles.title}>Événements</Text>
          {config ? (
            <Text className={`mt-1 ${classes.subtitle}`} style={typeStyles.subtitle}>{cityDisplayName(config)}</Text>
          ) : null}
        </View>

        {!cityServicesEnabled ? (
          needsPartnerCity ? (
            <NoPartnerCityBanner />
          ) : (
            <View className={`p-8 ${classes.cardRounded}`} style={layoutStyles.cardRounded}>
              <Text className={classes.body} style={typeStyles.body}>
                Les événements municipaux ne sont pas disponibles pour cette commune.
              </Text>
            </View>
          )
        ) : !agendaEnabled ? (
          <View className={`p-8 ${classes.cardRounded}`} style={layoutStyles.cardRounded}>
            <Ionicons name='calendar-outline' size={40} color={primaryColor} />
            <Text
 className={`mt-4 text-lg font-bold`} style={{ color: colors.textPrimary }}>
              Agenda non activé
            </Text>
            <Text className={`mt-2 ${classes.body}`} style={typeStyles.body}>
              Votre mairie peut activer l&apos;agenda culturel depuis le backoffice (Services GPS →
              Agenda culturel).
            </Text>
          </View>
        ) : (
          <>
            <View className='mb-8 flex-row flex-wrap'>
              {FILTERS.map((filter) => {
                const isActive = filter === activeFilter;
                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                    accessibilityRole='button'
                    accessibilityLabel={`Filtrer par ${filter}`}
                    className='mr-2 mb-2 rounded-full border px-5 py-2.5'
                    style={
                      isActive
                        ? { backgroundColor: primaryColor, borderColor: 'transparent' }
                        : {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          }
                    }>
                    <Text
                      className='text-sm font-bold'
                      style={{ color: isActive ? colors.onPrimary : colors.textPrimary }}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loading ? (
              <View className='items-center py-16'>
                <ActivityIndicator color={primaryColor} />
              </View>
            ) : error ? (
              <View className={`p-6 ${classes.cardRounded}`} style={layoutStyles.cardRounded}>
                <Text className={classes.body} style={typeStyles.body}>{error}</Text>
                <TouchableOpacity onPress={onRefresh} className='mt-4'>
                  <Text style={{ color: primaryColor }} className='font-bold'>
                    Réessayer
                  </Text>
                </TouchableOpacity>
              </View>
            ) : filteredEvents.length === 0 ? (
              <View className={`items-center p-8 ${classes.cardRounded}`} style={layoutStyles.cardRounded}>
                <Ionicons name='calendar-outline' size={36} color={colors.iconMuted} />
                <Text className={`mt-4 text-center ${classes.subtitle}`} style={typeStyles.subtitle}>
                  {activeFilter === 'Tous'
                    ? 'Aucun événement à venir pour le moment.'
                    : `Aucun événement dans la catégorie « ${activeFilter} ».`}
                </Text>
              </View>
            ) : (
              filteredEvents.map((event) => <EventCard key={event.id} event={event} />)
            )}
          </>
        )}
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
