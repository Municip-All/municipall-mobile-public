// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const nativewindConfig = withNativewind(config);
const nativewindResolveRequest = nativewindConfig.resolver.resolveRequest;

/**
 * Nativewind's globalClassNamePolyfill redirects `react-native` to
 * `react-native-css/components`, which replaces Image with a wrapper that has
 * no `resolveAssetSource`. react-native-maps (and other libs) then crash when
 * resolving marker bitmaps. Third-party packages must keep the real RN module.
 */
function isThirdPartyReactNativeConsumer(originModulePath) {
  const normalized = originModulePath.split(path.sep).join('/');
  return (
    normalized.includes('/node_modules/') &&
    !normalized.includes('/node_modules/react-native-css/')
  );
}

nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native' && isThirdPartyReactNativeConsumer(context.originModulePath)) {
    return context.resolveRequest(context, moduleName, platform);
  }

  return nativewindResolveRequest(context, moduleName, platform);
};

module.exports = nativewindConfig;
