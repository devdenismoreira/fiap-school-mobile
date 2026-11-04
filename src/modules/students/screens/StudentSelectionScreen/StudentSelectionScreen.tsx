import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, motion, sizes, Text, theme } from '../../../../core/theme';
import { Icon } from '../../../../shared/components/Icon';

const { closeTop, closeIcon, titleTop } = sizes.studentSelection;

/** Tela "Mudança de aluno" (Figma 2:5). Os cards dos alunos entram na T06. */
export function StudentSelectionScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <Box flex={1} backgroundColor="background" style={{ paddingTop: insets.top }}>
      <Box
        flexDirection="row"
        justifyContent="flex-end"
        paddingHorizontal="m"
        style={styles.closeRow}
      >
        <Pressable
          onPress={() => navigation.goBack()}
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

      <Text
        variant="headline"
        textAlign="center"
        accessibilityRole="header"
        style={styles.title}
      >
        {'Escolha o perfil\nque você quer visualizar'}
      </Text>
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
  title: {
    marginTop: titleTop - closeTop - closeIcon,
  },
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
