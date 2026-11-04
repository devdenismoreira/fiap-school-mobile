import { useTheme } from '@shopify/restyle';
import { Pressable, StyleSheet } from 'react-native';

import { Box, motion, sizes, Text, type Theme } from '../../core/theme';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Como no Figma (frame "Login - carregando"): botão vazio, sem indicador. */
  loading?: boolean;
  /** Área segura inferior quando o botão fica colado na base da tela. */
  bottomInset?: number;
  testID?: string;
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  bottomInset = 0,
  testID,
}: PrimaryButtonProps) {
  const { colors } = useTheme<Theme>();
  const inactive = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        { backgroundColor: colors.primary, paddingBottom: bottomInset },
        pressed && styles.pressed,
      ]}
    >
      <Box
        height={sizes.primaryButtonHeight}
        alignItems="center"
        justifyContent="center"
      >
        {loading ? null : (
          <Text variant="button" color={disabled ? 'textDisabled' : 'onPrimary'}>
            {label}
          </Text>
        )}
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: motion.pressedOpacity,
  },
});
