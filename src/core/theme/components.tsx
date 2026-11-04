import { createBox, createText } from '@shopify/restyle';
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
