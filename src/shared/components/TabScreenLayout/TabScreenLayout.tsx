import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, Text, theme } from '@/core/theme';
import { AppHeader } from '@/shared/components/AppHeader';

type TabScreenLayoutProps = PropsWithChildren<{
  title: string;
}>;

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
