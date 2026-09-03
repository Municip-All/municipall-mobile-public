import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@hooks/useAppTheme';
import { useAuth } from '@context/authcontext';
import ProfileScreenHeader from '@components/ProfileScreenHeader';
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  NotificationPreferences,
} from '../services/notificationPreferences';
import { isPushSupportedEnvironment } from '../services/pushNotifications';

const OPTIONS: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  {
    key: 'signalements',
    label: 'Signalements',
    description: 'Suivi de vos signalements et réponses de la mairie.',
  },
  {
    key: 'travaux',
    label: 'Travaux',
    description: 'Chantiers et perturbations dans votre ville.',
  },
  {
    key: 'evenements',
    label: 'Événements',
    description: 'Agenda culturel et animations municipales.',
  },
  {
    key: 'collecte',
    label: 'Collecte',
    description: 'Rappels de collecte des déchets.',
  },
];

export default function ProfileNotificationsScreen() {
  const { dark, classes, primaryColor, colors, layoutStyles, typeStyles } = useAppTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async (signal?: { cancelled: boolean }) => {
    try {
      const data = await loadNotificationPreferences();
      if (!signal?.cancelled) {
        setPrefs(data);
        setLoading(false);
        setLoadError(null);
      }
    } catch {
      if (!signal?.cancelled) {
        setLoadError('Impossible de charger les préférences.');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.replace('/login');
      return;
    }
    const signal = { cancelled: false };
    load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [isAuthenticated, authLoading, load, router]);

  const toggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await saveNotificationPreferences(next);
  };

  if (!prefs && loading) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center'>
        <ActivityIndicator color={primaryColor} />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={layoutStyles.page} className='items-center justify-center px-6'>
        <Text className={`text-center text-base ${classes.body}`} style={typeStyles.body}>{loadError}</Text>
        <TouchableOpacity
          onPress={() => {
            setLoadError(null);
            setLoading(true);
            load();
          }}
          accessibilityRole='button'
          accessibilityLabel='Réessayer'
          className='mt-4 rounded-xl px-6 py-3'
          style={{ backgroundColor: primaryColor }}>
          <Text className='font-bold' style={{ color: colors.onPrimary }}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!prefs) return null;

  const pushAvailable = isPushSupportedEnvironment();

  return (
    <View style={layoutStyles.page}>
      <ProfileScreenHeader title='Notifications' />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 32,
          paddingTop: 16,
        }}>
        <Text className={`mb-4 ${classes.body}`} style={typeStyles.body}>
          {pushAvailable
            ? 'Les alertes push sont actives sur cet appareil. Choisissez les types de messages que vous souhaitez recevoir.'
            : 'Les préférences ci-dessous seront appliquées lorsque les notifications push seront disponibles sur cet appareil (build de production).'}
        </Text>
        <View className={classes.listGroup}>
          {OPTIONS.map((option, index) => (
            <View
              key={option.key}
              className={`flex-row items-center justify-between p-4 ${index < OPTIONS.length - 1 ? `border-b ${dark ? 'border-night-border' : 'border-cream-200'}` : ''}`}>
              <View className='mr-4 flex-1'>
                <Text
 className={`text-sm font-semibold`} style={{ color: colors.textBody }}>
                  {option.label}
                </Text>
                <Text className={`mt-1 text-xs`} style={{ color: colors.textSecondary }}>
                  {option.description}
                </Text>
              </View>
              <Switch
                value={prefs[option.key]}
                onValueChange={(v) => toggle(option.key, v)}
                trackColor={{
                  false: dark ? colors.palette.nightBorder : colors.palette.cream200,
                  true: primaryColor,
                }}
                accessibilityLabel={`${option.label}: ${prefs[option.key] ? 'activé' : 'désactivé'}`}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
