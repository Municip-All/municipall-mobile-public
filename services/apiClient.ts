import axios from 'axios';
import { Config } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { emitSessionExpired } from './sessionEvents';

let activeTenantId = Config.DEFAULT_TENANT_ID;

export function setApiTenantId(tenantId: string) {
  activeTenantId = tenantId;
}

const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    config.headers['x-tenant-id'] = activeTenantId;
    try {
      const token = await AsyncStorage.getItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e: unknown) {
      console.error('Error fetching token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem('user_token');
      await AsyncStorage.removeItem('user_data');
      emitSessionExpired();
      try {
        router.replace('/login');
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default apiClient;
