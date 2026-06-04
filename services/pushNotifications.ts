import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import apiClient from './apiClient';

const EAS_PROJECT_ID_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let pushSetupMessageLogged = false;

function logPushSetupOnce(message: string) {
  if (pushSetupMessageLogged) return;
  pushSetupMessageLogged = true;
  console.info(`[push] ${message}`);
}

/** Compte Apple gratuit : pas de module push natif (évite crash au lancement sur iPhone). */
export function isIosPersonalTeamBuild(): boolean {
  return Constants.expoConfig?.extra?.iosPersonalTeam === true;
}

export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function isPushSupportedEnvironment(): boolean {
  if (isIosPersonalTeamBuild()) return false;
  return !isExpoGo() && !!resolveExpoProjectId();
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

async function loadNotificationsModule() {
  return import('expo-notifications');
}

async function loadDeviceModule() {
  return import('expo-device');
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (isIosPersonalTeamBuild()) {
    logPushSetupOnce(
      'Push désactivé (IOS_PERSONAL_TEAM=1). Compte développeur Apple requis pour les notifications sur iPhone.',
    );
    return null;
  }

  const Device = await loadDeviceModule();
  if (!Device.isDevice) {
    return null;
  }

  const Notifications = await loadNotificationsModule();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
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

  if (isExpoGo()) {
    logPushSetupOnce(
      'Expo Go ne supporte plus les push (SDK 53+). Utilisez un development build.',
    );
    return null;
  }

  const projectId = resolveExpoProjectId();
  if (!projectId) {
    logPushSetupOnce('projectId EAS manquant (npx eas init).');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenResponse.data;
}

export async function syncPushTokenWithBackend(): Promise<boolean> {
  if (!isPushSupportedEnvironment()) {
    return false;
  }

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
