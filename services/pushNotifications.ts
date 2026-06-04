import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import apiClient from './apiClient';

const EAS_PROJECT_ID_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let pushSetupMessageLogged = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function logPushSetupOnce(message: string) {
  if (pushSetupMessageLogged) return;
  pushSetupMessageLogged = true;
  console.info(`[push] ${message}`);
}

export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function isPushSupportedEnvironment(): boolean {
  return Device.isDevice && !isExpoGo() && !!resolveExpoProjectId();
}

function resolveExpoProjectId(): string | undefined {
  const candidates = [
    Constants.expoConfig?.extra?.eas?.projectId,
    Constants.easConfig?.projectId,
  ];

  for (const id of candidates) {
    if (typeof id === 'string' && EAS_PROJECT_ID_UUID.test(id)) {
      return id;
    }
  }
  return undefined;
}

async function ensureAndroidChannels() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Informations',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  await Notifications.setNotificationChannelAsync('urgent', {
    name: 'Urgences',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}

async function fetchExpoPushToken(): Promise<string | null> {
  if (isExpoGo()) {
    logPushSetupOnce(
      'Expo Go ne supporte plus les push (SDK 53+). Utilisez un development build : npm run ios ou npm run android.',
    );
    return null;
  }

  const projectId = resolveExpoProjectId();
  if (!projectId) {
    logPushSetupOnce(
      'projectId EAS manquant. Exécutez "npx eas init" puis relancez avec npm run ios (ou android).',
    );
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenResponse.data;
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  await ensureAndroidChannels();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  return fetchExpoPushToken();
}

export async function syncPushTokenWithBackend(): Promise<boolean> {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return false;

    await apiClient.post('users/push-token', { expoPushToken: token });
    return true;
  } catch (e) {
    console.warn('Push token sync failed', e);
    return false;
  }
}
