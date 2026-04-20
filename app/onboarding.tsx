import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';

const ONBOARDING_KEY = 'onboarding_completed_v1';

const steps = [
  {
    icon: 'leaf-outline' as const,
    color: '#22c55e',
    title: "Bienvenue sur Municip'All",
    desc: 'Découvrez les composteurs, sanisettes et suivez vos signalements facilement.',
  },
  {
    icon: 'map-outline' as const,
    color: '#0284c7',
    title: 'Carte et signalements',
    desc: 'Localisez les points utiles et signalez un problème en quelques secondes.',
  },
  {
    icon: 'chatbubble-ellipses-outline' as const,
    color: '#8b5cf6',
    title: 'Contact & suivi',
    desc: 'Envoyez des suggestions à la mairie et suivez leur traitement.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { theme } = useTheme();
  const { config } = useCity();
  const dark = theme === 'dark';
  const [index, setIndex] = useState(0);
  const total = steps.length;

  const primaryColor = config?.theme.primaryColor || '#2563EB';

  const nextLabel = useMemo(
    () => (index < total - 1 ? 'Suivant' : "C'est parti !"),
    [index, total]
  );

  const complete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {}
    router.replace('/home');
  };

  const onNext = async () => {
    if (index < total - 1) setIndex((i) => i + 1);
    else await complete();
  };

  const onSkip = async () => {
    await complete();
  };

  return (
    <View
      className={`flex-1 items-center justify-between px-6 pt-20 pb-14 ${dark ? 'bg-zinc-900' : 'bg-white'}`}>
      <View className='items-center'>
        <View
          className='mb-5 h-16 w-16 items-center justify-center rounded-full'
          style={{ backgroundColor: `${steps[index].color}20` }}>
          <Ionicons name={steps[index].icon} size={28} color={steps[index].color} />
        </View>
        <Text className={`text-center text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
          {steps[index].title}
        </Text>
        <Text
          className={`mt-3 text-center text-sm leading-6 ${dark ? 'text-gray-300' : 'text-slate-600'}`}>
          {steps[index].desc}
        </Text>
      </View>

      <View className='w-full items-center'>
        <View className='mb-6 flex-row items-center'>
          {steps.map((_, i) => (
            <View
              key={i}
              className={`mx-1 h-2 w-8 rounded-full ${dark ? 'bg-zinc-700' : 'bg-slate-200'}`}
              style={i === index ? { backgroundColor: primaryColor, width: 32 } : {}}
            />
          ))}
        </View>
        <View className='w-full flex-row justify-between items-center'>
          <TouchableOpacity onPress={onSkip} accessibilityRole='button' accessibilityLabel='Passer'>
            <Text className={`text-sm ${dark ? 'text-gray-300' : 'text-slate-600'}`}>Passer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onNext}
            className='rounded-xl px-8 py-3'
            style={{ backgroundColor: primaryColor }}
            accessibilityRole='button'
            accessibilityLabel={nextLabel}>
            <Text className='font-semibold text-white'>{nextLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
