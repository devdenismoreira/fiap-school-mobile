import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { Text, theme } from '@/core/theme';
import { screenSectionEntering } from '@/shared/animations';
import { StudentGreeting } from '@/shared/components/StudentGreeting';

type TabScreenLayoutProps = PropsWithChildren<{
  title: string;
}>;

export function TabScreenLayout({ title, children }: TabScreenLayoutProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={screenSectionEntering(0)}>
        <StudentGreeting />
      </Animated.View>
      <Animated.View entering={screenSectionEntering(1)}>
        <Text
          variant="sectionTitle"
          textAlign="center"
          marginTop="huge"
          accessibilityRole="header"
        >
          {title}
        </Text>
      </Animated.View>
      <Animated.View entering={screenSectionEntering(2)}>
        {children}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
});
