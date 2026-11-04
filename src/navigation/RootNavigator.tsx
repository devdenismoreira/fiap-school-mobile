import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useReducedMotion } from 'react-native-reanimated';

import { useSession } from '@/app/providers/SessionProvider';
import { Box, theme } from '@/core/theme';
import { LoginScreen } from '@/modules/auth/screens/LoginScreen';
import { StudentSelectionScreen } from '@/modules/students/screens/StudentSelectionScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Decide entre fluxo autenticado e não autenticado pelo estado da sessão
 * (padrão de auth flow do React Navigation: telas condicionais, sem navigate).
 */
export function RootNavigator() {
  const { state } = useSession();
  // "Reduzir movimento" do sistema: transições viram troca instantânea.
  const reduceMotion = useReducedMotion();

  if (state.status === 'restoring') {
    // Sem splash no Figma (D-14): fundo preto enquanto restaura.
    return (
      <Box testID="session-restoring" flex={1} backgroundColor="background" />
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'fade',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {state.status === 'signedIn' ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="StudentSelection"
            component={StudentSelectionScreen}
            options={{
              presentation: 'fullScreenModal',
              animation: reduceMotion ? 'none' : 'slide_from_bottom',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
