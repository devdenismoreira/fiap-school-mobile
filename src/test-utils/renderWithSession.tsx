import { ThemeProvider } from '@shopify/restyle';
import { render } from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';

import {
  SessionProvider,
  type SessionDependencies,
} from '@/app/providers/SessionProvider';
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
    ...overrides,
  };
}

export function renderWithSession(
  ui: ReactElement,
  dependencies: SessionDependencies = makeSessionDependencies(),
) {
  function Providers({ children }: PropsWithChildren) {
    return (
      <ThemeProvider theme={theme}>
        <SessionProvider dependencies={dependencies}>
          {children}
        </SessionProvider>
      </ThemeProvider>
    );
  }
  return render(ui, { wrapper: Providers });
}
