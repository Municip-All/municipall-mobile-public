import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@context/themecontext';
import BottomBar from '@components/bottombar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Demandes() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className={`flex-1 ${dark ? 'bg-zinc-950' : 'bg-[#F8FAFC]'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* Header Background */}
        <View 
          className="bg-[#1D4ED8] w-full px-6 pb-20"
          style={{ paddingTop: Math.max(insets.top, 40), borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <Text className="text-white text-3xl font-bold tracking-tight">Mes Demandes</Text>
          <Text className="text-blue-100 text-sm mt-1 font-medium">Suivez vos signalements</Text>
        </View>

        {/* Stats Card Overlapping Header */}
        <View className="px-5 -mt-10">
          <View className={`rounded-[24px] px-6 py-5 flex-row justify-between shadow-xl ${dark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-100'}`}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20 }}>
            <View className="items-center">
              <Text className="text-3xl font-bold text-[#2563EB]">1</Text>
              <Text className={`text-xs mt-1 font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>En attente</Text>
            </View>
            <View className={`w-px h-full ${dark ? 'bg-zinc-800' : 'bg-gray-100'}`} />
            <View className="items-center">
              <Text className="text-3xl font-bold text-[#3B82F6]">1</Text>
              <Text className={`text-xs mt-1 font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>En cours</Text>
            </View>
            <View className={`w-px h-full ${dark ? 'bg-zinc-800' : 'bg-gray-100'}`} />
            <View className="items-center">
              <Text className="text-3xl font-bold text-[#10B981]">2</Text>
              <Text className={`text-xs mt-1 font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Résolus</Text>
            </View>
          </View>
        </View>

        {/* Demandes Actives */}
        <View className="px-5 mt-8">
          <Text className={`text-lg font-bold mb-4 ${dark ? 'text-white' : 'text-slate-800'}`}>Demandes actives</Text>
          
          <TouchableOpacity className={`rounded-[20px] p-5 mb-4 shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <View className="flex-row justify-between items-start mb-2">
              <Text className={`font-semibold text-base ${dark ? 'text-white' : 'text-slate-900'}`}>Éclairage public</Text>
              <Ionicons name="chevron-forward" size={16} color={dark ? '#9CA3AF' : '#64748B'} />
            </View>
            <Text className={`text-[14px] mb-3 ${dark ? 'text-gray-300' : 'text-slate-600'}`}>Lampadaire défectueux rue Victor Hugo</Text>
            
            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center mr-4">
                <Ionicons name="location-outline" size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`text-xs ml-1 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>15 Rue Victor Hugo</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`text-xs ml-1 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>15 avril 2026</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className={`text-[11px] uppercase tracking-wider font-semibold ${dark ? 'text-zinc-500' : 'text-gray-400'}`}>REF-2026-0415</Text>
              <View className="bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">En cours</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className={`rounded-[20px] p-5 mb-4 shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <View className="flex-row justify-between items-start mb-2">
              <Text className={`font-semibold text-base ${dark ? 'text-white' : 'text-slate-900'}`}>Déchets</Text>
              <Ionicons name="chevron-forward" size={16} color={dark ? '#9CA3AF' : '#64748B'} />
            </View>
            <Text className={`text-[14px] mb-3 ${dark ? 'text-gray-300' : 'text-slate-600'}`}>Conteneur débordant place de la République</Text>
            
            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center mr-4">
                <Ionicons name="location-outline" size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`text-xs ml-1 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Place de la République</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`text-xs ml-1 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>8 avril 2026</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className={`text-[11px] uppercase tracking-wider font-semibold ${dark ? 'text-zinc-500' : 'text-gray-400'}`}>REF-2026-0408</Text>
              <View className="bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full flex-row items-center border border-orange-100 dark:border-orange-800">
                <View className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5" />
                <Text className="text-xs font-semibold text-orange-600 dark:text-orange-500">En attente</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Demandes Résolues */}
        <View className="px-5 mt-6 mb-8">
          <Text className={`text-lg font-bold mb-4 ${dark ? 'text-white' : 'text-slate-800'}`}>Demandes résolues</Text>
          
          <TouchableOpacity className={`rounded-[20px] p-5 shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <View className="flex-row justify-between items-start mb-2">
              <Text className={`font-semibold text-base ${dark ? 'text-white' : 'text-slate-900'}`}>Nid-de-poule</Text>
              <Ionicons name="chevron-forward" size={16} color={dark ? '#9CA3AF' : '#64748B'} />
            </View>
            <Text className={`text-[14px] mb-3 ${dark ? 'text-gray-300' : 'text-slate-600'}`}>Chaussée endommagée avenue de la Liberté</Text>
            
            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center mr-4">
                <Ionicons name="location-outline" size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`text-xs ml-1 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Avenue de la Liberté</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={14} color={dark ? '#9CA3AF' : '#64748B'} />
                <Text className={`text-xs ml-1 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>10 avril 2026</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className={`text-[11px] uppercase tracking-wider font-semibold ${dark ? 'text-zinc-500' : 'text-gray-400'}`}>REF-2026-0410</Text>
              <View className="bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full flex-row items-center border border-emerald-100 dark:border-emerald-800">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-500">Résolu</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <BottomBar />
    </View>
  );
}
