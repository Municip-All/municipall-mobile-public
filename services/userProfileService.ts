import apiClient from './apiClient';
import { localImageUriToDataUrl, saveLocalAvatarUri } from '../utils/avatarImage';
import type { User } from '../context/authcontext';

export type UpdateProfilePayload = {
  name?: string;
  surname?: string;
  email?: string;
  neighborhood?: string;
};

export async function uploadUserAvatar(localUri: string, userId: number): Promise<string> {
  const dataUrl = await localImageUriToDataUrl(localUri);
  const response = await apiClient.post<{ avatar_url?: string }>('users/avatar', {
    avatarUrl: dataUrl,
  });
  await saveLocalAvatarUri(userId, localUri);
  return response.data?.avatar_url ?? dataUrl;
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
