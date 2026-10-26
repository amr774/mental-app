module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json', '.svg'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@context': './src/context',
            '@api': './src/api',
            '@theme': './src/theme',
            '@utils': './src/utils',
            '@assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
