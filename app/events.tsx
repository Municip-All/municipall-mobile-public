import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Events() {
  const { theme } = useTheme();
  const { config } = useCity();
  const dark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('Tous');

  const primaryColor = config?.theme.primaryColor || '#1D4ED8';
  const filters = ['Tous', 'Mairie', 'Associations', 'Sports'];

  return (
    <View className={`flex-1 ${dark ? 'bg-zinc-950' : 'bg-[#F8FAFC]'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} bounces={false} showsVerticalScrollIndicator={false}>

        {/* Header Background */}
        <View
          className="w-full px-6 pb-6 mb-6"
          style={{ 
            backgroundColor: primaryColor,
            paddingTop: Math.max(insets.top, 40), 
            borderBottomLeftRadius: 32, 
            borderBottomRightRadius: 32 
          }}
        >
          <Text className="text-white text-3xl font-bold tracking-tight">Agenda Citoyen</Text>
          <Text className="text-white/80 text-sm mt-1 font-medium">Événements et réunions locales</Text>
        </View>

        {/* Filters Overlaying Header */}
        <View className="px-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {filters.map((filter) => {
              const isActive = filter === activeFilter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-5 py-2.5 rounded-full mr-3 border flex-row items-center shadow-sm ${dark ? 'border-zinc-800' : 'border-gray-200'}`}
                  style={isActive ? { backgroundColor: primaryColor, borderColor: primaryColor } : { backgroundColor: dark ? '#18181b' : '#FFFFFF' }}
                >
                  {filter === 'Mairie' && <Ionicons name="business" size={14} color={isActive ? '#FFF' : (dark ? '#CBD5E1' : '#475569')} style={{ marginRight: 6 }} />}
                  {filter === 'Associations' && <Ionicons name="people" size={14} color={isActive ? '#FFF' : (dark ? '#CBD5E1' : '#475569')} style={{ marginRight: 6 }} />}
                  {filter === 'Sports' && <Ionicons name="football" size={14} color={isActive ? '#FFF' : (dark ? '#CBD5E1' : '#475569')} style={{ marginRight: 6 }} />}
                  <Text className={`font-medium text-[13px] ${isActive ? 'text-white' : (dark ? 'text-gray-300' : 'text-slate-700')
                    }`}>{filter}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Events List */}
        <View className="px-5 mt-6">

          {/* Card 1 */}
          <View className={`rounded-[24px] p-5 mb-5 shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <View className="flex-row mb-4">
              <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${primaryColor}15` }}>
                <Ionicons name="business" size={28} color={dark ? '#60A5FA' : primaryColor} />
              </View>
              <View className="flex-1 justify-center">
                <Text className={`font-bold text-lg leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Conseil Municipal</Text>
                <Text className={`text-[13px] mt-0.5 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Mairie</Text>
              </View>
            </View>

            <View className="space-y-2 mb-5">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color={dark ? '#9CA3AF' : '#64748B'} className="mr-2" />
                <Text className={`text-[13px] ml-2 font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>25 avril 2026 • 18h30</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color={dark ? '#9CA3AF' : '#64748B'} className="mr-2" />
                <Text className={`text-[13px] ml-2 font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>Hôtel de Ville</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={16} color={dark ? '#9CA3AF' : '#64748B'} className="mr-2" />
                <Text className={`text-[13px] ml-2 font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>45 participants</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800">
              <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: `${primaryColor}15` }}>
                <Text className="text-xs font-semibold" style={{ color: primaryColor }}>Mairie</Text>
              </View>
              <TouchableOpacity className="flex-row items-center bg-gray-50 dark:bg-zinc-800 px-4 py-2 rounded-full">
                <Ionicons name="notifications-outline" size={14} color={dark ? '#E2E8F0' : '#1E293B'} />
                <Text className={`text-[13px] font-semibold ml-1.5 ${dark ? 'text-gray-200' : 'text-slate-900'}`}>Me rappeler</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card 2 */}
          <View className={`rounded-[24px] p-5 mb-5 shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <View className="flex-row mb-4">
              <View className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 items-center justify-center mr-4">
                <Ionicons name="basket" size={28} color={dark ? '#FDBA74' : '#EA580C'} />
              </View>
              <View className="flex-1 justify-center">
                <Text className={`font-bold text-lg leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>Marché des Producteurs Locaux</Text>
                <Text className={`text-[13px] mt-0.5 ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Association des Commerçants</Text>
              </View>
            </View>

            <View className="space-y-2 mb-5">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color={dark ? '#9CA3AF' : '#64748B'} className="mr-2" />
                <Text className={`text-[13px] ml-2 font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>27 avril 2026 • 09h00 - 13h00</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color={dark ? '#9CA3AF' : '#64748B'} className="mr-2" />
                <Text className={`text-[13px] ml-2 font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>Place du Marché</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={16} color={dark ? '#9CA3AF' : '#64748B'} className="mr-2" />
                <Text className={`text-[13px] ml-2 font-medium ${dark ? 'text-gray-300' : 'text-slate-700'}`}>120 participants</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800">
              <View className="bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 rounded-full">
                <Text className="text-xs font-semibold text-purple-700 dark:text-purple-400">Association</Text>
              </View>
              <TouchableOpacity className="flex-row items-center bg-gray-50 dark:bg-zinc-800 px-4 py-2 rounded-full">
                <Ionicons name="notifications-outline" size={14} color={dark ? '#E2E8F0' : '#1E293B'} />
                <Text className={`text-[13px] font-semibold ml-1.5 ${dark ? 'text-gray-200' : 'text-slate-900'}`}>Me rappeler</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

      </ScrollView>
      <BottomBar />
    </View>
  );
}
