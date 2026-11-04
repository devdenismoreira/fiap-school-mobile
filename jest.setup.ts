import { setUpTests } from 'react-native-reanimated';

// O Gesture Handler 3 usa o runtime de UI do worklets ao carregar; no Jest ele não existe.
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock'),
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

setUpTests();
