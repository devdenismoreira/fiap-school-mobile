import { ScrollView, StyleSheet } from 'react-native';

import { useSession } from '@/app/providers/SessionProvider';
import { Box, Text, theme } from '@/core/theme';
import { EmptyState } from '@/shared/components/EmptyState';

export const NO_STUDENTS_TITLE = 'Nenhum aluno vinculado';
export const NO_STUDENTS_DESCRIPTION =
  'Fale com a secretaria da FIAP School para vincular seus alunos.';

export function NoStudentsScreen() {
  const { state } = useSession();
  const firstName = state.status === 'signedIn' ? state.guardian.firstName : '';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Box paddingHorizontal="xl">
        <Text
          variant="greeting"
          textAlign="center"
          marginTop="m"
          accessibilityRole="header"
        >
          Olá,{' '}
          <Text variant="greetingBold">
            {firstName.toLocaleUpperCase('pt-BR')}
          </Text>
        </Text>
        <Box marginTop="xl">
          <EmptyState
            title={NO_STUDENTS_TITLE}
            description={NO_STUDENTS_DESCRIPTION}
          />
        </Box>
      </Box>
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
