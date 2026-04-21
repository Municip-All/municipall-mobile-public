import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import BottomBar from '@components/bottombar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Demandes() {
  const { theme } = useTheme();
  const { config } = useCity();
  const dark = theme === 'dark';
  const insets = useSafeAreaInsets();

  const primaryColor = config?.theme.primaryColor || '#1D4ED8';

  return (
    <View className={`flex-1 ${dark ? 'bg-zinc-950' : 'bg-[#F8FAFC]'}`}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        {/* Header Background */}
        <View
          className='mb-6 w-full px-6 pb-6'
          style={{
            backgroundColor: primaryColor,
            paddingTop: Math.max(insets.top, 40),
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}>
          <Text className='text-3xl font-bold tracking-tight text-white'>Mes Demandes</Text>
          <Text className='mt-1 text-sm font-medium text-white/80'>Suivez vos signalements</Text>
        </View>

        {/* Stats Card Overlapping Header */}
        <View className='px-5'>
          <View
            className={`flex-row justify-between rounded-[24px] px-6 py-5 shadow-xl ${dark ? 'border border-zinc-800 bg-zinc-900' : 'border border-gray-100 bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
            }}>
            <View className='items-center'>
              <Text className='text-3xl font-bold' style={{ color: primaryColor }}>
                1
              </Text>
              <Text
                className={`mt-1 text-xs font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                En attente
              </Text>
            </View>
            <View className={`h-full w-px ${dark ? 'bg-zinc-800' : 'bg-gray-100'}`} />
            <View className='items-center'>
              <Text className='text-3xl font-bold' style={{ color: primaryColor }}>
                1
              </Text>
              <Text
                className={`mt-1 text-xs font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                En cours
              </Text>
            </View>
            <View className={`h-full w-px ${dark ? 'bg-zinc-800' : 'bg-gray-100'}`} />
            <View className='items-center'>
              <Text className='text-3xl font-bold text-[#10B981]'>2</Text>
              <Text
                className={`mt-1 text-xs font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                Résolus
              </Text>
            </View>
          </View>
        </View>

        {/* Demandes Actives */}
        <View className='mt-8 px-5'>
          <Text className={`mb-4 text-lg font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
            Demandes actives
          </Text>

          <TouchableOpacity
            className={`mb-4 rounded-[20px] border p-5 shadow-sm ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-white'}`}>
            <View className='mb-2 flex-row items-start justify-between'>
              <Text className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Éclairage public
              </Text>
              <Ionicons name='chevron-forward' size={16} color={dark ? '#9CA3AF' : '#64748B'} />
            </View>
            <Text className={`mb-3 text-[14px] ${dark ? 'text-gray-300' : 'text-slate-600'}`}>
              Lampadaire défectueux rue Victor Hugo
            </Text>

            <View className='mb-4 flex-row items-center'>
              <View className='mr-4 flex-row items-center'>
                <Ionicons name='location-outline' size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`ml-1 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                  15 Rue Victor Hugo
                </Text>
              </View>
              <View className='flex-row items-center'>
                <Ionicons name='calendar-outline' size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`ml-1 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                  15 avril 2026
                </Text>
              </View>
            </View>

            <View className='flex-row items-center justify-between'>
              <Text
                className={`text-[11px] font-semibold tracking-wider uppercase ${dark ? 'text-zinc-500' : 'text-gray-400'}`}>
                REF-2026-0415
              </Text>
              <View
                className='flex-row items-center rounded-full px-3 py-1'
                style={{ backgroundColor: `${primaryColor}15` }}>
                <View
                  className='mr-1.5 h-1.5 w-1.5 rounded-full'
                  style={{ backgroundColor: primaryColor }}
                />
                <Text className='text-xs font-semibold' style={{ color: primaryColor }}>
                  En cours
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className={`mb-4 rounded-[20px] border p-5 shadow-sm ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-white'}`}>
            <View className='mb-2 flex-row items-start justify-between'>
              <Text className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Déchets
              </Text>
              <Ionicons name='chevron-forward' size={16} color={dark ? '#9CA3AF' : '#64748B'} />
            </View>
            <Text className={`mb-3 text-[14px] ${dark ? 'text-gray-300' : 'text-slate-600'}`}>
              Conteneur débordant place de la République
            </Text>

            <View className='mb-4 flex-row items-center'>
              <View className='mr-4 flex-row items-center'>
                <Ionicons name='location-outline' size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`ml-1 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Place de la République
                </Text>
              </View>
              <View className='flex-row items-center'>
                <Ionicons name='calendar-outline' size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`ml-1 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                  8 avril 2026
                </Text>
              </View>
            </View>

            <View className='flex-row items-center justify-between'>
              <Text
                className={`text-[11px] font-semibold tracking-wider uppercase ${dark ? 'text-zinc-500' : 'text-gray-400'}`}>
                REF-2026-0408
              </Text>
              <View className='flex-row items-center rounded-full border border-orange-100 bg-orange-50 px-3 py-1 dark:border-orange-800 dark:bg-orange-900/30'>
                <View className='mr-1.5 h-1.5 w-1.5 rounded-full bg-orange-500' />
                <Text className='text-xs font-semibold text-orange-600 dark:text-orange-500'>
                  En attente
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Demandes Résolues */}
        <View className='mt-6 mb-8 px-5'>
          <Text className={`mb-4 text-lg font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
            Demandes résolues
          </Text>

          <TouchableOpacity
            className={`rounded-[20px] border p-5 shadow-sm ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-white'}`}>
            <View className='mb-2 flex-row items-start justify-between'>
              <Text className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Nid-de-poule
              </Text>
              <Ionicons name='chevron-forward' size={16} color={dark ? '#9CA3AF' : '#64748B'} />
            </View>
            <Text className={`mb-3 text-[14px] ${dark ? 'text-gray-300' : 'text-slate-600'}`}>
              Chaussée endommagée avenue de la Liberté
            </Text>

            <View className='mb-4 flex-row items-center'>
              <View className='mr-4 flex-row items-center'>
                <Ionicons name='location-outline' size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`ml-1 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Avenue de la Liberté
                </Text>
              </View>
              <View className='flex-row items-center'>
                <Ionicons name='calendar-outline' size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`ml-1 text-xs ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                  10 avril 2026
                </Text>
              </View>
            </View>

            <View className='flex-row items-center justify-between'>
              <Text
                className={`text-[11px] font-semibold tracking-wider uppercase ${dark ? 'text-zinc-500' : 'text-gray-400'}`}>
                REF-2026-0410
              </Text>
              <View className='flex-row items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 dark:border-emerald-800 dark:bg-emerald-900/30'>
                <View className='mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500' />
                <Text className='text-xs font-semibold text-emerald-600 dark:text-emerald-500'>
                  Résolu
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomBar />
    </View>
  );
}
