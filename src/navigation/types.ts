import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Agenda: undefined;
  Boletim: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  StudentSelection: undefined;
};

export type RootStackNavigation = NativeStackNavigationProp<RootStackParamList>;
