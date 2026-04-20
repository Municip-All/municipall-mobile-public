import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useTheme } from '@context/themecontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// import { useAuth } from '@context/authcontext'; 

export default function Profile() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className={`flex-1 ${dark ? 'bg-zinc-950' : 'bg-[#F8FAFC]'}`}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* Header Background */}
        <View 
          className="bg-[#1D4ED8] w-full px-6 pb-20 items-center pt-8"
          style={{ paddingTop: Math.max(insets.top, 32), borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <View className="flex-row items-center w-full">
            <View className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 items-center justify-center mr-4 overflow-hidden">
               {/* Replace with User Image */}
               <Ionicons name="person" size={40} color="rgba(255,255,255,0.7)" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold tracking-tight">Marie Dupont</Text>
              <Text className="text-blue-100 text-sm mt-0.5">marie.dupont@email.fr</Text>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View className="px-5 -mt-12 mb-8">
          <View className={`rounded-[24px] px-6 py-5 flex-row justify-between shadow-xl ${dark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-gray-100'}`}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20 }}>
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#2563EB]">12</Text>
              <Text className={`text-[11px] mt-1 font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Signalements</Text>
            </View>
            <View className={`w-px h-full ${dark ? 'bg-zinc-800' : 'bg-gray-100'}`} />
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#10B981]">8</Text>
              <Text className={`text-[11px] mt-1 font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Résolus</Text>
            </View>
            <View className={`w-px h-full ${dark ? 'bg-zinc-800' : 'bg-gray-100'}`} />
            <View className="items-center">
              <Text className="text-2xl font-bold text-[#2563EB]">5</Text>
              <Text className={`text-[11px] mt-1 font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>Événements</Text>
            </View>
          </View>
        </View>

        {/* Mon compte List */}
        <View className="px-5 mb-8">
          <Text className={`text-base font-bold mb-3 ${dark ? 'text-white' : 'text-slate-800'}`}>Mon compte</Text>
          
          <View className={`rounded-[24px] overflow-hidden shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <TouchableOpacity className={`flex-row items-center justify-between p-4 border-b ${dark ? 'border-zinc-800' : 'border-gray-50'}`}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mr-3">
                  <Ionicons name="person-outline" size={20} color={dark ? '#60A5FA' : '#2563EB'} />
                </View>
                <Text className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>Informations personnelles</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity className={`flex-row items-center justify-between p-4 border-b ${dark ? 'border-zinc-800' : 'border-gray-50'}`}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mr-3">
                  <Ionicons name="location-outline" size={20} color={dark ? '#60A5FA' : '#2563EB'} />
                </View>
                <Text className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>Adresse par défaut</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mr-3">
                  <Ionicons name="notifications-outline" size={20} color={dark ? '#60A5FA' : '#2563EB'} />
                </View>
                <Text className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>Notifications</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-[#1D4ED8] items-center justify-center mr-2">
                  <Text className="text-white text-[10px] font-bold">3</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Paramètres List */}
        <View className="px-5 mb-8">
          <Text className={`text-base font-bold mb-3 ${dark ? 'text-white' : 'text-slate-800'}`}>Paramètres</Text>
          
          <View className={`rounded-[24px] overflow-hidden shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <TouchableOpacity className={`flex-row items-center justify-between p-4 border-b ${dark ? 'border-zinc-800' : 'border-gray-50'}`}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark-outline" size={20} color={dark ? '#818CF8' : '#4F46E5'} />
                </View>
                <Text className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>Confidentialité et sécurité</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center mr-3">
                  <Ionicons name="settings-outline" size={20} color={dark ? '#818CF8' : '#4F46E5'} />
                </View>
                <Text className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>Préférences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View className="px-5">
          <Text className={`text-base font-bold mb-3 ${dark ? 'text-white' : 'text-slate-800'}`}>Support</Text>
          
          <View className={`rounded-[24px] overflow-hidden shadow-sm border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center mr-3">
                  <Ionicons name="help-buoy-outline" size={20} color={dark ? '#60A5FA' : '#2563EB'} />
                </View>
                <Text className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>Centre d'aide</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity className="mt-8 mb-6 mx-auto">
            <Text className="text-red-500 font-semibold text-base">Se déconnecter</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
      <BottomBar />
    </View>
  );
}
