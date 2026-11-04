import { DarkTheme, type Theme as NavigationTheme } from '@react-navigation/native';

import { theme } from '@/core/theme';

/** Fundo preto em todas as telas e transições, sem flash branco. */
export const navigationTheme: NavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.background,
    text: theme.colors.textPrimary,
    border: theme.colors.background,
  },
};
