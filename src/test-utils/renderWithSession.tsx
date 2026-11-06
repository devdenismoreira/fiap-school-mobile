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
import type { Guardian } from '@/domain/entities/Guardian';
import { makeGuardian } from './fixtures';

export function makeSessionDependencies(
  overrides: Partial<SessionDependencies> = {},
): SessionDependencies {
  let known: Guardian | null = null;
  const remember = <T extends Guardian | { guardian: Guardian } | null>(
    value: T,
  ): T => {
    if (value) {
      known = 'guardian' in value ? value.guardian : value;
    }
    return value;
  };
  const authenticate =
    overrides.authenticateGuardian ??
    jest.fn().mockResolvedValue(makeGuardian());
  const restore = overrides.restoreSession ?? jest.fn().mockResolvedValue(null);

  return {
    sessionRepository: {
      load: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    },
    endSession: jest.fn().mockResolvedValue(undefined),
    loadStudentRecords: jest.fn(async (rm: number) => {
      const student = known?.students.find(item => item.rm === rm);
      return {
        schedule: student?.schedule ?? [],
        reportCards: student?.reportCards ?? [],
      };
    }),
    ...overrides,
    authenticateGuardian: jest.fn(async (cpf: string, password: string) =>
      remember(await authenticate(cpf, password)),
    ),
    restoreSession: jest.fn(async () => remember(await restore())),
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
