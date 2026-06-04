import axios from 'axios';
import { Config } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Request interceptor to inject Auth token if available
apiClient.interceptors.request.use(
  async (config) => {
    config.headers['x-tenant-id'] = activeTenantId;
    try {
      const token = await AsyncStorage.getItem('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error fetching token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
