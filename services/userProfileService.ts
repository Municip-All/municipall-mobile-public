import apiClient from './apiClient';
import { prepareImageForUpload, saveLocalAvatarUri } from '../utils/avatarImage';
import type { User } from '../context/authcontext';
import { isAxiosError } from 'axios';

export type UpdateProfilePayload = {
  name?: string;
  surname?: string;
  email?: string;
  neighborhood?: string;
};

export function getAvatarUploadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === 'AVATAR_TOO_LARGE') {
    return 'Image trop volumineuse. Recadrez la photo ou choisissez une image plus petite.';
  }
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 429) return 'Serveur temporairement saturé. Réessayez dans un instant.';
    if (status === 413) return 'Image trop volumineuse pour le serveur.';
    if (status === 401) return 'Session expirée. Reconnectez-vous.';
  }
  return "La photo n'a pas pu être enregistrée sur le serveur. Réessayez.";
}

export async function uploadUserAvatar(localUri: string, userId: number): Promise<string> {
  const dataUrl = await prepareImageForUpload(localUri);
  const response = await apiClient.post<User>('users/avatar', {
    avatarUrl: dataUrl,
  });
  const avatarUrl = response.data?.avatar_url ?? dataUrl;
  try {
    await saveLocalAvatarUri(userId, localUri);
  } catch {
    // Cache local optionnel — ne bloque pas un upload serveur réussi.
  }
  return avatarUrl;
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiClient.post<User>('users/profile', payload);
  return response.data;
}

export async function updateUserPassword(payload: {
  current: string;
  new: string;
  confirm: string;
}): Promise<void> {
  if (payload.new !== payload.confirm) {
    throw new Error('PASSWORD_MISMATCH');
  }
  await apiClient.post('users/password', payload);
}

export interface UserStats {
  reports: number;
  participations: number;
  points: number;
}

export async function getUserStats(): Promise<UserStats> {
  const response = await apiClient.get<UserStats>('users/stats');
  return response.data;
}

export async function updateUserCity(cityId: string): Promise<void> {
  await apiClient.post('users/profile', { cityId });
}
