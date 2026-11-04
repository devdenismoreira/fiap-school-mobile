import {
  createBox,
  createRestyleComponent,
  createText,
  createVariant,
  type VariantProps,
} from '@shopify/restyle';
import type { ComponentProps } from 'react';

import type { Theme } from './theme';

// Limite de escala de fonte do sistema para preservar o layout do Figma.
export const MAX_FONT_SIZE_MULTIPLIER = 1.3;

export const Box = createBox<Theme>();

const RestyleText = createText<Theme>();

export type TextProps = ComponentProps<typeof RestyleText>;

export function Text(props: TextProps) {
  return (
    <RestyleText maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER} {...props} />
  );
}

export type CardProps = VariantProps<Theme, 'cardVariants'> &
  ComponentProps<typeof Box>;

/** Box com as variantes de card do tema (`variant="raised"`). */
export const Card = createRestyleComponent<CardProps, Theme>(
  [createVariant({ themeKey: 'cardVariants' })],
  Box,
);
