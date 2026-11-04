import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, sizes, Text } from '@/core/theme';
import { Icon, type IconName } from '@/shared/components/Icon';
import type { MainTabParamList } from '@/navigation/types';

const TABS: Record<
  keyof MainTabParamList,
  { label: string; activeIcon: IconName; inactiveIcon: IconName }
> = {
  Agenda: {
    label: 'AGENDA',
    activeIcon: 'calendarActive',
    inactiveIcon: 'calendarInactive',
  },
  Boletim: {
    label: 'BOLETIM',
    activeIcon: 'reportActive',
    inactiveIcon: 'reportInactive',
  },
};

/**
 * Barra de abas do Figma ("Rodapé"): fundo `surface`, duas metades iguais,
 * aba ativa em `primary`. A área segura inferior recebe a mesma cor.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box
      flexDirection="row"
      backgroundColor="surface"
      accessibilityRole="tablist"
      style={{ paddingBottom: insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TABS[route.name as keyof MainTabParamList];

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name as keyof MainTabParamList);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            style={styles.tab}
          >
            <Box
              height={sizes.tabBar.height}
              alignItems="center"
              style={styles.content}
            >
              <Icon name={focused ? tab.activeIcon : tab.inactiveIcon} />
              <Text
                variant="tabLabel"
                color={focused ? 'primary' : 'textPrimary'}
                style={styles.label}
              >
                {tab.label}
              </Text>
            </Box>
          </Pressable>
        );
      })}
    </Box>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
  },
  content: {
    paddingTop: sizes.tabBar.iconTop,
  },
  label: {
    marginTop: sizes.tabBar.iconToLabel,
  },
});
