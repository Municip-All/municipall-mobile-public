// Charge .env avant toute lecture de process.env (IOS_PERSONAL_TEAM, etc.)
require('dotenv').config();

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

/** Compte Apple gratuit : pas de capacité Push côté provisioning iOS */
const iosPersonalTeam = process.env.IOS_PERSONAL_TEAM === '1';

function isExpoNotificationsPlugin(entry) {
  if (entry === 'expo-notifications') return true;
  return Array.isArray(entry) && entry[0] === 'expo-notifications';
}

const plugins = [...(appJson.expo.plugins || [])].filter(
  (entry) => !(iosPersonalTeam && isExpoNotificationsPlugin(entry))
);

if (!plugins.includes('expo-dev-client')) {
  plugins.push('expo-dev-client');
}
if (!plugins.some((p) => Array.isArray(p) && p[0] === 'expo-build-properties')) {
  plugins.push([
    'expo-build-properties',
    {
      ios: {
        deploymentTarget: '15.1',
      },
    },
  ]);
}
// Toujours en dernier : nettoie entitlements + Xcode si un prebuild les a remis
if (iosPersonalTeam) {
  plugins.push('./plugins/ios-personal-team');
}

const iosBundleIdentifier =
  iosPersonalTeam && process.env.IOS_BUNDLE_IDENTIFIER
    ? process.env.IOS_BUNDLE_IDENTIFIER
    : (appJson.expo.ios?.bundleIdentifier ?? 'municipall.v2');

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  newArchEnabled: true,
  ...(iosPersonalTeam
    ? {
        autolinking: {
          exclude: ['expo-notifications'],
        },
      }
    : {}),
  plugins,
  ios: {
    ...appJson.expo.ios,
    bundleIdentifier: iosBundleIdentifier,
    // Ne pas définir aps-environment ici en Personal Team
    entitlements: iosPersonalTeam
      ? {}
      : {
          'aps-environment': 'development',
        },
    infoPlist: {
      NSLocationWhenInUseUsageDescription: LOCATION_USAGE,
      NSLocationAlwaysAndWhenInUseUsageDescription: LOCATION_USAGE,
    },
  },
  extra: {
    ...appJson.expo.extra,
    eas: {
      projectId: easProjectId,
    },
    iosPersonalTeam,
  },
};
