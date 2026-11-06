module.exports = {
  preset: '@react-native/jest-preset',
  resolver: 'react-native-reanimated/jest/resolver',
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  // Alias `@/` → `src/` (o mesmo de tsconfig.json e metro.config.js).
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native(-.*)?|@react-native(-community)?|@react-navigation|@react-native-async-storage|@shopify/restyle)/)',
  ],
};
