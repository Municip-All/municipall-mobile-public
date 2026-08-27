export const Config = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL ||
    (__DEV__ ? 'http://localhost:3002/api/v1/' : 'https://api.municipall.dev/api/v1/'),
  IA_BASE_URL: process.env.EXPO_PUBLIC_IA_URL || 'http://localhost:8000',
  DEFAULT_TENANT_ID: 'city-1',
  WEBSITE_URL: 'https://municipall.dev',
};
