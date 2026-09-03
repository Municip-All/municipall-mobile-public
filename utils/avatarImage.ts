import * as FileSystem from 'expo-file-system/legacy';
import { File } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const localAvatarKey = (userId: number) => `user_avatar_local_${userId}`;

/** Limite pratique (~900 KB binaire) pour éviter 413 / timeouts API. */
const MAX_AVATAR_DATA_URL_LENGTH = 1_200_000;

function inferMimeFromUri(uri: string): string {
  const lower = uri.toLowerCase().split('?')[0];
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function assertAvatarSize(dataUrl: string): void {
  if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
    throw new Error('AVATAR_TOO_LARGE');
  }
}

/** Convertit une image locale en data URL pour persistance côté API. */
export async function localImageUriToDataUrl(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const dataUrl = `data:${inferMimeFromUri(uri)};base64,${base64}`;
    assertAvatarSize(dataUrl);
    return dataUrl;
  } catch (error) {
    if (error instanceof Error && error.message === 'AVATAR_TOO_LARGE') {
      throw error;
    }
  }

  const file = new File(uri);
  const buffer = await file.arrayBuffer();
  const ext = file.extension?.toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const dataUrl = `data:${mime};base64,${uint8ToBase64(new Uint8Array(buffer))}`;
  assertAvatarSize(dataUrl);
  return dataUrl;
}

/**
 * Prépare une image pour l'API.
 * La compression se fait à la sélection (quality dans ImagePicker).
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
    const info = await FileSystem.getInfoAsync(url);
    return info.exists;
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
