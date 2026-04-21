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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../services/apiClient';

export default function Profile() {
  const { theme } = useTheme();
  const { config } = useCity();
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const dark = theme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  if (!isAuthenticated || !user) {
    router.replace('/login');
    return null;
  }

  const primaryColor = config?.theme.primaryColor || '#1D4ED8';

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
      Alert.alert(
        'Permission refusée',
        'Nous avons besoin de votre permission pour accéder à vos photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      uploadAvatar(selectedImage.uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setIsUploading(true);
    try {
      // In a real app, you would upload to S3 or similar and get a URL.
      // Here we'll simulate the upload or use a local path if the backend supports it.
      // For now, we'll just update the local state to show it works.

      // Update local context
      updateUser({ avatar_url: uri });

      // Update backend
      await apiClient.post('users/avatar', { avatarUrl: uri });

      Alert.alert('Succès', 'Votre photo de profil a été mise à jour.');
    } catch (e) {
      console.error('Avatar upload error', e);
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className={`flex-1 ${dark ? 'bg-zinc-950' : 'bg-[#F8FAFC]'}`}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        {/* Header Background */}
        <View
          className='w-full items-center px-6 pt-8 pb-20'
          style={{
            backgroundColor: primaryColor,
            paddingTop: Math.max(insets.top, 32),
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}>
          <View className='w-full flex-row items-center'>
            <TouchableOpacity
              onPress={pickImage}
              disabled={isUploading}
              className='relative mr-4 h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white/40 bg-white/20'>
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} className='h-full w-full' />
              ) : (
                <Ionicons name='person' size={40} color='rgba(255,255,255,0.7)' />
              )}
              {isUploading && (
                <View className='absolute inset-0 items-center justify-center bg-black/30'>
                  <ActivityIndicator color='white' size='small' />
                </View>
              )}
            </TouchableOpacity>
            <View className='flex-1'>
              <Text className='text-2xl font-bold tracking-tight text-white'>
                {user.name} {user.surname}
              </Text>
              <Text className='mt-0.5 text-sm text-white/80'>{user.email}</Text>
              <View className='mt-2 self-start rounded-full bg-white/20 px-2 py-0.5'>
                <Text className='text-[10px] font-bold text-white uppercase'>{user.role}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View className='-mt-12 mb-8 px-5'>
          <View
            className={`flex-row justify-between rounded-[24px] px-6 py-5 shadow-xl ${dark ? 'border border-zinc-800 bg-zinc-900' : 'border border-gray-100 bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
            }}>
            <View className='items-center'>
              <Text className='text-2xl font-bold' style={{ color: primaryColor }}>
                12
              </Text>
              <Text
                className={`mt-1 text-[11px] font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                Signalements
              </Text>
            </View>
            <View className={`h-full w-px ${dark ? 'bg-zinc-800' : 'bg-gray-100'}`} />
            <View className='items-center'>
              <Text className='text-2xl font-bold text-[#10B981]'>8</Text>
              <Text
                className={`mt-1 text-[11px] font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                Résolus
              </Text>
            </View>
            <View className={`h-full w-px ${dark ? 'bg-zinc-800' : 'bg-gray-100'}`} />
            <View className='items-center'>
              <Text className='text-2xl font-bold' style={{ color: primaryColor }}>
                5
              </Text>
              <Text
                className={`mt-1 text-[11px] font-medium ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
                Événements
              </Text>
            </View>
          </View>
        </View>

        {/* Mon compte List */}
        <View className='mb-8 px-5'>
          <Text className={`mb-3 text-base font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
            Mon compte
          </Text>

          <View
            className={`overflow-hidden rounded-[24px] border shadow-sm ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-white'}`}>
            <TouchableOpacity
              className={`flex-row items-center justify-between border-b p-4 ${dark ? 'border-zinc-800' : 'border-gray-50'}`}>
              <View className='flex-row items-center'>
                <View
                  className='mr-3 h-10 w-10 items-center justify-center rounded-full'
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons
                    name='person-outline'
                    size={20}
                    color={dark ? '#60A5FA' : primaryColor}
                  />
                </View>
                <Text
                  className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>
                  Informations personnelles
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center justify-between border-b p-4 ${dark ? 'border-zinc-800' : 'border-gray-50'}`}>
              <View className='flex-row items-center'>
                <View
                  className='mr-3 h-10 w-10 items-center justify-center rounded-full'
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons
                    name='location-outline'
                    size={20}
                    color={dark ? '#60A5FA' : primaryColor}
                  />
                </View>
                <Text
                  className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>
                  Adresse par défaut
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity className='flex-row items-center justify-between p-4'>
              <View className='flex-row items-center'>
                <View
                  className='mr-3 h-10 w-10 items-center justify-center rounded-full'
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons
                    name='notifications-outline'
                    size={20}
                    color={dark ? '#60A5FA' : primaryColor}
                  />
                </View>
                <Text
                  className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>
                  Notifications
                </Text>
              </View>
              <View className='flex-row items-center'>
                <View
                  className='mr-2 h-6 w-6 items-center justify-center rounded-full'
                  style={{ backgroundColor: primaryColor }}>
                  <Text className='text-[10px] font-bold text-white'>3</Text>
                </View>
                <Ionicons name='chevron-forward' size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Paramètres List */}
        <View className='mb-8 px-5'>
          <Text className={`mb-3 text-base font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
            Paramètres
          </Text>

          <View
            className={`overflow-hidden rounded-[24px] border shadow-sm ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-white'}`}>
            <TouchableOpacity
              className={`flex-row items-center justify-between border-b p-4 ${dark ? 'border-zinc-800' : 'border-gray-50'}`}>
              <View className='flex-row items-center'>
                <View className='mr-3 h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30'>
                  <Ionicons
                    name='shield-checkmark-outline'
                    size={20}
                    color={dark ? '#818CF8' : '#4F46E5'}
                  />
                </View>
                <Text
                  className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>
                  Confidentialité et sécurité
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity className='flex-row items-center justify-between p-4'>
              <View className='flex-row items-center'>
                <View className='mr-3 h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30'>
                  <Ionicons
                    name='settings-outline'
                    size={20}
                    color={dark ? '#818CF8' : '#4F46E5'}
                  />
                </View>
                <Text
                  className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>
                  Préférences
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View className='px-5'>
          <Text className={`mb-3 text-base font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>
            Support
          </Text>

          <View
            className={`overflow-hidden rounded-[24px] border shadow-sm ${dark ? 'border-zinc-800 bg-zinc-900' : 'border-gray-100 bg-white'}`}>
            <TouchableOpacity className='flex-row items-center justify-between p-4'>
              <View className='flex-row items-center'>
                <View
                  className='mr-3 h-10 w-10 items-center justify-center rounded-full'
                  style={{ backgroundColor: `${primaryColor}15` }}>
                  <Ionicons
                    name='help-buoy-outline'
                    size={20}
                    color={dark ? '#60A5FA' : primaryColor}
                  />
                </View>
                <Text
                  className={`text-[15px] font-medium ${dark ? 'text-gray-200' : 'text-slate-700'}`}>
                  {"Centre d'aide"}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color={dark ? '#9CA3AF' : '#94A3B8'} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity className='mx-auto mt-8 mb-6' onPress={handleLogout}>
            <Text className='text-base font-semibold text-red-500'>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomBar />
    </View>
  );
}
