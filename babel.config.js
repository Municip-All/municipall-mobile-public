module.exports = function (api) {
  api.cache(true);
  let plugins = [];

  plugins.push('react-native-worklets/plugin');
  // Enable @-based path aliases (runtime via Babel)
  plugins.push([
    'module-resolver',
    {
      root: ['./'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        '@': './',
        '@app': './app',
        '@components': './components',
        '@context': './context',
        '@assets': './assets',
        '@constants': './constants',
      },
    },
  ]);

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
