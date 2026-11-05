import type { StyleProp, ViewStyle } from 'react-native';
import { LocalSvg } from 'react-native-svg/css';

import calendarActive from '@/assets/icons/calendar-active.svg';
import calendarInactive from '@/assets/icons/calendar-inactive.svg';
import checkFileActive from '@/assets/icons/check-file-active.svg';
import checkFileInactive from '@/assets/icons/check-file-inactive.svg';
import close from '@/assets/icons/close.svg';
import downArrow from '@/assets/icons/down-arrow.svg';
import logout from '@/assets/icons/logout.svg';
import { Box } from '@/core/theme';

// `frame` é a caixa do ícone no Figma; `width`/`height` são as dimensões do
// próprio SVG exportado, que fica centralizado na caixa sem ser esticado.
// As cores vêm dos arquivos (uma exportação por estado).
const icons = {
  arrowDown: { source: downArrow, frame: 14, width: 14, height: 14 },
  calendarActive: {
    source: calendarActive,
    frame: 24,
    width: 21.4311,
    height: 24,
  },
  calendarInactive: {
    source: calendarInactive,
    frame: 24,
    width: 21.4311,
    height: 24,
  },
  reportActive: { source: checkFileActive, frame: 24, width: 24, height: 24 },
  reportInactive: {
    source: checkFileInactive,
    frame: 24,
    width: 24,
    height: 24,
  },
  close: { source: close, frame: 24, width: 24, height: 24 },
  logout: { source: logout, frame: 10, width: 10, height: 9.99995 },
} as const;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Ícone decorativo: o rótulo acessível fica no elemento interativo que o contém. */
export function Icon({ name, style, testID }: IconProps) {
  const { source, frame, width, height } = icons[name];

  return (
    <Box
      testID={testID}
      width={frame}
      height={frame}
      alignItems="center"
      justifyContent="center"
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={style}
    >
      <LocalSvg asset={source} width={width} height={height} />
    </Box>
  );
}
