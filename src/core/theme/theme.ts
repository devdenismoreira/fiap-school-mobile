import { createTheme } from '@shopify/restyle';

import { fonts } from './fonts';
import { sizes } from './sizes';

const palette = {
  black: '#000000',
  white: '#FFFFFF',
  aqua: '#29F4D5',
  turquoise: '#20E6D0',
  pink: '#F0005B',
  amber: '#F5C84B',
  gray900: '#262626',
  gray700: '#4D4D4D',
  gray600: '#525252',
  gray500: '#777777',
  gray300: '#CCCCCC',
};

export const theme = createTheme({
  colors: {
    background: palette.black,
    textPrimary: palette.white,
    primary: palette.aqua,
    onPrimary: palette.black,
    surface: palette.gray900,
    surfaceRaised: palette.gray700,
    timelineDot: palette.gray300,
    inputLine: palette.gray600,
    inputLineFilled: palette.white,
    textDisabled: palette.gray500,
    feedbackSuccess: palette.turquoise,
    feedbackInfo: palette.turquoise,
    feedbackError: palette.pink,
    feedbackWarning: palette.amber,
    transparent: 'transparent',
  },
  spacing: {
    none: 0,
    xxs: 4,
    xs: 8,
    s: 10,
    sm: 12,
    m: 16,
    ml: 20,
    l: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
    huge: 64,
    giant: 80,
  },
  borderRadii: {
    none: 0,
    m: 8,
    round: 999,
  },
  breakpoints: {
    phone: 0,
  },
  textVariants: {
    defaults: {
      fontFamily: fonts.regular,
      fontSize: 16,
      lineHeight: 20,
      color: 'textPrimary',
    },
    inputValue: { fontFamily: fonts.regular, fontSize: 32, lineHeight: 39 },
    greeting: { fontFamily: fonts.regular, fontSize: 24, lineHeight: 29 },
    greetingBold: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 29 },
    headline: { fontFamily: fonts.regular, fontSize: 24, lineHeight: 29 },
    sectionTitle: {
      fontFamily: fonts.bold,
      fontSize: 20,
      lineHeight: 24,
      color: 'primary',
    },
    fieldLabel: { fontFamily: fonts.regular, fontSize: 20, lineHeight: 24 },
    button: { fontFamily: fonts.medium, fontSize: 20, lineHeight: 24 },
    emptyState: { fontFamily: fonts.regular, fontSize: 20, lineHeight: 24 },
    body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 20 },
    bodyMedium: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 20 },
    bodySemiBold: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 20 },
    bodyBold: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20 },
    caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 15 },
    captionMedium: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 15 },
    tabLabel: { fontFamily: fonts.bold, fontSize: 10, lineHeight: 12 },
  },
  cardVariants: {
    defaults: {},
    raised: {
      backgroundColor: 'surfaceRaised',
      borderRadius: 'm',
      height: sizes.cardHeight,
    },
  },
});

export type Theme = typeof theme;
