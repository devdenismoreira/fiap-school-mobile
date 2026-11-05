import { ThemeProvider } from '@shopify/restyle';
import { render } from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  SessionProvider,
  type SessionDependencies,
} from '@/app/providers/SessionProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';
import { theme } from '@/core/theme';
import { makeGuardian } from './fixtures';

export function makeSessionDependencies(
  overrides: Partial<SessionDependencies> = {},
): SessionDependencies {
  return {
    authenticateGuardian: jest.fn().mockResolvedValue(makeGuardian()),
    restoreSession: jest.fn().mockResolvedValue(null),
    sessionRepository: {
      load: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    },
    endSession: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function renderWithSession(
  ui: ReactElement,
  dependencies: SessionDependencies = makeSessionDependencies(),
) {
  function Providers({ children }: PropsWithChildren) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <ThemeProvider theme={theme}>
          <ToastProvider>
            <SessionProvider dependencies={dependencies}>
              {children}
            </SessionProvider>
          </ToastProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }
  return render(ui, { wrapper: Providers });
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
