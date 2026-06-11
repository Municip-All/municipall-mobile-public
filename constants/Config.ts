export const Config = {
  // Bascule automatique entre Dev local et Prod
  // Pour le développement local avec l'IA connectée :
  API_BASE_URL: __DEV__
    ? 'http://192.168.1.67:3000/api/v1/'  // ← Backend local (IP LAN actuelle)
    : 'https://api.municipall.dev/api/v1/',

  DEFAULT_TENANT_ID: 'city-1',
};
