import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { Easing } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, motion, theme } from '@/core/theme';
import { AgendaScreen } from '@/modules/classes/screens/AgendaScreen';
import { ReportScreen } from '@/modules/report/screens/ReportScreen';
import { AppActionBar } from '@/shared/components/AppActionBar';
import { TabBar } from './TabBar';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_SHIFT = 16;

const renderTabBar = (props: Parameters<typeof TabBar>[0]) => (
  <TabBar {...props} />
);

const softShift: Pick<
  BottomTabNavigationOptions,
  'animation' | 'transitionSpec' | 'sceneStyleInterpolator'
> = {
  animation: 'shift',
  transitionSpec: {
    animation: 'timing',
    config: {
      duration: motion.transition,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    },
  },
  sceneStyleInterpolator: ({ current }) => ({
    sceneStyle: {
      opacity: current.progress.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 1, 0],
      }),
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-TAB_SHIFT, 0, TAB_SHIFT],
          }),
        },
      ],
    },
  }),
};

export function MainTabs() {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();

  return (
    <Box
      flex={1}
      backgroundColor="background"
      style={{ paddingTop: insets.top }}
    >
      <AppActionBar />
      <Tab.Navigator
        tabBar={renderTabBar}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.colors.background },
          ...(reduceMotion ? { animation: 'none' } : softShift),
        }}
      >
        <Tab.Screen name="Agenda" component={AgendaScreen} />
        <Tab.Screen name="Boletim" component={ReportScreen} />
      </Tab.Navigator>
    </Box>
  );
}
