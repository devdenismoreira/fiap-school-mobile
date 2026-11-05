import { Pressable, StyleSheet } from 'react-native';

import { Card, motion, sizes, Text, theme } from '@/core/theme';
import type { Student } from '@/domain/entities/Student';

type StudentCardProps = {
  student: Student;
  selected: boolean;
  onPress: () => void;
};

export function StudentCard({ student, selected, onPress }: StudentCardProps) {
  const fullName = `${student.firstName} ${student.lastName}`;
  const info = `${student.className} - RM ${student.rm} - ${student.shift}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${fullName}, ${student.className}, RM ${student.rm}, ${student.shift}`}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card
        testID={`student-card-${student.rm}`}
        variant="raised"
        justifyContent="space-between"
        borderWidth={sizes.borderHairline}
        borderColor={selected ? 'primary' : 'transparent'}
        style={styles.content}
      >
        <Text variant="bodyMedium">{fullName.toLocaleUpperCase('pt-BR')}</Text>
        <Text variant="body">{info}</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.m - sizes.borderHairline,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
