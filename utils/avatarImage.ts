import { File, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const localAvatarKey = (userId: number) => `user_avatar_local_${userId}`;

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/** Convertit une image locale en data URL pour persistance côté API. */
export async function localImageUriToDataUrl(uri: string): Promise<string> {
  const file = new File(uri);
  const buffer = await file.arrayBuffer();
  const ext = file.extension?.toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const base64 = uint8ToBase64(new Uint8Array(buffer));
  return `data:${mime};base64,${base64}`;
}

/**
 * Prépare une image pour l'API.
 * La compression se fait à la sélection (quality dans ImagePicker), pas via module natif.
 */
export async function prepareImageForUpload(uri: string): Promise<string> {
  return localImageUriToDataUrl(uri);
}

export function isPersistentAvatarUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://');
}

function isLocalFileAvatar(url: string): boolean {
  return url.startsWith('file://');
}

async function localFileAvatarExists(url: string): Promise<boolean> {
  try {
    const info = Paths.info(url);
    return info.exists === true;
  } catch {
    return false;
  }
}

export async function saveLocalAvatarUri(userId: number, uri: string): Promise<void> {
  await AsyncStorage.setItem(localAvatarKey(userId), uri);
}

async function getLocalAvatarUri(userId: number): Promise<string | null> {
  return AsyncStorage.getItem(localAvatarKey(userId));
}

/** Fusionne l’avatar API (data/http) avec une copie locale si l’API renvoie un file:// expiré. */
export async function resolveAvatarForUser<T extends { id: number; avatar_url?: string }>(
  user: T
): Promise<T> {
  const fromApi = user.avatar_url;

  if (isPersistentAvatarUrl(fromApi)) {
    return user;
  }

  if (fromApi && isLocalFileAvatar(fromApi) && (await localFileAvatarExists(fromApi))) {
    return user;
  }

  const cached = await getLocalAvatarUri(user.id);
  if (cached && (await localFileAvatarExists(cached))) {
    return { ...user, avatar_url: cached };
  }

  if (fromApi && isLocalFileAvatar(fromApi)) {
    return { ...user, avatar_url: undefined };
  }

  return user;
}
