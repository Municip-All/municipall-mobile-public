import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@context/themecontext';
import { useCity } from '@context/citycontext';
import { useAuth } from '@context/authcontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/bottombar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';

export default function Profile() {
  const { theme, colorScheme, setTheme } = useTheme();
  const { config } = useCity();
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  if (!isAuthenticated || !user) {
    router.replace('/login');
    return null;
  }

  const primaryColor = config?.theme.primaryColor || '#0B0080';

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès aux photos nécessaire.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setIsUploading(true);
    try {
      updateUser({ avatar_url: uri });
      await apiClient.post('users/avatar', { avatarUrl: uri });
      Alert.alert('Succès', 'Photo mise à jour.');
    } catch {
      Alert.alert('Erreur', 'Mise à jour impossible.');
    } finally {
      setIsUploading(false);
    }
  };

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
            Compte
          </Text>
          <Text
            className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
            Profil
          </Text>
        </View>

        {/* Profile Card */}
        <View
          className={`mb-8 overflow-hidden rounded-[32px] ${dark ? 'bg-zinc-900' : 'bg-white'} items-center border border-zinc-100 p-6 shadow-sm dark:border-zinc-800`}>
          <TouchableOpacity onPress={pickImage} disabled={isUploading} className='relative mb-4'>
            <View className='h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800'>
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} className='h-full w-full' />
              ) : (
                <View className='flex-1 items-center justify-center'>
                  <Ionicons name='person' size={40} color={dark ? '#3F3F46' : '#D4D4D8'} />
                </View>
              )}
            </View>
            {isUploading && (
              <View className='absolute inset-0 items-center justify-center rounded-full bg-black/20'>
                <ActivityIndicator color='white' />
              </View>
            )}
            <View className='absolute right-0 bottom-0 h-8 w-8 items-center justify-center rounded-full border border-zinc-100 bg-white shadow-lg dark:border-zinc-600 dark:bg-zinc-700'>
              <Ionicons name='camera' size={16} color={primaryColor} />
            </View>
          </TouchableOpacity>
          <Text className={`text-2xl font-bold ${dark ? 'text-white' : 'text-black'}`}>
            {user.name} {user.surname}
          </Text>
          <Text className={`text-sm font-medium ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {user.email}
          </Text>
        </View>

        {/* Stats Section */}
        <View className='mb-8 flex-row justify-between'>
          {[
            { label: 'Signalements', value: '12', icon: 'alert-circle', color: '#FF3B30' },
            { label: 'Participations', value: '5', icon: 'calendar', color: '#007AFF' },
            { label: 'Ville', value: config?.name || '...', icon: 'business', color: '#34C759' },
          ].map((stat, i) => (
            <View
              key={i}
              className={`flex-1 items-center rounded-[24px] p-4 ${dark ? 'bg-zinc-900' : 'bg-white'} mx-1 border border-zinc-100 shadow-sm dark:border-zinc-800`}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              <Text className={`mt-1 text-lg font-black ${dark ? 'text-white' : 'text-black'}`}>
                {stat.value}
              </Text>
              <Text
                className={`text-[9px] font-bold tracking-tighter uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Settings List (Apple Style) */}
        <Text
          className={`mb-3 ml-4 text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Apparence
        </Text>
        <View
          className={`mb-8 rounded-2xl p-1 ${dark ? 'bg-zinc-900' : 'bg-white'} flex-row border border-zinc-100 dark:border-zinc-800`}>
          {[
            { id: 'light', label: 'Clair', icon: 'sunny' },
            { id: 'dark', label: 'Sombre', icon: 'moon' },
            { id: 'system', label: 'Système', icon: 'settings' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setTheme(option.id as any)}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${theme === option.id ? (dark ? 'bg-zinc-800' : 'bg-zinc-100') : ''}`}>
              <Ionicons
                name={option.icon as any}
                size={16}
                color={theme === option.id ? primaryColor : dark ? '#71717A' : '#A1A1AA'}
              />
              <Text
                className={`ml-2 text-xs font-bold ${theme === option.id ? (dark ? 'text-white' : 'text-black') : dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text
          className={`mb-3 ml-4 text-xs font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Réglages
        </Text>
        <View
          className={`overflow-hidden rounded-[24px] ${dark ? 'bg-zinc-900' : 'bg-white'} mb-6 border border-zinc-100 shadow-sm dark:border-zinc-800`}>
          {[
            { label: 'Informations personnelles', icon: 'person-outline', color: '#007AFF' },
            {
              label: 'Sécurité et mot de passe',
              icon: 'shield-checkmark-outline',
              color: '#34C759',
            },
            { label: 'Notifications', icon: 'notifications-outline', color: '#FF9500' },
            { label: "Centre d'aide", icon: 'help-buoy-outline', color: '#AF52DE' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              className={`flex-row items-center justify-between p-4 ${i !== 3 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
              <View className='flex-row items-center'>
                <View
                  className='mr-3 h-8 w-8 items-center justify-center rounded-lg'
                  style={{ backgroundColor: `${item.color}15` }}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text
                  className={`text-sm font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={16} color='#A1A1AA' />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout} className='items-center py-4'>
          <Text className='text-base font-bold text-red-500'>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
