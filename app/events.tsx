import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Events() {
  const { colorScheme } = useTheme();
  const { config } = useCity();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('Tous');

  const primaryColor = config?.theme.primaryColor || '#0B0080';
  const filters = ['Tous', 'Mairie', 'Associations', 'Sports'];

  return (
    <View className={`flex-1 ${dark ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Apple Style Header */}
        <View className='mb-6'>
          <Text
            className={`text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Agenda
          </Text>
          <Text
            className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
            Événements
          </Text>
        </View>

        {/* Filters Grid Style */}
        <View className='mb-8 flex-row flex-wrap'>
          {filters.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`mr-2 mb-2 rounded-full border px-6 py-2.5 ${
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

        {/* Events Feed */}
        <View className='space-y-4'>
          {/* Card 1 */}
          <TouchableOpacity
            className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} mb-4 border border-zinc-100 shadow-sm dark:border-zinc-800`}>
            <View className='p-6'>
              <View className='mb-4 flex-row items-center'>
                <View
                  className='mr-4 h-12 w-12 items-center justify-center rounded-2xl'
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons name='business' size={24} color={primaryColor} />
                </View>
                <View className='flex-1'>
                  <Text className={`text-xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
                    Conseil Municipal
                  </Text>
                  <Text
                    className={`text-sm font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Mairie de {config?.name || 'la Ville'}
                  </Text>
                </View>
              </View>

              <View className='mb-6 space-y-2'>
                <View className='flex-row items-center'>
                  <Ionicons
                    name='calendar-clear-outline'
                    size={16}
                    color={dark ? '#71717A' : '#A1A1AA'}
                  />
                  <Text
                    className={`ml-2 text-sm font-medium ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Jeu. 25 avril • 18:30
                  </Text>
                </View>
                <View className='flex-row items-center'>
                  <Ionicons
                    name='location-outline'
                    size={16}
                    color={dark ? '#71717A' : '#A1A1AA'}
                  />
                  <Text
                    className={`ml-2 text-sm font-medium ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Salle du Conseil
                  </Text>
                </View>
              </View>

              <View className='flex-row items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800'>
                <View className='flex-row -space-x-2'>
                  {[1, 2, 3].map((i) => (
                    <View
                      key={i}
                      className='h-6 w-6 rounded-full border-2 border-white bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-700'
                    />
                  ))}
                  <Text className='ml-4 text-xs font-bold text-zinc-400'>+ 42</Text>
                </View>
                <TouchableOpacity
                  className='rounded-full px-4 py-2'
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <Text className='text-xs font-bold' style={{ color: primaryColor }}>
                    Participer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card 2 */}
          <TouchableOpacity
            className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} mb-4 border border-zinc-100 shadow-sm dark:border-zinc-800`}>
            <View className='p-6'>
              <View className='mb-4 flex-row items-center'>
                <View className='mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/20'>
                  <Ionicons name='basket' size={24} color='#FF9500' />
                </View>
                <View className='flex-1'>
                  <Text className={`text-xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
                    Marché Local
                  </Text>
                  <Text
                    className={`text-sm font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Association des Commerçants
                  </Text>
                </View>
              </View>

              <View className='mb-6 space-y-2'>
                <View className='flex-row items-center'>
                  <Ionicons
                    name='calendar-clear-outline'
                    size={16}
                    color={dark ? '#71717A' : '#A1A1AA'}
                  />
                  <Text
                    className={`ml-2 text-sm font-medium ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Sam. 27 avril • 08:00
                  </Text>
                </View>
                <View className='flex-row items-center'>
                  <Ionicons
                    name='location-outline'
                    size={16}
                    color={dark ? '#71717A' : '#A1A1AA'}
                  />
                  <Text
                    className={`ml-2 text-sm font-medium ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Place de la Mairie
                  </Text>
                </View>
              </View>

              <View className='flex-row items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800'>
                <View className='flex-row -space-x-2'>
                  {[1, 2].map((i) => (
                    <View
                      key={i}
                      className='h-6 w-6 rounded-full border-2 border-white bg-zinc-200 dark:border-zinc-900 dark:bg-zinc-700'
                    />
                  ))}
                  <Text className='ml-4 text-xs font-bold text-zinc-400'>+ 120</Text>
                </View>
                <TouchableOpacity
                  className='rounded-full px-4 py-2'
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <Text className='text-xs font-bold' style={{ color: primaryColor }}>
                    Participer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
