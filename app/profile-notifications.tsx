import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch, ActivityIndicator } from 'react-native';
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
  const { dark, classes, primaryColor, layoutStyles } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await loadNotificationPreferences();
    setPrefs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    load();
  }, [isAuthenticated, load, router]);

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
        <Text className={`mb-4 ${classes.body}`}>
          {pushAvailable
            ? 'Les alertes push sont actives sur cet appareil. Choisissez les types de messages que vous souhaitez recevoir.'
            : 'Les préférences ci-dessous seront appliquées lorsque les notifications push seront disponibles sur cet appareil (build de production).'}
        </Text>
        <View className={`overflow-hidden rounded-[24px] ${classes.listGroup}`}>
          {OPTIONS.map((option, index) => (
            <View
              key={option.key}
              className={`flex-row items-center justify-between p-4 ${index < OPTIONS.length - 1 ? 'border-b border-zinc-50 dark:border-zinc-800' : ''}`}>
              <View className='mr-4 flex-1'>
                <Text
                  className={`text-sm font-semibold ${dark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {option.label}
                </Text>
                <Text className={`mt-1 text-xs ${dark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {option.description}
                </Text>
              </View>
              <Switch
                value={prefs[option.key]}
                onValueChange={(v) => toggle(option.key, v)}
                trackColor={{ false: '#3F3F46', true: primaryColor }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
