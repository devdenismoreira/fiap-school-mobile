import { StyleSheet } from 'react-native';

import { useSession } from '@/app/providers/SessionProvider';
import { Box, sizes, Text } from '@/core/theme';

const upper = (text: string) => text.toLocaleUpperCase('pt-BR');

export function StudentGreeting() {
  const { state, selectedStudent } = useSession();

  if (state.status !== 'signedIn') {
    return null;
  }

  return (
    <Box>
      <Text variant="greeting" textAlign="center" marginTop="m">
        Olá,{' '}
        <Text variant="greetingBold">{upper(state.guardian.firstName)}</Text>
      </Text>

      {selectedStudent ? (
        <Box alignItems="center" style={styles.student}>
          <Text variant="bodyMedium" textAlign="center">
            {upper(selectedStudent.firstName)}
          </Text>
          <Text variant="body" textAlign="center" marginTop="xs">
            {`${selectedStudent.className} - RM ${selectedStudent.rm} - ${selectedStudent.shift}`}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  student: {
    marginTop: sizes.appHeader.greetingToStudent,
  },
});
