import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { Box, Card, motion, Text } from '@/core/theme';
import {
  fadeInNormal,
  fadeOutFast,
  layoutTransition,
} from '@/shared/animations';
import { ExpandArrow } from '@/shared/components/ExpandArrow';
import type { ReportTerm } from '../../useReportViewModel';
import { SubjectRow } from '../SubjectRow';

type TermAccordionProps = {
  term: ReportTerm;
  onToggle: () => void;
  onToggleSubject: (key: string) => void;
};

/**
 * Trimestre do Boletim no Figma: card de 90 pt com título em `primary` e seta.
 * Aberto, lista as disciplinas 16 pt abaixo, 20 pt entre si, e deixa 32 pt
 * até o próximo card (16 aqui + 16 do espaçamento entre trimestres).
 */
export function TermAccordion({
  term,
  onToggle,
  onToggleSubject,
}: TermAccordionProps) {
  return (
    <Animated.View layout={layoutTransition}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={term.label.toLocaleLowerCase('pt-BR')}
        accessibilityState={{ expanded: term.isExpanded }}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Card
          testID={`term-card-${term.number}`}
          variant="raised"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="sm"
        >
          <Text variant="bodyBold" color="primary">
            {term.label}
          </Text>
          <ExpandArrow expanded={term.isExpanded} />
        </Card>
      </Pressable>

      {term.isExpanded ? (
        <Animated.View entering={fadeInNormal} exiting={fadeOutFast}>
          <Box marginTop="m" marginBottom="m" paddingHorizontal="sm" gap="ml">
            {term.subjects.map(subject => (
              <SubjectRow
                key={subject.key}
                subject={subject}
                onToggle={() => onToggleSubject(subject.key)}
              />
            ))}
          </Box>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
