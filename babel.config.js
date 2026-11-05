module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Injeta só a API_URL no bundle (ex.: API_URL=https://… yarn start --reset-cache).
    ['transform-inline-environment-variables', { include: ['API_URL'] }],
    // Deve ser o último plugin (exigência do Reanimated 4 / react-native-worklets).
    'react-native-worklets/plugin',
  ],
};
