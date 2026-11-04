import { useTheme } from '@shopify/restyle';
import type { Ref } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputInstance,
  type TextInputProps,
} from 'react-native';

import {
  Box,
  MAX_FONT_SIZE_MULTIPLIER,
  sizes,
  Text,
  type Theme,
} from '../../../../../../core/theme';

type UnderlineInputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  value: string;
  inputRef?: Ref<TextInputInstance>;
};

/**
 * Campo do Login no Figma: rótulo centralizado, valor centralizado em 32 pt e
 * sublinhado de 1 pt (cinza vazio, branco preenchido).
 */
export function UnderlineInput({
  label,
  value,
  inputRef,
  testID,
  ...inputProps
}: UnderlineInputProps) {
  const { colors, textVariants } = useTheme<Theme>();
  const { labelToValue, valueHeight, valueToLine } = sizes.underlineInput;

  return (
    <Box width="100%">
      <Text variant="fieldLabel" textAlign="center">
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        testID={testID}
        value={value}
        accessibilityLabel={label}
        maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        autoCorrect={false}
        autoCapitalize="none"
        {...inputProps}
        style={[
          styles.input,
          {
            marginTop: labelToValue,
            height: valueHeight,
            color: colors.textPrimary,
            fontFamily: textVariants.inputValue.fontFamily,
            fontSize: textVariants.inputValue.fontSize,
          },
        ]}
      />
      <Box
        testID={testID ? `${testID}-underline` : undefined}
        height={sizes.borderHairline}
        backgroundColor={value ? 'inputLineFilled' : 'inputLine'}
        style={{ marginTop: valueToLine }}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
