import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationPreferences = {
  signalements: boolean;
  travaux: boolean;
  evenements: boolean;
  collecte: boolean;
};

const STORAGE_KEY = 'notification_prefs_v1';

const defaults: NotificationPreferences = {
  signalements: true,
  travaux: true,
  evenements: true,
  collecte: true,
};

export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export async function saveNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
