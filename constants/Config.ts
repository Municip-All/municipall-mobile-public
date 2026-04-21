export const Config = {
  // Bascule automatique entre Dev et Prod
  API_BASE_URL: __DEV__
    ? 'https://dev.api.municipall.dev/api/v1/'
    : 'https://api.municipall.dev/api/v1/',

  DEFAULT_TENANT_ID: 'city-1',
};
