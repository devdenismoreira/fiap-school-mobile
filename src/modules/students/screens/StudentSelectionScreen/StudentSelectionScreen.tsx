import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type HostInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, motion, sizes, Text, theme } from '@/core/theme';
import { Icon } from '@/shared/components/Icon';
import type { RootStackNavigation } from '@/navigation/types';
import { StudentCard } from './components/StudentCard';
import { useStudentSelectionViewModel } from './useStudentSelectionViewModel';

const { closeTop, closeIcon, titleTop } = sizes.studentSelection;
const TITLE = 'Escolha o perfil\nque você quer visualizar';

/** Tela "Mudança de aluno" (Figma 2:5), aberta acima das abas. */
export function StudentSelectionScreen() {
  const { students, selectedRm, select, close } =
    useStudentSelectionViewModel();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootStackNavigation>();
  const titleRef = useRef<HostInstance>(null);

  // Leitor de tela começa pelo título, não pelo "FECHAR" (spec 03 §9).
  useEffect(
    () =>
      navigation.addListener('transitionEnd', () => {
        if (titleRef.current) {
          AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');
        }
      }),
    [navigation],
  );

  return (
    <Box
      flex={1}
      backgroundColor="background"
      style={{ paddingTop: insets.top }}
    >
      <Box
        flexDirection="row"
        justifyContent="flex-end"
        paddingHorizontal="m"
        style={styles.closeRow}
      >
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="FECHAR"
          hitSlop={10}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Box flexDirection="row" alignItems="center">
            <Text variant="bodyBold" color="primary">
              FECHAR
            </Text>
            <Icon name="close" style={styles.closeIcon} />
          </Box>
        </Pressable>
      </Box>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + theme.spacing.m },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          ref={titleRef}
          accessible
          accessibilityRole="header"
          accessibilityLabel={TITLE}
          style={styles.title}
        >
          <Text variant="headline" textAlign="center">
            {TITLE}
          </Text>
        </View>

        <Box
          marginTop="huge"
          paddingHorizontal="m"
          gap="m"
          accessibilityRole="radiogroup"
        >
          {students.map(student => (
            <StudentCard
              key={student.rm}
              student={student}
              selected={student.rm === selectedRm}
              onPress={() => select(student.rm)}
            />
          ))}
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = StyleSheet.create({
  closeRow: {
    paddingTop: closeTop,
  },
  closeIcon: {
    marginLeft: theme.spacing.xs,
  },
  content: {
    flexGrow: 1,
  },
  title: {
    marginTop: titleTop - closeTop - closeIcon,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
