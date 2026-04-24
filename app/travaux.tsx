import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@context/themecontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Travaux() {
  const { colorScheme } = useTheme();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const works = [
    {
      title: 'Avenue de la République',
      type: 'Réfection chaussée',
      status: 'En cours',
      duration: "Jusqu'au 25 avril",
      icon: 'construct',
    },
    {
      title: 'Rue Victor Hugo',
      type: 'Remplacement canalisations',
      status: 'Planifié',
      duration: 'À partir du 10 mai',
      icon: 'water',
    },
    {
      title: 'Place du Marché',
      type: 'Aménagement paysager',
      status: 'En cours',
      duration: "Jusqu'au 3 mai",
      icon: 'leaf',
    },
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
            Infrastructure
          </Text>
          <Text
            className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
            Travaux
          </Text>
        </View>

        {/* Works List */}
        <View className='space-y-4'>
          {works.map((item, i) => (
            <TouchableOpacity
              key={i}
              className={`mb-4 overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
              <View className='p-6'>
                <View className='mb-4 flex-row items-center'>
                  <View className='mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/20'>
                    <Ionicons name={item.icon as any} size={24} color='#FF9500' />
                  </View>
                  <View className='flex-1'>
                    <Text className={`text-xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
                      {item.title}
                    </Text>
                    <Text
                      className={`text-sm font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {item.type}
                    </Text>
                  </View>
                </View>

                <View className='rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50'>
                  <View className='mb-2 flex-row items-center justify-between'>
                    <Text
                      className={`text-xs font-bold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      STATUT
                    </Text>
                    <Text className='text-xs font-black text-orange-500 uppercase'>
                      {item.status}
                    </Text>
                  </View>
                  <View className='flex-row items-center justify-between'>
                    <Text
                      className={`text-xs font-bold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      DURÉE ESTIMÉE
                    </Text>
                    <Text
                      className={`text-xs font-bold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                      {item.duration}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notice */}
        <View className='mt-8 rounded-[28px] border border-dashed border-zinc-200 p-6 dark:border-zinc-800'>
          <Text
            className={`text-center text-xs leading-5 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Ces informations sont fournies à titre indicatif par les services techniques de la
            ville. Les dates peuvent varier selon les conditions météorologiques.
          </Text>
        </View>
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
