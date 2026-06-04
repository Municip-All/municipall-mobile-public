import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { getNextCollection, formatCollectionDay } from '../utils/wasteSchedule';

export default function Collecte() {
  const { dark, primaryColor, classes } = useAppTheme();
  const { config } = useCity();
  const insets = useSafeAreaInsets();

  const schedule = config?.wasteConfig?.services || [
    { type: 'Ordures ménagères', days: [1, 4], time: '19:00', icon: 'trash', color: '#8E8E93' },
    { type: 'Emballages & Papiers', days: [3], time: '08:30', icon: 'refresh', color: '#FFD60A' },
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

  return (
    <View className={`flex-1 ${classes.page}`}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Apple Style Header */}
        <View className='mb-8'>
          <Text
            className={`text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Services
          </Text>
          <Text
            className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
            Collecte
          </Text>
        </View>

        {/* Next Collection Card */}
        <View className='mb-8 shadow-sm'>
          <BlurView
            intensity={dark ? 40 : 80}
            tint={dark ? 'dark' : 'light'}
            className='overflow-hidden rounded-[28px] border border-white/20 dark:border-zinc-800/50'>
            <View className='p-6'>
              <Text className={`text-sm font-semibold ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Prochaine collecte
              </Text>
              <Text className={`mt-1 text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
                {next
                  ? `${formatNextDate(next.date)}, ${next.date.getHours()}h${next.date.getMinutes().toString().padStart(2, '0')}`
                  : 'Aucune collecte prévue'}
              </Text>
              {next && (
                <View
                  className='mt-3 flex-row items-center self-start rounded-full px-3 py-1'
                  style={{ backgroundColor: `${next.service.color}20` }}>
                  <Ionicons name={next.service.icon as any} size={14} color={next.service.color} />
                  <Text className='ml-2 text-xs font-bold' style={{ color: next.service.color }}>
                    {next.service.type}
                  </Text>
                </View>
              )}
            </View>
          </BlurView>
        </View>

        {/* Schedule List */}
        <Text className={`mb-4 text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
          Calendrier
        </Text>
        <View
          className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
          {schedule.map((item, i) => (
            <View
              key={i}
              className={`flex-row items-center p-5 ${i !== schedule.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
              <View
                className='mr-4 h-12 w-12 items-center justify-center rounded-2xl'
                style={{ backgroundColor: `${item.color}15` }}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View className='flex-1'>
                <Text className={`text-base font-bold ${dark ? 'text-white' : 'text-black'}`}>
                  {item.type}
                </Text>
                <Text className={`mt-0.5 text-sm ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {formatDays(item.days)} • {item.time}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info Box */}
        <View
          className={`mt-8 rounded-[28px] p-6 ${dark ? 'bg-zinc-900/50' : 'bg-zinc-100'} border border-transparent`}>
          <View className='mb-2 flex-row items-center'>
            <Ionicons name='information-circle' size={20} color={primaryColor} />
            <Text className={`ml-2 text-sm font-bold ${dark ? 'text-white' : 'text-black'}`}>
              Consignes de tri
            </Text>
          </View>
          <Text className={`text-xs leading-5 ${dark ? 'text-zinc-500' : 'text-zinc-600'}`}>
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
