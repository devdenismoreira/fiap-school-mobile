module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Deve ser o último plugin (exigência do Reanimated 4 / react-native-worklets).
  plugins: ['react-native-worklets/plugin'],
};
