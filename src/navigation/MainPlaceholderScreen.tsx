import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '../app/providers/SessionProvider';
import { Box, Text } from '../core/theme';

/**
 * TEMPORÁRIA (T04): só para validar login, restauração e logout.
 * Substituída pelas abas com o cabeçalho do Figma na T05.
 */
export function MainPlaceholderScreen() {
  const { state, selectedStudent, signOut } = useSession();
  const guardianName =
    state.status === 'signedIn' ? state.guardian.firstName : '';

  return (
    <Box flex={1} backgroundColor="background">
      <SafeAreaView>
        <Box padding="m" alignItems="center">
          <Text variant="greeting">
            Olá,{' '}
            <Text variant="greetingBold">
              {guardianName.toLocaleUpperCase('pt-BR')}
            </Text>
          </Text>
          {selectedStudent ? (
            <Text variant="body" marginTop="m">
              {`${selectedStudent.className} - RM ${selectedStudent.rm} - ${selectedStudent.shift}`}
            </Text>
          ) : null}
          <Pressable
            onPress={signOut}
            accessibilityRole="button"
            hitSlop={16}
          >
            <Text variant="caption" marginTop="xl">
              SAIR
            </Text>
          </Pressable>
        </Box>
      </SafeAreaView>
    </Box>
  );
}
