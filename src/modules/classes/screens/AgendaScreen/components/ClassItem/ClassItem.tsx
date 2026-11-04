import { StyleSheet } from 'react-native';

import { Box, sizes, Text } from '@/core/theme';
import type { ClassSession } from '@/domain/entities/Schedule';

type ClassItemProps = {
  session: ClassSession;
};

/**
 * Item da lista de aulas do Figma: marcador vazado de 6 pt (borda `timelineDot`)
 * alinhado ao horário; disciplina 8 pt abaixo, a 10 pt do marcador.
 */
export function ClassItem({ session }: ClassItemProps) {
  return (
    <Box
      flexDirection="row"
      accessible
      accessibilityLabel={`${session.time.replace(' - ', ' às ')}, ${session.subject}`}
    >
      <Box
        width={sizes.timelineDot}
        height={sizes.timelineDot}
        borderRadius="round"
        borderWidth={sizes.borderHairline}
        borderColor="timelineDot"
        style={styles.dot}
      />
      <Box marginLeft="s" flexShrink={1}>
        <Text variant="caption">{session.time}</Text>
        <Text variant="bodySemiBold" marginTop="xs">
          {session.subject}
        </Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  dot: {
    marginTop: sizes.classItem.dotOffset,
  },
});
