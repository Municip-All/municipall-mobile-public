import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
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
          className="w-full px-6 pb-8 mb-6"
          style={{ 
            backgroundColor: primaryColor,
            paddingTop: Math.max(insets.top, 40), 
            borderBottomLeftRadius: 32, 
            borderBottomRightRadius: 32 
          }}
        >
          <Text className="text-white text-3xl font-bold tracking-tight">{appName}</Text>
          <Text className="text-white/80 text-base italic mt-1 font-medium">Votre ville à portée de main</Text>
        </View>

        {/* Floating Main Card */}
        <View className="px-4">
          <View className={`rounded-[24px] overflow-hidden shadow-xl ${dark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-100'}`}
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24 }}>
            <View 
              className="px-5 py-4 flex-row items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <Text className="text-white text-xl font-semibold">Flux Live</Text>
              <View className="bg-white/20 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-medium">En direct</Text>
              </View>
            </View>

            <View className="p-2">
              {/* Météo */}
              <TouchableOpacity className={`flex-row items-center p-4 rounded-2xl ${dark ? 'bg-zinc-800/50' : 'bg-transparent'}`}>
                <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons name="cloud-outline" size={24} color={dark ? '#60A5FA' : primaryColor} />
                </View>
                <View className="flex-1">
                  <Text className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Météo</Text>
                  <Text className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>Ensoleillé, 18°C</Text>
                  <Text className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Ciel dégagé toute la journée</Text>
                </View>
              </TouchableOpacity>

              <View className={`h-[1px] w-full ${dark ? 'bg-zinc-800' : 'bg-gray-100'} my-1`} />

              {/* Circulation */}
              <TouchableOpacity className={`flex-row items-center p-4 rounded-2xl ${dark ? 'bg-zinc-800/50' : 'bg-transparent'}`}>
                <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons name="car-outline" size={24} color={dark ? '#60A5FA' : primaryColor} />
                </View>
                <View className="flex-1">
                  <Text className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Circulation</Text>
                  <Text className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>Trafic fluide</Text>
                  <Text className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Aucun incident signalé</Text>
                </View>
              </TouchableOpacity>

              <View className={`h-[1px] w-full ${dark ? 'bg-zinc-800' : 'bg-gray-100'} my-1`} />

              {/* Evénements */}
              <TouchableOpacity onPress={() => router.push('/events')} className={`flex-row items-center p-4 rounded-2xl ${dark ? 'bg-zinc-800/50' : 'bg-transparent'}`}>
                <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons name="people-outline" size={24} color={dark ? '#60A5FA' : primaryColor} />
                </View>
                <View className="flex-1">
                  <Text className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Événements à venir</Text>
                  <Text className={`text-base font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>3 événements</Text>
                  <Text className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Cette semaine</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Alertes Récentes */}
        <View className="px-5 mt-8">
          <Text className={`text-lg font-bold mb-4 ${dark ? 'text-white' : 'text-slate-800'}`}>Alertes récentes</Text>

          <View className={`rounded-[20px] p-5 mb-4 shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <View className="flex-row">
              <Ionicons name="alert-circle-outline" size={22} color={dark ? '#60A5FA' : primaryColor} className="mr-3" />
              <View className="flex-1 space-y-1 ml-3">
                <Text className={`font-semibold text-[15px] ${dark ? 'text-white' : 'text-slate-900'}`}>Collecte des déchets</Text>
                <Text className={`text-[13px] leading-5 ${dark ? 'text-gray-300' : 'text-slate-600'}`}>Prochaine collecte mercredi 23 avril</Text>
                <Text className={`text-[11px] font-medium mt-2 ${dark ? 'text-gray-500' : 'text-slate-400'}`}>Il y a 2h</Text>
              </View>
            </View>
          </View>

          <View className={`rounded-[20px] p-5 mb-4 shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <View className="flex-row">
              <Ionicons name="alert-circle-outline" size={22} color={dark ? '#60A5FA' : primaryColor} className="mr-3" />
              <View className="flex-1 space-y-1 ml-3">
                <Text className={`font-semibold text-[15px] ${dark ? 'text-white' : 'text-slate-900'}`}>Travaux avenue de la République</Text>
                <Text className={`text-[13px] leading-5 ${dark ? 'text-gray-300' : 'text-slate-600'}`}>Circulation modifiée du 22 au 26 avril</Text>
                <Text className={`text-[11px] font-medium mt-2 ${dark ? 'text-gray-500' : 'text-slate-400'}`}>Il y a 5h</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Découvrez votre ville */}
        <View className="px-5 mt-6 mb-8">
          <Text className={`text-lg font-bold mb-4 ${dark ? 'text-white' : 'text-slate-800'}`}>Découvrez votre ville</Text>
          <View className={`rounded-[20px] p-5 shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <Text className={`text-[14px] ${dark ? 'text-gray-300' : 'text-slate-600'}`}>Aucune nouvelle publication pour le moment.</Text>
          </View>
        </View>

      </ScrollView>

      {/* Floating Signalement Button */}
      <View className="absolute bottom-24 right-5 items-end">
        <View className="flex-row items-center bg-white/80 dark:bg-black/50 backdrop-blur-xl rounded-full pr-1 pl-4 py-1 shadow-lg border border-white/20 dark:border-white/10">
          <Text className={`text-xs font-medium mr-3 ${dark ? 'text-white' : primaryColor}`}>Vigilance Citoyenne</Text>
          <TouchableOpacity
            onPress={() => router.push('/carte')}
            className="w-12 h-12 rounded-full items-center justify-center shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            <Ionicons name="alert" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <BottomBar />
    </View>
  );
}
