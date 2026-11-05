import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { Box, motion, sizes, Text } from '@/core/theme';
import {
  fadeInNormal,
  fadeOutFast,
  layoutTransition,
} from '@/shared/animations';
import { ExpandArrow } from '@/shared/components/ExpandArrow';
import type { ReportSubject } from '../../useReportViewModel';

type SubjectRowProps = {
  subject: ReportSubject;
  onToggle: () => void;
};

const ROW_HIT_SLOP = { top: 10, bottom: 10 };

export function SubjectRow({ subject, onToggle }: SubjectRowProps) {
  const detailsLabel = subject.isEvaluated
    ? `Nota ${subject.grade}, faltas ${subject.absences}`
    : 'Nota não lançada, faltas não lançadas';

  return (
    <Animated.View layout={layoutTransition}>
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
          <ExpandArrow expanded={subject.isExpanded} />
        </Box>
      </Pressable>

      {subject.isExpanded ? (
        <Animated.View entering={fadeInNormal} exiting={fadeOutFast}>
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
