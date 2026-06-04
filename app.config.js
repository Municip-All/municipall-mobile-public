// Configuration Expo (dynamic). projectId EAS requis pour les push — voir eas.json.
const appJson = require('./app.json');

/** UUID du projet EAS (expo.dev) — complété par `npx eas init` */
const EAS_PROJECT_ID = 'd2002388-14ed-4412-ba35-b6a8fc03fa94';

const LOCATION_USAGE =
  'Autorisez la localisation pour afficher la carte et positionner vos signalements.';

function getEasProjectId() {
  if (process.env.EXPO_PUBLIC_EAS_PROJECT_ID) {
    return process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  }
  try {
    const eas = require('./eas.json');
    if (eas.projectId) return eas.projectId;
  } catch {
    // eas.json optionnel
  }
  return EAS_PROJECT_ID;
}

const easProjectId = getEasProjectId();

const plugins = [...(appJson.expo.plugins || [])];
if (!plugins.includes('expo-dev-client')) {
  plugins.push('expo-dev-client');
}
if (!plugins.some((p) => Array.isArray(p) && p[0] === 'expo-build-properties')) {
  plugins.push([
    'expo-build-properties',
    {
      ios: {
        newArchEnabled: false,
      },
      android: {
        newArchEnabled: false,
      },
    },
  ]);
}

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  plugins,
  ios: {
    ...appJson.expo.ios,
    infoPlist: {
      NSLocationWhenInUseUsageDescription: LOCATION_USAGE,
      NSLocationAlwaysAndWhenInUseUsageDescription: LOCATION_USAGE,
    },
  },
  android: {
    ...appJson.expo.android,
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      ...(appJson.expo.android?.permissions ?? []),
    ],
  },
  extra: {
    ...appJson.expo.extra,
    eas: {
      projectId: easProjectId,
    },
  },
};
