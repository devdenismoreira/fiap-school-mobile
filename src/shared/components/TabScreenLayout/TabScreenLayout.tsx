import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, Text, theme } from '@/core/theme';
import { AppHeader } from '@/shared/components/AppHeader';

type TabScreenLayoutProps = PropsWithChildren<{
  /** Título da seção ("AGENDA", "BOLETIM"). */
  title: string;
}>;

/**
 * Estrutura comum das abas: o cabeçalho rola junto com o conteúdo (D-10) e a
 * faixa da barra de status fica fixa e preta, sem conteúdo passando por baixo.
 */
export function TabScreenLayout({ title, children }: TabScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box
      flex={1}
      backgroundColor="background"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />
        <Text
          variant="sectionTitle"
          textAlign="center"
          marginTop="huge"
          accessibilityRole="header"
        >
          {title}
        </Text>
        {children}
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
});
