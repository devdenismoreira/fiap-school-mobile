import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { theme } from '@/core/theme';
import { AgendaScreen } from '@/modules/classes/screens/AgendaScreen';
import { ReportScreen } from '@/modules/report/screens/ReportScreen';
import { TabBar } from './TabBar';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const renderTabBar = (props: Parameters<typeof TabBar>[0]) => (
  <TabBar {...props} />
);

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Boletim" component={ReportScreen} />
    </Tab.Navigator>
  );
}
