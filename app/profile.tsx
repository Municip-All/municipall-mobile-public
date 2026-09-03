import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAppTheme } from '@hooks/useAppTheme';
import { useCity } from '@context/citycontext';
import { useAuth } from '@context/authcontext';
import { Ionicons } from '@expo/vector-icons';
import BottomBar from '@components/BottomBar';
import FloatingMapButton from '@components/FloatingMapButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { pickProofImage } from '../utils/pickProofImage';
import type { IconName, RouteHref, ThemeId } from '../lib/types';
import { getPartnerCitiesCached } from '../services/partnerCitiesCache';
import { isPartnerCity, partnerCityName } from '../lib/partnerCities';
import { cityDisplayName } from '../lib/cityDisplay';
import ConvinceMayorModal from '@components/ConvinceMayorModal';
import CityNotListedChip from '@components/CityNotListedChip';
import { openReferCityEmail } from '../lib/referCity';
import { uploadUserAvatar, getUserStats, updateUserCity, getAvatarUploadErrorMessage } from '../services/userProfileService';
import { isPersistentAvatarUrl } from '../utils/avatarImage';

export default function Profile() {
  const { theme, dark, primaryColor, classes, colors, setTheme, layoutStyles, typeStyles } = useAppTheme();
  const { applyBrandingCity } = useCity();
  const { user, logout, updateUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [availableCities, setAvailableCities] = useState<
    { id: string; name: string; officialName?: string }[]
  >([]);
  const [showConvinceModal, setShowConvinceModal] = useState(false);
  const [userStats, setUserStats] = useState({ reports: 0, participations: 0, points: 0 });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const loadProfileData = useCallback(async (signal?: { cancelled: boolean }) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const stats = await getUserStats();
      if (!signal?.cancelled) setUserStats(stats);

      const cities = await getPartnerCitiesCached();
      if (!signal?.cancelled) setAvailableCities(cities);
    } catch {
      if (!signal?.cancelled) setProfileError('Impossible de charger les données du profil.');
    } finally {
      if (!signal?.cancelled) setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    loadProfileData(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [loadProfileData]);

  const [profileRefreshing, setProfileRefreshing] = useState(false);

  const onProfileRefresh = useCallback(async () => {
    setProfileRefreshing(true);
    await loadProfileData();
    setProfileRefreshing(false);
  }, [loadProfileData]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (!isAuthenticated || !user) {
    if (authLoading) {
      return (
        <View style={layoutStyles.page} className='items-center justify-center'>
          <ActivityIndicator size='large' color={primaryColor} />
        </View>
      );
    }
    return null;
  }

  if (profileLoading) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center'>
        <ActivityIndicator size='large' color={primaryColor} />
      </View>
    );
  }

  if (profileError) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center'>
        <Ionicons name='alert-circle-outline' size={48} color={colors.iconMuted} />
        <Text
 className={`mt-4 text-center font-medium`} style={{ color: colors.textSecondary }}>
          {profileError}
        </Text>
        <TouchableOpacity onPress={() => loadProfileData()} className='mt-4'>
          <Text style={{ color: primaryColor }} className='font-bold'>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleUpdateCity = async (cityId: string) => {
    try {
      await updateUserCity(cityId);
      updateUser({ ...user, cityId });
      await applyBrandingCity(cityId);
      setShowCityPicker(false);
      Alert.alert('Succès', 'Ville et identité visuelle mises à jour.');
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour la ville.');
    }
  };

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
    const uri = await pickProofImage({
      title: 'Photo de profil',
      message: 'Prenez une photo ou choisissez une image dans votre galerie.',
      pickerOptions: { aspect: [1, 1], quality: 0.4, allowsEditing: true },
    });
    if (uri) uploadAvatar(uri);
  };

  const uploadAvatar = async (uri: string) => {
    const previousAvatar = user.avatar_url;
    setIsUploading(true);
    try {
      updateUser({ avatar_url: uri });
      const avatarUrl = await uploadUserAvatar(uri, user.id);
      updateUser({ avatar_url: avatarUrl });
      Alert.alert('Succès', 'Photo mise à jour.');
    } catch (error: unknown) {
      updateUser({ avatar_url: previousAvatar });
      Alert.alert('Erreur', getAvatarUploadErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const displayAvatarUrl =
    user.avatar_url &&
    (isPersistentAvatarUrl(user.avatar_url) || user.avatar_url.startsWith('file://'))
      ? user.avatar_url
      : undefined;

  const residenceIsPartner = isPartnerCity(user.cityId, availableCities);
  const residenceName =
    partnerCityName(user.cityId, availableCities) || (user.cityId ? undefined : 'Non définie');

  return (
    <View style={layoutStyles.page}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={profileRefreshing}
            onRefresh={onProfileRefresh}
            tintColor={primaryColor}
          />
        }>
        <View className='mb-8'>
          <Text className={classes.eyebrow} style={[typeStyles.eyebrow, { color: colors.textSecondary }]}>
            Compte
          </Text>
          <Text className={classes.title} style={[typeStyles.title, { color: colors.textPrimary }]}>
            Profil
          </Text>
        </View>

        <View className={`mb-8 items-center p-6 ${classes.cardRoundedLg}`} style={layoutStyles.cardRoundedLg}>
          <TouchableOpacity
            onPress={pickImage}
            disabled={isUploading}
            className='relative mb-4'
            accessibilityRole='button'
            accessibilityLabel='Changer la photo de profil'>
            <View className='border-cream-50 bg-cream-200 dark:border-night-surface dark:bg-night-elevated h-24 w-24 overflow-hidden rounded-full border-4'>
              {displayAvatarUrl ? (
                <Image
                  source={{ uri: displayAvatarUrl }}
                  className='h-full w-full'
                  accessible={false}
                  accessibilityElementsHidden
                />
              ) : (
                <View className='flex-1 items-center justify-center'>
                  <Ionicons name='person' size={40} color={colors.iconMuted} />
                </View>
              )}
            </View>
            {isUploading && (
              <View className='absolute inset-0 items-center justify-center rounded-full bg-black/20'>
                <ActivityIndicator color='white' />
              </View>
            )}
            <View className='border-cream-200 bg-cream-50 shadow-soft dark:border-night-border dark:bg-night-elevated absolute right-0 bottom-0 h-8 w-8 items-center justify-center rounded-full border'>
              <Ionicons name='camera' size={16} color={primaryColor} />
            </View>
          </TouchableOpacity>
          <Text className={classes.sectionTitle} style={[typeStyles.sectionTitle, { color: colors.textPrimary }]}>
            {user.name} {user.surname}
          </Text>
          <Text className={classes.subtitle} style={[typeStyles.subtitle, { color: colors.textSecondary }]}>
            {user.email}
          </Text>
        </View>

        <View className='mb-8 flex-row justify-between'>
          {[
            {
              label: 'Signalements',
              value: userStats.reports.toString(),
              icon: 'alert-circle',
              color: colors.destructive,
            },
            {
              label: 'Participations',
              value: userStats.participations.toString(),
              icon: 'calendar',
              color: colors.info,
            },
            {
              label: 'Points',
              value: userStats.points.toString(),
              icon: 'star',
              color: colors.points,
            },
          ].map((stat, i) => (
            <View
              key={i}
              className={`flex-1 items-center rounded-[20px] p-4 ${dark ? 'bg-night-surface' : 'bg-cream-50'} border-cream-200 shadow-soft dark:border-night-border mx-1 border`}>
              <Ionicons name={stat.icon as IconName} size={20} color={stat.color} />
              <Text
                className='mt-1 text-lg font-extrabold'
                style={{ color: colors.textPrimary }}>
                {stat.value}
              </Text>
              <Text className={classes.meta} style={[typeStyles.meta, { color: colors.textSecondary }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <Text className={`mb-3 ml-4 ${classes.eyebrow}`} style={[typeStyles.eyebrow, { color: colors.textSecondary }]}>
          Ma Résidence
        </Text>
        <View
          className={`mb-8 overflow-hidden rounded-[20px] ${dark ? 'bg-night-surface' : 'bg-cream-50'} border-cream-200 shadow-soft dark:border-night-border border p-5`}>
          <View className='mb-4 flex-row items-center justify-between'>
            <View className='min-w-0 flex-1 flex-row items-center'>
              <View
                className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${dark ? 'bg-night-elevated' : 'bg-matcha-100'}`}>
                <Ionicons name='business' size={20} color={colors.success} />
              </View>
              <View className='min-w-0 flex-1 pr-2'>
                <Text className='text-sm font-bold' style={{ color: colors.textBody }}>
                  {residenceName ?? 'Commune non référencée'}
                </Text>
                <Text className={classes.meta} style={[typeStyles.meta, { color: colors.textSecondary }]}>
                  {residenceIsPartner
                    ? "Commune partenaire Municip'All"
                    : user.cityId
                      ? 'Commune non partenaire'
                      : 'Commune non renseignée — services municipaux limités'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowCityPicker(!showCityPicker)}
              className='bg-cream-100 dark:bg-night-elevated shrink-0 rounded-full px-4 py-2'>
              <Text className='text-xs font-bold' style={{ color: colors.textBody }}>
                Modifier
              </Text>
            </TouchableOpacity>
          </View>

          {showCityPicker && (
            <View className='border-cream-100 dark:border-night-border flex-row flex-wrap gap-2 border-t pt-3'>
              {availableCities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  onPress={() => handleUpdateCity(city.id)}
                  className={`rounded-xl border px-3 py-2 ${user.cityId === city.id ? '' : classes.chipInactive}`}
                  style={
                    user.cityId === city.id
                      ? { backgroundColor: primaryColor, borderColor: primaryColor }
                      : undefined
                  }>
                  <Text
                    className='text-xs font-bold'
                    style={{
                      color:
                        user.cityId === city.id ? colors.onPrimary : colors.textSecondary,
                    }}>
                    {cityDisplayName(city)}
                  </Text>
                </TouchableOpacity>
              ))}
              <CityNotListedChip
                dark={dark}
                selected={!user.cityId}
                primaryColor={primaryColor}
                onPress={() => {
                  setShowCityPicker(false);
                  setShowConvinceModal(true);
                }}
              />
            </View>
          )}
        </View>

        <Text className={`mb-3 ml-4 ${classes.eyebrow}`} style={[typeStyles.eyebrow, { color: colors.textSecondary }]}>
          Apparence
        </Text>
        <View
          className={`mb-8 rounded-2xl p-1 ${dark ? 'bg-night-surface' : 'bg-cream-50'} border-cream-200 dark:border-night-border flex-row border`}>
          {[
            { id: 'light', label: 'Clair', icon: 'sunny' },
            { id: 'dark', label: 'Sombre', icon: 'moon' },
            { id: 'system', label: 'Système', icon: 'settings' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setTheme(option.id as ThemeId)}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${theme === option.id ? (dark ? 'bg-night-elevated' : 'bg-cream-100') : ''}`}>
              <Ionicons
                name={option.icon as IconName}
                size={16}
                color={theme === option.id ? primaryColor : colors.iconMuted}
              />
              <Text
                className='ml-2 text-xs font-bold'
                style={{
                  color:
                    theme === option.id ? colors.textPrimary : colors.textSecondary,
                }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className={`mb-3 ml-4 ${classes.eyebrow}`} style={[typeStyles.eyebrow, { color: colors.textSecondary }]}>
          Réglages
        </Text>
        <View
          className={`overflow-hidden rounded-[20px] ${dark ? 'bg-night-surface' : 'bg-cream-50'} border-cream-200 shadow-soft dark:border-night-border mb-6 border`}>
          {[
            {
              label: 'Informations personnelles',
              icon: 'person-outline',
              color: colors.info,
              route: '/profile-personal-info',
            },
            {
              label: 'Sécurité et mot de passe',
              icon: 'shield-checkmark-outline',
              color: colors.success,
              route: '/profile-security',
            },
            {
              label: 'Notifications',
              icon: 'notifications-outline',
              color: colors.warning,
              route: '/profile-notifications',
            },
            {
              label: "Centre d'aide",
              icon: 'help-buoy-outline',
              color: colors.accent,
              route: '/profile-help',
            },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(item.route as RouteHref)}
              className={`flex-row items-center justify-between p-4 ${i !== arr.length - 1 ? 'border-cream-100 dark:border-night-border border-b' : ''}`}>
              <View className='flex-row items-center'>
                <View
                  className='mr-3 h-8 w-8 items-center justify-center rounded-lg'
                  style={{ backgroundColor: `${item.color}15` }}>
                  <Ionicons name={item.icon as IconName} size={18} color={item.color} />
                </View>
                <Text className='text-sm font-semibold' style={{ color: colors.textBody }}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={16} color={colors.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <Text className={`mb-3 ml-4 ${classes.eyebrow}`} style={[typeStyles.eyebrow, { color: colors.textSecondary }]}>
          Confidentialité et légal
        </Text>
        <View
          className={`overflow-hidden rounded-[20px] ${dark ? 'bg-night-surface' : 'bg-cream-50'} border-cream-200 shadow-soft dark:border-night-border mb-6 border`}>
          {[
            {
              label: 'Mes données personnelles',
              icon: 'shield-outline',
              color: colors.info,
              route: '/legal/my-data',
            },
            {
              label: 'Politique de confidentialité',
              icon: 'lock-closed-outline',
              color: colors.success,
              route: '/legal/privacy',
            },
            {
              label: "Conditions d'utilisation",
              icon: 'document-text-outline',
              color: colors.warning,
              route: '/legal/cgu',
            },
            {
              label: 'Informations légales',
              icon: 'library-outline',
              color: colors.accent,
              route: '/legal',
            },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as RouteHref)}
              className={`flex-row items-center justify-between p-4 ${i !== arr.length - 1 ? 'border-cream-100 dark:border-night-border border-b' : ''}`}>
              <View className='flex-row items-center'>
                <View
                  className='mr-3 h-8 w-8 items-center justify-center rounded-lg'
                  style={{ backgroundColor: `${item.color}15` }}>
                  <Ionicons name={item.icon as IconName} size={18} color={item.color} />
                </View>
                <Text className='text-sm font-semibold' style={{ color: colors.textBody }}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={16} color={colors.chevron} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className='items-center py-4'
          accessibilityRole='button'
          accessibilityLabel='Se déconnecter'>
          <Text className='text-base font-bold' style={{ color: colors.destructive }}>
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ConvinceMayorModal
        visible={showConvinceModal}
        onClose={() => setShowConvinceModal(false)}
        onSendEmail={openReferCityEmail}
        dark={dark}
        primaryColor={primaryColor}
        bottomInset={insets.bottom}
      />

      <FloatingMapButton />
      <BottomBar />
    </View>
  );
}
