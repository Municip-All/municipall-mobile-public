import apiClient from './apiClient';
import type { User } from '../context/authcontext';

export interface AuthLoginResponse {
  access_token: string;
  user: User;
}

export interface AuthSignupPayload {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone: string;
  cityId?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthLoginResponse> => {
    const response = await apiClient.post<AuthLoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  signup: async (payload: AuthSignupPayload): Promise<AuthLoginResponse> => {
    const response = await apiClient.post<AuthLoginResponse>('/auth/signup', payload);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>('auth/me');
    return response.data;
  },
};
