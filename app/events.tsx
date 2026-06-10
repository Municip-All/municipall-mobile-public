import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventsService, CityEvent } from '../services/eventsService';

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

function categoryAccent(category: string, fallback: string): string {
  switch (category) {
    case 'Sport':
      return '#FF9500';
    case 'Social':
      return '#34C759';
    case 'Éducation':
      return '#5856D6';
    case 'Cérémonie':
      return '#007AFF';
    case 'Culture':
    default:
      return fallback;
  }
}

function EventCard({
  event,
  dark,
  primaryColor,
}: {
  event: CityEvent;
  dark: boolean;
  primaryColor: string;
}) {
  const accent = categoryAccent(event.category, primaryColor);

  return (
    <View
      className={`mb-4 overflow-hidden rounded-[28px] border shadow-sm ${
        dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-100 bg-white'
      }`}>
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} className='h-40 w-full' resizeMode='cover' />
      ) : null}
      <View className='p-6'>
        <View className='mb-4 flex-row items-center'>
          <View
            className='mr-4 h-12 w-12 items-center justify-center rounded-2xl'
            style={{ backgroundColor: `${accent}22` }}>
            <Ionicons name={categoryIcon(event.category)} size={24} color={accent} />
          </View>
          <View className='flex-1'>
            <Text className={`text-xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
              {event.title}
            </Text>
            <Text className={`text-sm font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {event.category}
            </Text>
          </View>
        </View>

        {event.description ? (
          <Text
            className={`mb-4 text-sm leading-5 ${dark ? 'text-zinc-300' : 'text-zinc-600'}`}
            numberOfLines={3}>
            {event.description}
          </Text>
        ) : null}

        <View className='mb-2 space-y-2'>
          <View className='flex-row items-center'>
            <Ionicons
              name='calendar-clear-outline'
              size={16}
              color={dark ? '#71717A' : '#A1A1AA'}
            />
            <Text
              className={`ml-2 text-sm font-medium ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {formatEventDateRange(event.startDate, event.endDate)}
            </Text>
          </View>
          <View className='flex-row items-center'>
            <Ionicons name='location-outline' size={16} color={dark ? '#71717A' : '#A1A1AA'} />
            <Text
              className={`ml-2 flex-1 text-sm font-medium ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}
              numberOfLines={2}>
              {event.location}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function Events() {
  const { dark, primaryColor, classes, layoutStyles } = useAppTheme();
  const { config, refreshConfig } = useCity();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('Tous');
  const [events, setEvents] = useState<CityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const agendaEnabled = config?.features?.includes('agenda') ?? false;

  const loadEvents = useCallback(async () => {
    if (!agendaEnabled) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await eventsService.getEvents();
      const now = Date.now();
      const upcoming = data
        .filter((e) => new Date(e.endDate).getTime() >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      setEvents(upcoming);
    } catch (e) {
      console.error(e);
      setError('Impossible de charger les événements.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [agendaEnabled]);

  useFocusEffect(
    useCallback(() => {
      refreshConfig();
      loadEvents();
    }, [loadEvents, refreshConfig])
  );

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'Tous') return events;
    return events.filter((e) => e.category === activeFilter);
  }, [events, activeFilter]);

  return (
    <View style={layoutStyles.page}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        <View className='mb-6'>
          <Text className={classes.eyebrow}>Agenda</Text>
          <Text
            className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
            Événements
          </Text>
          {config?.name ? (
            <Text className={`mt-1 text-sm ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {config.name}
            </Text>
          ) : null}
        </View>

        {!agendaEnabled ? (
          <View
            className={`rounded-[28px] border p-8 ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
            <Ionicons name='calendar-outline' size={40} color={primaryColor} />
            <Text className={`mt-4 text-lg font-bold ${dark ? 'text-white' : 'text-black'}`}>
              Agenda non activé
            </Text>
            <Text className={`mt-2 text-sm leading-5 ${classes.body}`}>
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
                    className={`mr-2 mb-2 rounded-full border px-5 py-2.5 ${
                      isActive
                        ? 'border-transparent'
                        : dark
                          ? 'border-zinc-800 bg-zinc-900'
                          : 'border-zinc-200 bg-white'
                    }`}
                    style={isActive ? { backgroundColor: primaryColor } : {}}>
                    <Text
                      className={`text-sm font-bold ${
                        isActive ? 'text-white' : dark ? 'text-zinc-400' : 'text-zinc-500'
                      }`}>
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
              <View
                className={`rounded-[28px] border p-6 ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                <Text className={classes.body}>{error}</Text>
                <TouchableOpacity onPress={loadEvents} className='mt-4'>
                  <Text style={{ color: primaryColor }} className='font-bold'>
                    Réessayer
                  </Text>
                </TouchableOpacity>
              </View>
            ) : filteredEvents.length === 0 ? (
              <View
                className={`items-center rounded-[28px] border p-8 ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                <Ionicons name='calendar-outline' size={36} color={dark ? '#52525B' : '#A1A1AA'} />
                <Text
                  className={`mt-4 text-center text-sm font-medium ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {activeFilter === 'Tous'
                    ? 'Aucun événement à venir pour le moment.'
                    : `Aucun événement dans la catégorie « ${activeFilter} ».`}
                </Text>
              </View>
            ) : (
              filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} dark={dark} primaryColor={primaryColor} />
              ))
            )}
          </>
        )}
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
