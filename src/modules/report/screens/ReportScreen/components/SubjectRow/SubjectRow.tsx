import { Pressable, StyleSheet } from 'react-native';

import { Box, motion, sizes, Text } from '@/core/theme';
import { Icon } from '@/shared/components/Icon';
import type { ReportSubject } from '../../useReportViewModel';

type SubjectRowProps = {
  subject: ReportSubject;
  onToggle: () => void;
};

/** Amplia a área de toque da linha de 17 pt (há 20 pt entre linhas). */
const ROW_HIT_SLOP = { top: 10, bottom: 10 };

/**
 * Disciplina do Boletim no Figma: nome em caixa alta e seta; aberta, mostra
 * "Nota:" 10 pt abaixo e "Faltas:" 4 pt abaixo, valores 12 pt à direita.
 */
export function SubjectRow({ subject, onToggle }: SubjectRowProps) {
  const detailsLabel = subject.isEvaluated
    ? `Nota ${subject.grade}, faltas ${subject.absences}`
    : 'Nota não lançada, faltas não lançadas';

  return (
    <Box>
      <Pressable
        testID={`subject-row-${subject.key}`}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={subject.name}
        accessibilityState={{ expanded: subject.isExpanded }}
        hitSlop={ROW_HIT_SLOP}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Box
          height={sizes.subjectRow.height}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text variant="captionMedium" flexShrink={1}>
            {subject.name.toLocaleUpperCase('pt-BR')}
          </Text>
          <Icon
            name="arrowDown"
            style={subject.isExpanded ? styles.arrowUp : undefined}
          />
        </Box>
      </Pressable>

      {subject.isExpanded ? (
        <Box marginTop="s" accessible accessibilityLabel={detailsLabel}>
          <Box flexDirection="row">
            <Text variant="captionMedium">Nota:</Text>
            <Text variant="captionMedium" marginLeft="sm">
              {subject.grade}
            </Text>
          </Box>
          <Box flexDirection="row" marginTop="xxs">
            <Text variant="captionMedium">Faltas:</Text>
            <Text variant="captionMedium" marginLeft="sm">
              {subject.absences}
            </Text>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

const styles = StyleSheet.create({
  arrowUp: {
    transform: [{ scaleY: -1 }],
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
