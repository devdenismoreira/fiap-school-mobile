import { StatusBar } from 'react-native';

import { Box } from '../core/theme';
import { AppProviders } from './providers/AppProviders';

// Placeholder: a navegação e as telas entram nas tarefas T04–T05.
export default function App() {
  return (
    <AppProviders>
      <StatusBar barStyle="light-content" />
      <Box testID="app-root" flex={1} backgroundColor="background" />
    </AppProviders>
  );
}
