import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Linking,
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
import { BlurView } from 'expo-blur';

export default function Profile() {
  const { theme, colorScheme, setTheme } = useTheme();
  const { config } = useCity();
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<
    'profile' | 'security' | 'notifications' | 'help' | 'city' | null
  >(null);

  // DB Connected Stats
  const [stats, setStats] = useState({
    reports: 0,
    participations: 0,
    points: user?.points || 0,
  });

  // Form States
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    neighborhood: user?.neighborhood || '',
  });

  const [notifSettings, setNotifSettings] = useState({
    alerts: true,
    news: true,
    events: false,
    works: true,
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        email: user.email,
        neighborhood: user.neighborhood || '',
      });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.post('users/stats');
      if (response.data) {
        setStats(response.data);
      }
    } catch (e) {
      console.warn('Could not fetch user stats', e);
    }
  };

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

  const handleImageAction = () => {
    Alert.alert(
      'Photo de profil',
      'Choisissez une option',
      [
        { text: 'Prendre une photo', onPress: () => pickImage('camera') },
        { text: 'Importer de la galerie', onPress: () => pickImage('library') },
        {
          text: 'Supprimer la photo',
          style: 'destructive',
          onPress: deleteAvatar,
        },
        { text: 'Annuler', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const pickImage = async (mode: 'camera' | 'library') => {
    const permission =
      mode === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès nécessaire.');
      return;
    }

    const result =
      mode === 'camera'
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const deleteAvatar = async () => {
    setIsUploading(true);
    try {
      updateUser({ avatar_url: undefined });
      await apiClient.post('users/avatar', { avatarUrl: null });
      Alert.alert('Succès', 'Photo supprimée.');
    } catch {
      Alert.alert('Erreur', 'Suppression impossible.');
    } finally {
      setIsUploading(false);
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

  const handleSaveProfile = async () => {
    setIsUploading(true);
    try {
      // Local update for immediate feedback
      updateUser(formData);
      // Persist to DB
      await apiClient.post('users/profile', formData);
      Alert.alert('Succès', 'Profil mis à jour en base de données.');
      setActiveOverlay(null);
    } catch {
      Alert.alert('Erreur', 'Mise à jour impossible en base de données.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setIsUploading(true);
    try {
      await apiClient.post('users/password', passwordData);
      Alert.alert('Succès', 'Mot de passe mis à jour en base de données.');
      setActiveOverlay(null);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch {
      Alert.alert('Erreur', 'Ancien mot de passe incorrect.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNeighborhoodSelect = async (neighborhood: string) => {
    setIsUploading(true);
    try {
      const updatedData = { ...formData, neighborhood };
      setFormData(updatedData);
      updateUser({ neighborhood });
      await apiClient.post('users/profile', { neighborhood });
      // No alert needed for simple selection, or maybe a small toast
    } catch {
      Alert.alert('Erreur', 'Sauvegarde du quartier impossible.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderHeader = (title: string, onSave?: () => void) => (
    <View className='overflow-hidden'>
      <BlurView
        intensity={dark ? 40 : 80}
        tint={dark ? 'dark' : 'light'}
        style={{ paddingTop: insets.top }}
        className={`flex-row items-center justify-between border-b px-6 pb-5 ${dark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <TouchableOpacity onPress={() => setActiveOverlay(null)} className='py-2'>
          <Text className={`text-base ${dark ? 'text-zinc-400' : 'text-blue-500'}`}>Annuler</Text>
        </TouchableOpacity>
        <Text className={`text-lg font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
          {title}
        </Text>
        {onSave ? (
          <TouchableOpacity onPress={onSave} className='py-2'>
            <Text className='text-base font-bold' style={{ color: primaryColor }}>
              Enregistrer
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setActiveOverlay(null)} className='py-2'>
            <Text className='text-base font-bold' style={{ color: primaryColor }}>
              OK
            </Text>
          </TouchableOpacity>
        )}
      </BlurView>
    </View>
  );

  const SectionTitle = ({ title, first }: { title: string; first?: boolean }) => (
    <Text
      className={`mb-4 text-xs font-bold tracking-[0.2em] uppercase ${first ? 'mt-4' : 'mt-10'} ml-4 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
      {title}
    </Text>
  );

  return (
    <View className={`flex-1 ${dark ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className='mb-8'>
          <Text
            className={`mb-1 text-xs font-bold tracking-[0.2em] uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Réglages
          </Text>
          <Text
            className={`text-4xl font-black tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
            Profil
          </Text>
        </View>

        {/* Profile Card */}
        <View
          className={`mb-8 overflow-hidden rounded-[32px] ${dark ? 'bg-zinc-900' : 'bg-white'} items-center border border-zinc-100 p-6 shadow-sm dark:border-zinc-800`}>
          <TouchableOpacity
            onPress={handleImageAction}
            onLongPress={() => setIsPreviewVisible(true)}
            delayLongPress={300}
            disabled={isUploading}
            className='relative mb-4'>
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

        {/* City Info Row (DB LINKED) */}
        <TouchableOpacity
          onPress={() => setActiveOverlay('city')}
          className={`mb-4 flex-row items-center justify-between rounded-[24px] p-5 ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 shadow-sm dark:border-zinc-800`}>
          <View className='flex-row items-center'>
            <View className='mr-4 h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30'>
              <Ionicons name='business' size={20} color='#34C759' />
            </View>
            <View>
              <Text
                className={`text-[10px] font-black tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Ma Ville
              </Text>
              <Text className={`text-base font-bold ${dark ? 'text-white' : 'text-black'}`}>
                {config?.name || '...'}
              </Text>
            </View>
          </View>
          <View className='flex-row items-center'>
            {formData.neighborhood ? (
              <Text className='mr-2 text-xs text-zinc-400'>{formData.neighborhood}</Text>
            ) : null}
            <Ionicons name='chevron-forward' size={16} color={dark ? '#3F3F46' : '#D4D4D8'} />
          </View>
        </TouchableOpacity>

        {/* Stats Grid (DB LINKED) */}
        <View className='mb-8 flex-row justify-between'>
          {[
            {
              label: 'Signalements',
              value: stats.reports.toString(),
              icon: 'alert-circle',
              color: '#FF3B30',
            },
            {
              label: 'Participations',
              value: stats.participations.toString(),
              icon: 'calendar',
              color: '#007AFF',
            },
            { label: 'Points', value: stats.points.toString(), icon: 'star', color: '#FFD60A' },
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

        {/* Appearance Section */}
        <SectionTitle title='Apparence' first />
        <View
          className={`mb-8 rounded-[20px] p-1.5 ${dark ? 'bg-zinc-900' : 'bg-white'} flex-row border border-zinc-100 dark:border-zinc-800`}>
          {[
            { id: 'light', label: 'Clair', icon: 'sunny' },
            { id: 'dark', label: 'Sombre', icon: 'moon' },
            { id: 'system', label: 'Système', icon: 'settings' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setTheme(option.id as any)}
              className={`flex-1 flex-row items-center justify-center rounded-2xl py-3 ${theme === option.id ? (dark ? 'bg-zinc-800' : 'bg-zinc-100') : ''}`}>
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

        {/* Settings List */}
        <SectionTitle title='Réglages' />
        <View
          className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} mb-6 border border-zinc-100 shadow-sm dark:border-zinc-800`}>
          {[
            {
              label: 'Informations personnelles',
              icon: 'person-outline',
              color: '#007AFF',
              action: () => setActiveOverlay('profile'),
            },
            {
              label: 'Sécurité et mot de passe',
              icon: 'shield-checkmark-outline',
              color: '#34C759',
              action: () => setActiveOverlay('security'),
            },
            {
              label: 'Notifications',
              icon: 'notifications-outline',
              color: '#FF9500',
              action: () => setActiveOverlay('notifications'),
            },
            {
              label: "Centre d'aide",
              icon: 'help-buoy-outline',
              color: '#AF52DE',
              action: () => setActiveOverlay('help'),
            },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={item.action}
              className={`flex-row items-center justify-between p-4 ${i !== 3 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
              <View className='flex-row items-center'>
                <View
                  className='mr-3 h-9 w-9 items-center justify-center rounded-lg'
                  style={{ backgroundColor: `${item.color}15` }}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text
                  className={`text-sm font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={16} color='#D4D4D8' />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout} className='mb-4 items-center py-4'>
          <Text className='text-base font-bold text-red-500'>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* OVERLAYS */}

      {/* Profile Edit Overlay (DB CONNECTED) */}
      {activeOverlay === 'profile' && (
        <View className={`absolute inset-0 z-[110] ${dark ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
          {renderHeader('Informations', handleSaveProfile)}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className='flex-1'>
            <ScrollView
              contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 24 }}
              className='flex-1'>
              <SectionTitle title='IDENTITÉ' first />
              <View
                className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 dark:border-zinc-800`}>
                <View
                  className={`flex-row items-center border-b p-5 ${dark ? 'border-zinc-800' : 'border-zinc-50'}`}>
                  <Text
                    className={`w-24 text-sm font-bold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Prénom
                  </Text>
                  <TextInput
                    value={formData.name}
                    onChangeText={(t) => setFormData({ ...formData, name: t })}
                    className={`flex-1 text-base font-medium ${dark ? 'text-white' : 'text-black'}`}
                    placeholder='Votre prénom'
                    placeholderTextColor={dark ? '#3F3F46' : '#A1A1AA'}
                  />
                </View>
                <View className='flex-row items-center p-5'>
                  <Text
                    className={`w-24 text-sm font-bold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Nom
                  </Text>
                  <TextInput
                    value={formData.surname}
                    onChangeText={(t) => setFormData({ ...formData, surname: t })}
                    className={`flex-1 text-base font-medium ${dark ? 'text-white' : 'text-black'}`}
                    placeholder='Votre nom'
                    placeholderTextColor={dark ? '#3F3F46' : '#A1A1AA'}
                  />
                </View>
              </View>

              <SectionTitle title='CONTACT' />
              <View
                className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 dark:border-zinc-800`}>
                <View className='flex-row items-center p-5'>
                  <Text
                    className={`w-24 text-sm font-bold ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Email
                  </Text>
                  <TextInput
                    value={formData.email}
                    onChangeText={(t) => setFormData({ ...formData, email: t })}
                    className={`flex-1 text-base font-medium ${dark ? 'text-white' : 'text-black'}`}
                    placeholder='Votre email'
                    keyboardType='email-address'
                    autoCapitalize='none'
                    placeholderTextColor={dark ? '#3F3F46' : '#A1A1AA'}
                  />
                </View>
              </View>
              <Text
                className={`mt-10 px-4 text-center text-xs leading-5 ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Ces informations permettent à la ville de vous identifier lors de vos signalements.
              </Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Security Overlay (DB CONNECTED) */}
      {activeOverlay === 'security' && (
        <View className={`absolute inset-0 z-[110] ${dark ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
          {renderHeader('Sécurité', handleUpdatePassword)}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className='flex-1'>
            <ScrollView
              contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 24 }}
              className='flex-1'>
              <SectionTitle title='MOT DE PASSE' first />
              <View
                className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 dark:border-zinc-800`}>
                <View
                  className={`flex-row items-center border-b p-5 ${dark ? 'border-zinc-800' : 'border-zinc-50'}`}>
                  <TextInput
                    secureTextEntry
                    value={passwordData.current}
                    onChangeText={(t) => setPasswordData({ ...passwordData, current: t })}
                    className={`flex-1 text-base font-medium ${dark ? 'text-white' : 'text-black'}`}
                    placeholder='Mot de passe actuel'
                    placeholderTextColor={dark ? '#3F3F46' : '#A1A1AA'}
                  />
                </View>
                <View
                  className={`flex-row items-center border-b p-5 ${dark ? 'border-zinc-800' : 'border-zinc-50'}`}>
                  <TextInput
                    secureTextEntry
                    value={passwordData.new}
                    onChangeText={(t) => setPasswordData({ ...passwordData, new: t })}
                    className={`flex-1 text-base font-medium ${dark ? 'text-white' : 'text-black'}`}
                    placeholder='Nouveau mot de passe'
                    placeholderTextColor={dark ? '#3F3F46' : '#A1A1AA'}
                  />
                </View>
                <View className='flex-row items-center p-5'>
                  <TextInput
                    secureTextEntry
                    value={passwordData.confirm}
                    onChangeText={(t) => setPasswordData({ ...passwordData, confirm: t })}
                    className={`flex-1 text-base font-medium ${dark ? 'text-white' : 'text-black'}`}
                    placeholder='Confirmer le nouveau'
                    placeholderTextColor={dark ? '#3F3F46' : '#A1A1AA'}
                  />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Notifications Overlay */}
      {activeOverlay === 'notifications' && (
        <View className={`absolute inset-0 z-[110] ${dark ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
          {renderHeader('Notifications')}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 24 }}
            className='flex-1'>
            <SectionTitle title='PRÉFÉRENCES' first />
            <View
              className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} border border-zinc-100 dark:border-zinc-800`}>
              {[
                { label: 'Alertes urgentes', key: 'alerts', icon: 'notifications' },
                { label: 'Actualités ville', key: 'news', icon: 'newspaper' },
                { label: 'Événements', key: 'events', icon: 'calendar' },
                { label: 'Suivi travaux', key: 'works', icon: 'construct' },
              ].map((item, i) => (
                <View
                  key={item.key}
                  className={`flex-row items-center justify-between p-5 ${i !== 3 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
                  <View className='flex-row items-center'>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={dark ? '#3F3F46' : '#D4D4D8'}
                      className='mr-3'
                    />
                    <Text
                      className={`text-base font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                      {item.label}
                    </Text>
                  </View>
                  <Switch
                    value={(notifSettings as any)[item.key]}
                    onValueChange={(v) => setNotifSettings({ ...notifSettings, [item.key]: v })}
                    trackColor={{ false: '#767577', true: primaryColor }}
                    ios_backgroundColor='#3e3e3e'
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Help Overlay */}
      {activeOverlay === 'help' && (
        <View className={`absolute inset-0 z-[110] ${dark ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
          {renderHeader('Aide & Support')}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 24 }}
            className='flex-1'>
            <View
              className={`rounded-[40px] p-10 ${dark ? 'bg-zinc-900' : 'bg-white'} mt-8 mb-10 items-center border border-zinc-100 dark:border-zinc-800`}>
              <View className='mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 dark:bg-blue-900/20'>
                <Ionicons name='help-buoy' size={44} color={primaryColor} />
              </View>
              <Text
                className={`mb-3 text-center text-3xl font-black ${dark ? 'text-white' : 'text-black'}`}>
                On vous aide ?
              </Text>
              <Text
                className={`text-center text-sm leading-6 ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Notre équipe support est disponible du lundi au vendredi pour répondre à vos
                questions techniques.
              </Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Ma Ville Overlay (DB CONNECTED) */}
      {activeOverlay === 'city' && (
        <View className={`absolute inset-0 z-[110] ${dark ? 'bg-black' : 'bg-[#F2F2F7]'}`}>
          {renderHeader('Ma Ville')}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 24 }}
            className='flex-1'>
            {/* City Banner */}
            <View
              className={`rounded-[40px] p-8 ${dark ? 'bg-zinc-900' : 'bg-white'} mt-8 mb-10 items-center border border-zinc-100 dark:border-zinc-800`}>
              <View className='mb-6 h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-emerald-50 dark:bg-emerald-900/20'>
                {config?.theme.logoUrl ? (
                  <Image
                    source={{ uri: config.theme.logoUrl }}
                    className='h-full w-full'
                    resizeMode='contain'
                  />
                ) : (
                  <Ionicons name='business' size={48} color='#34C759' />
                )}
              </View>
              <Text
                className={`mb-1 text-center text-3xl font-black ${dark ? 'text-white' : 'text-black'}`}>
                {config?.name || 'Ma Ville'}
              </Text>
              <Text
                className={`text-sm font-bold tracking-widest uppercase ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Citoyen Engagé
              </Text>
            </View>

            {/* Neighborhoods (FROM DB CONFIG) */}
            <SectionTitle title='MON QUARTIER' />
            <View
              className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} mb-8 border border-zinc-100 dark:border-zinc-800`}>
              {(config?.neighborhoods && config.neighborhoods.length > 0
                ? config.neighborhoods
                : ['Centre-Ville', 'Quartier Nord', 'Quartier Sud']
              ).map((neighborhood, i, arr) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleNeighborhoodSelect(neighborhood)}
                  className={`flex-row items-center justify-between p-5 ${i !== arr.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
                  <Text
                    className={`text-base font-semibold ${formData.neighborhood === neighborhood ? (dark ? 'text-white' : 'text-black') : dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {neighborhood}
                  </Text>
                  {formData.neighborhood === neighborhood && (
                    <Ionicons name='checkmark-circle' size={24} color={primaryColor} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Useful Numbers (FROM DB CONFIG) */}
            <SectionTitle title='NUMÉROS UTILES' />
            <View
              className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} mb-8 border border-zinc-100 dark:border-zinc-800`}>
              {(config?.usefulNumbers && config.usefulNumbers.length > 0
                ? config.usefulNumbers
                : [
                    { label: 'Mairie', phone: '01 00 00 00 00', icon: 'business-outline' },
                    { label: 'Police Municipale', phone: '01 00 00 00 01', icon: 'shield-outline' },
                  ]
              ).map((contact, i, arr) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                  className={`flex-row items-center justify-between p-5 ${i !== arr.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
                  <View className='flex-row items-center'>
                    <Ionicons
                      name={(contact.icon || 'call-outline') as any}
                      size={20}
                      color={primaryColor}
                      className='mr-3'
                    />
                    <View>
                      <Text
                        className={`text-sm font-bold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                        {contact.label}
                      </Text>
                      <Text className='text-xs text-zinc-500'>{contact.phone}</Text>
                    </View>
                  </View>
                  <Ionicons name='call-outline' size={18} color='#D4D4D8' />
                </TouchableOpacity>
              ))}
            </View>

            {/* Useful Links (FROM DB CONFIG) */}
            <SectionTitle title='LIENS UTILES' />
            <View
              className={`overflow-hidden rounded-[28px] ${dark ? 'bg-zinc-900' : 'bg-white'} mb-10 border border-zinc-100 dark:border-zinc-800`}>
              {(config?.usefulLinks && config.usefulLinks.length > 0
                ? config.usefulLinks
                : [{ label: 'Site officiel', url: 'https://google.com', icon: 'globe-outline' }]
              ).map((link, i, arr) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => Linking.openURL(link.url)}
                  className={`flex-row items-center justify-between p-5 ${i !== arr.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
                  <Text
                    className={`text-base font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {link.label}
                  </Text>
                  <Ionicons name='open-outline' size={18} color='#D4D4D8' />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Profile Image Preview Overlay */}
      {isPreviewVisible && (
        <View className='absolute inset-0 z-[120] items-center justify-center'>
          <TouchableOpacity
            activeOpacity={1}
            className='absolute inset-0'
            onPress={() => setIsPreviewVisible(false)}>
            <BlurView intensity={80} tint='dark' className='flex-1' />
          </TouchableOpacity>
          <View className='aspect-square w-[85%] overflow-hidden rounded-[40px] border-4 border-white/20 shadow-2xl'>
            {user.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                className='h-full w-full'
                resizeMode='cover'
              />
            ) : (
              <View className='flex-1 items-center justify-center bg-zinc-900'>
                <Ionicons name='person' size={120} color='#3F3F46' />
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setIsPreviewVisible(false)}
            className='mt-8 rounded-full border border-white/20 bg-white/10 px-8 py-3'>
            <Text className='font-black text-white'>FERMER</Text>
          </TouchableOpacity>
        </View>
      )}

      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
