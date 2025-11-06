import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@context/themecontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';

type EventItem = {
  id: string;
  title: string;
  date: string; // ISO date or display
  time?: string;
  location: string;
  tags?: string[];
  description?: string;
};

const Tag: React.FC<{ label: string }> = ({ label }) => (
  <View className='mr-2 rounded-full bg-black/5 px-2 py-0.5 dark:bg-white/10'>
    <Text className='text-xs text-gray-700 dark:text-gray-200'>{label}</Text>
  </View>
);

const EventCard: React.FC<{ item: EventItem; dark: boolean }> = ({ item, dark }) => {
  return (
    <View
      className={`mx-3 mb-4 rounded-2xl p-4 shadow-sm ${dark ? 'bg-zinc-800' : 'bg-white'}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
      }}>
      <View className='flex-row items-center justify-between'>
        <Text className={`flex-1 text-base font-semibold ${dark ? 'text-white' : 'text-black'}`}>
          {item.title}
        </Text>
        <View className='ml-2 rounded-full bg-blue-500/10 px-2 py-1'>
          <Text className='text-xs font-medium text-blue-600 dark:text-blue-400'>
            {item.date}
            {item.time ? ` • ${item.time}` : ''}
          </Text>
        </View>
      </View>

      {!!item.tags?.length && (
        <View className='mt-2 flex-row flex-wrap'>
          {item.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </View>
      )}

      <View className='mt-3 flex-row items-center'>
        <Ionicons name='location-outline' size={16} color={dark ? '#cbd5e1' : '#475569'} />
        <Text className={`ml-1 text-[13px] ${dark ? 'text-gray-300' : 'text-slate-600'}`}>
          {item.location}
        </Text>
      </View>

      {!!item.description && (
        <Text className={`mt-3 text-[13px] leading-5 ${dark ? 'text-gray-200' : 'text-slate-700'}`}>
          {item.description}
        </Text>
      )}

      <View className='mt-4 flex-row justify-end space-x-3'>
        <TouchableOpacity
          className='rounded-full bg-blue-500/10 px-3 py-1.5'
          accessibilityRole='button'
          accessibilityLabel={`Ajouter ${item.title} au calendrier`}>
          <Text className='text-xs font-medium text-blue-600 dark:text-blue-400'>Calendrier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className='rounded-full bg-emerald-500/10 px-3 py-1.5'
          accessibilityRole='button'
          accessibilityLabel={`Participer à ${item.title}`}>
          <Text className='text-xs font-medium text-emerald-600 dark:text-emerald-400'>
            Je participe
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EventsScreen: React.FC = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const data = useMemo<EventItem[]>(
    () => [
      {
        id: '1',
        title: 'Atelier compostage - Quartier Est',
        date: 'Sam. 15 Nov',
        time: '10:00',
        location: 'Parc des Lilas, 12e',
        tags: ['Compost', 'Atelier'],
        description:
          'Rejoignez-nous pour un atelier pratique sur le compostage : tri, bonnes pratiques et astuces.',
      },
      {
        id: '2',
        title: 'Journée propreté & sensibilisation',
        date: 'Dim. 23 Nov',
        time: '14:00',
        location: 'Place de la République',
        tags: ['Sensibilisation', 'Propreté'],
        description:
          'Stand d’information, distribution de kits, échanges avec les habitants et bénévoles.',
      },
      {
        id: '3',
        title: 'Visite site de tri - Portes ouvertes',
        date: 'Mer. 3 Déc',
        location: 'Centre de tri Ivry',
        tags: ['Tri', 'Découverte'],
      },
    ],
    []
  );

  return (
    <View className={`flex-1 ${dark ? 'bg-zinc-900' : 'bg-slate-50'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className='px-4 pt-6'>
        <View className='mx-4 my-16 mb-4 flex-row items-center justify-between'>
          <View>
            <Text className={`text-xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
              Évènements
            </Text>
            <Text className={`mt-1 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
              Prochains rendez-vous municipaux et citoyens
            </Text>
          </View>
          <View className='flex-row items-center space-x-2'>
            <TouchableOpacity className='rounded-full bg-white p-2 shadow dark:bg-zinc-800'>
              <Ionicons name='filter-outline' size={18} color={dark ? '#e5e7eb' : '#0f172a'} />
            </TouchableOpacity>
            <TouchableOpacity className='rounded-full bg-white p-2 shadow dark:bg-zinc-800'>
              <Ionicons name='search-outline' size={18} color={dark ? '#e5e7eb' : '#0f172a'} />
            </TouchableOpacity>
          </View>
        </View>

        {data.map((item) => (
          <EventCard key={item.id} item={item} dark={dark} />
        ))}

        <View className='mt-6 items-center'>
          <Text className={`text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
            Plus d’évènements bientôt…
          </Text>
        </View>
      </ScrollView>

      <BottomBar />
    </View>
  );
};

export default EventsScreen;
