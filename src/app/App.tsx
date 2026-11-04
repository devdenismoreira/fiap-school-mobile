import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';

import { navigationTheme } from '@/navigation/navigationTheme';
import { RootNavigator } from '@/navigation/RootNavigator';
import { createDependencies } from './bootstrap/dependencies';
import { AppProviders } from './providers/AppProviders';
import {
  SessionProvider,
  type SessionDependencies,
} from './providers/SessionProvider';

const defaultDependencies = createDependencies();

type AppProps = {
  /** Permite injetar dependências nos testes. */
  dependencies?: SessionDependencies;
};

export default function App({ dependencies = defaultDependencies }: AppProps) {
  return (
    <AppProviders>
      <StatusBar barStyle="light-content" />
      <SessionProvider dependencies={dependencies}>
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </SessionProvider>
    </AppProviders>
  );
}
