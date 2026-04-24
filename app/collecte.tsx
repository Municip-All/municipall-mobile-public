import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export default function Collecte() {
  const { colorScheme } = useTheme();
  const { config } = useCity();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const primaryColor = config?.theme.primaryColor || '#0B0080';

  const schedule = [
    { type: 'Ordures ménagères', day: 'Lundi, Jeudi', icon: 'trash', color: '#8E8E93' },
    { type: 'Emballages & Papiers', day: 'Mercredi', icon: 'refresh', color: '#FFD60A' },
    { type: 'Déchets Verts', day: 'Vendredi (Saisonnier)', icon: 'leaf', color: '#34C759' },
    { type: 'Encombrants', day: '1er Mardi du mois', icon: 'archive', color: '#FF9500' },
  ];

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
                Demain, 08:30
              </Text>
              <View className='mt-3 flex-row items-center self-start rounded-full bg-yellow-400/20 px-3 py-1'>
                <Ionicons name='refresh' size={14} color='#FFD60A' />
                <Text className='ml-2 text-xs font-bold text-yellow-500'>Recyclage</Text>
              </View>
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
                  {item.day}
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
