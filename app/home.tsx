import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import BottomBar from '@components/bottombar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const { theme } = useTheme();
  const { config } = useCity();
  const dark = theme === 'dark';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const primaryColor = config?.theme.primaryColor || '#244EE5';
  const appName = config?.name || "Municip'All";

  return (
    <View className={`flex-1 ${dark ? 'bg-zinc-950' : 'bg-[#F8FAFC]'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} bounces={false}>
        {/* Header Background */}
        <View
          className='mb-6 w-full px-6 pb-8'
          style={{
            backgroundColor: primaryColor,
            paddingTop: Math.max(insets.top, 40),
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}>
          <Text className='text-3xl font-bold tracking-tight text-white'>{appName}</Text>
          <Text className='mt-1 text-base font-medium text-white/80 italic'>
            Votre ville à portée de main
          </Text>
        </View>

        {/* Floating Main Card */}
        <View className='px-4'>
          <View
            className={`overflow-hidden rounded-[24px] shadow-xl ${dark ? 'border border-zinc-800 bg-zinc-900' : 'border border-gray-100 bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 24,
            }}>
            <View
              className='flex-row items-center justify-between px-5 py-4'
              style={{ backgroundColor: primaryColor }}>
              <Text className='text-xl font-semibold text-white'>Flux Live</Text>
              <View className='rounded-full bg-white/20 px-2 py-1'>
                <Text className='text-xs font-medium text-white'>En direct</Text>
              </View>
            </View>

            <View className='p-2'>
              {/* Météo */}
              <TouchableOpacity
                className={`flex-row items-center rounded-2xl p-4 ${dark ? 'bg-zinc-800/50' : 'bg-transparent'}`}>
                <View
                  className='mr-4 h-12 w-12 items-center justify-center rounded-full'
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons
                    name='cloud-outline'
                    size={24}
                    color={dark ? '#60A5FA' : primaryColor}
                  />
                </View>
                <View className='flex-1'>
                  <Text
                    className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Météo
                  </Text>
                  <Text
                    className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                    Ensoleillé, 18°C
                  </Text>
                  <Text className={`mt-0.5 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Ciel dégagé toute la journée
                  </Text>
                </View>
              </TouchableOpacity>

              <View className={`h-[1px] w-full ${dark ? 'bg-zinc-800' : 'bg-gray-100'} my-1`} />

              {/* Circulation */}
              <TouchableOpacity
                className={`flex-row items-center rounded-2xl p-4 ${dark ? 'bg-zinc-800/50' : 'bg-transparent'}`}>
                <View
                  className='mr-4 h-12 w-12 items-center justify-center rounded-full'
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons name='car-outline' size={24} color={dark ? '#60A5FA' : primaryColor} />
                </View>
                <View className='flex-1'>
                  <Text
                    className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Circulation
                  </Text>
                  <Text
                    className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                    Trafic fluide
                  </Text>
                  <Text className={`mt-0.5 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Aucun incident signalé
                  </Text>
                </View>
              </TouchableOpacity>

              <View className={`h-[1px] w-full ${dark ? 'bg-zinc-800' : 'bg-gray-100'} my-1`} />

              {/* Evénements */}
              <TouchableOpacity
                onPress={() => router.push('/events')}
                className={`flex-row items-center rounded-2xl p-4 ${dark ? 'bg-zinc-800/50' : 'bg-transparent'}`}>
                <View
                  className='mr-4 h-12 w-12 items-center justify-center rounded-full'
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons
                    name='people-outline'
                    size={24}
                    color={dark ? '#60A5FA' : primaryColor}
                  />
                </View>
                <View className='flex-1'>
                  <Text
                    className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Événements à venir
                  </Text>
                  <Text
                    className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                    3 événements
                  </Text>
                  <Text className={`mt-0.5 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Cette semaine
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Alertes Récentes */}
        <View className='mt-8 px-5'>
          <Text className={`mb-4 text-lg font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
            Alertes récentes
          </Text>

          <View
            className={`mb-4 rounded-[20px] border p-5 shadow-sm ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-white'}`}>
            <View className='flex-row'>
              <Ionicons
                name='alert-circle-outline'
                size={22}
                color={dark ? '#60A5FA' : primaryColor}
                className='mr-3'
              />
              <View className='ml-3 flex-1 space-y-1'>
                <Text
                  className={`text-[15px] font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  Collecte des déchets
                </Text>
                <Text
                  className={`text-[13px] leading-5 ${dark ? 'text-gray-300' : 'text-slate-600'}`}>
                  Prochaine collecte mercredi 23 avril
                </Text>
                <Text
                  className={`mt-2 text-[11px] font-medium ${dark ? 'text-gray-500' : 'text-slate-400'}`}>
                  Il y a 2h
                </Text>
              </View>
            </View>
          </View>

          <View
            className={`mb-4 rounded-[20px] border p-5 shadow-sm ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-white'}`}>
            <View className='flex-row'>
              <Ionicons
                name='alert-circle-outline'
                size={22}
                color={dark ? '#60A5FA' : primaryColor}
                className='mr-3'
              />
              <View className='ml-3 flex-1 space-y-1'>
                <Text
                  className={`text-[15px] font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  Travaux avenue de la République
                </Text>
                <Text
                  className={`text-[13px] leading-5 ${dark ? 'text-gray-300' : 'text-slate-600'}`}>
                  Circulation modifiée du 22 au 26 avril
                </Text>
                <Text
                  className={`mt-2 text-[11px] font-medium ${dark ? 'text-gray-500' : 'text-slate-400'}`}>
                  Il y a 5h
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Découvrez votre ville */}
        <View className='mt-6 mb-8 px-5'>
          <Text className={`mb-4 text-lg font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
            Découvrez votre ville
          </Text>
          <View
            className={`rounded-[20px] border p-5 shadow-sm ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-white'}`}>
            <Text className={`text-[14px] ${dark ? 'text-gray-300' : 'text-slate-600'}`}>
              Aucune nouvelle publication pour le moment.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Signalement Button */}
      <View className='absolute right-5 bottom-24 items-end'>
        <View className='flex-row items-center rounded-full border border-white/20 bg-white/80 py-1 pr-1 pl-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black/50'>
          <Text className={`mr-3 text-xs font-medium ${dark ? 'text-white' : primaryColor}`}>
            Vigilance Citoyenne
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/carte')}
            className='h-12 w-12 items-center justify-center rounded-full shadow-md'
            style={{ backgroundColor: primaryColor }}>
            <Ionicons name='alert' size={24} color='#FFFFFF' />
          </TouchableOpacity>
        </View>
      </View>

      <BottomBar />
    </View>
  );
}
