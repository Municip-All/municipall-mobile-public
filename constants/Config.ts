const DEV_API = 'https://dev.api.municipall.dev/api/v1/';
const PROD_API = 'https://api.municipall.dev/api/v1/';

/** Surcharge via .env : EXPO_PUBLIC_API_URL=https://api.municipall.dev/api/v1/ */
function apiBaseUrl(): string {
  const override = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (override) {
    return override.endsWith('/') ? override : `${override}/`;
  }
  return __DEV__ ? DEV_API : PROD_API;
}

export const Config = {
  API_BASE_URL: apiBaseUrl(),
  DEFAULT_TENANT_ID: process.env.EXPO_PUBLIC_DEFAULT_TENANT_ID || 'le-kremlin-bicetre',
};
