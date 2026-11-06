import { useRef } from 'react';
import { Pressable, StyleSheet, View, type HostInstance } from 'react-native';

import { Box, Card, motion, Text } from '@/core/theme';
import { Collapsible } from '@/shared/components/Collapsible';
import { ExpandArrow } from '@/shared/components/ExpandArrow';
import { useScrollFocus } from '@/shared/components/TabScreenLayout';
import type { ReportTerm } from '../../useReportViewModel';
import { SubjectRow } from '../SubjectRow';

type TermAccordionProps = {
  term: ReportTerm;
  onToggle: () => void;
  onToggleSubject: (key: string) => void;
};

export function TermAccordion({
  term,
  onToggle,
  onToggleSubject,
}: TermAccordionProps) {
  const rootRef = useRef<HostInstance>(null);
  const contentHeight = useRef(0);
  const isRevealPending = useRef(false);
  const scrollFocus = useScrollFocus();

  const handleToggle = () => {
    if (term.isExpanded) {
      scrollFocus.followCollapsing(contentHeight.current);
    } else {
      isRevealPending.current = true;
    }
    onToggle();
  };

  const handleContentHeight = (height: number) => {
    contentHeight.current = height;
    if (isRevealPending.current) {
      isRevealPending.current = false;
      scrollFocus.revealExpanding(rootRef.current, height);
    }
  };

  return (
    <View ref={rootRef} collapsable={false}>
      <Pressable
        onPress={handleToggle}
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

      <Collapsible
        expanded={term.isExpanded}
        onContentHeight={handleContentHeight}
      >
        <Box marginTop="m" marginBottom="m" paddingHorizontal="sm" gap="ml">
          {term.subjects.map(subject => (
            <SubjectRow
              key={subject.key}
              subject={subject}
              onToggle={() => onToggleSubject(subject.key)}
            />
          ))}
        </Box>
      </Collapsible>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
