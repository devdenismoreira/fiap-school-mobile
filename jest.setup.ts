import { setUpTests } from 'react-native-reanimated';

// O Gesture Handler 3 usa o runtime de UI do worklets ao carregar; no Jest ele não existe.
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock'),
);

// Sem views nativas no Jest, o ref animado não tem tag e o useScrollOffset
// avisaria a cada render. A posição da rolagem não é observável nos testes.
jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return {
    __esModule: true,
    ...actual,
    useScrollOffset: () => actual.useSharedValue(0),
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// O LocalSvg busca o arquivo do asset de forma assíncrona (fetch), o que não
// existe no Jest. O mock expõe as props para os testes conferirem.
jest.mock('react-native-svg/css', () => {
  const { createElement } = require('react');
  const { View } = require('react-native');
  return {
    LocalSvg: (props: object) =>
      createElement(View, { testID: 'local-svg', ...props }),
  };
});

setUpTests();
