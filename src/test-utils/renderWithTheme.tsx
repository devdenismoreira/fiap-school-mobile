import { ThemeProvider } from '@shopify/restyle';
import { render } from '@testing-library/react-native';
import type { PropsWithChildren, ReactElement } from 'react';

import { theme } from '@/core/theme';

function ThemeWrapper({ children }: PropsWithChildren) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

export function renderWithTheme(ui: ReactElement) {
  return render(ui, { wrapper: ThemeWrapper });
}
