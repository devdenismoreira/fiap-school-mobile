import { screen } from '@testing-library/react-native';

import { renderWithTheme } from '@/test-utils/renderWithTheme';
import { Icon, type IconName } from './Icon';

// O ícone é ocultado dos leitores de tela de propósito; a busca precisa incluí-lo.
const hidden = { includeHiddenElements: true };

describe('Icon', () => {
  it.each<[IconName, number, number, number]>([
    ['arrowDown', 14, 14, 14],
    ['calendarActive', 24, 21.4311, 24],
    ['calendarInactive', 24, 21.4311, 24],
    ['reportActive', 24, 24, 24],
    ['reportInactive', 24, 24, 24],
    ['close', 24, 24, 24],
    ['logout', 10, 10, 9.99995],
  ])(
    '%s: caixa de %p pt com o SVG no tamanho original (%p × %p)',
    async (name, frame, width, height) => {
      await renderWithTheme(<Icon name={name} testID="icon" />);

      expect(screen.getByTestId('icon', hidden)).toHaveStyle({
        width: frame,
        height: frame,
      });
      const svg = screen.getByTestId('local-svg', hidden);
      expect(svg).toHaveProp('width', width);
      expect(svg).toHaveProp('height', height);
      expect(svg.props.asset).toBeDefined();
    },
  );

  it('é ignorado por leitores de tela', async () => {
    await renderWithTheme(<Icon name="close" testID="icon" />);

    expect(screen.queryByTestId('icon')).toBeNull();
    expect(screen.getByTestId('icon', hidden)).toHaveProp(
      'importantForAccessibility',
      'no-hide-descendants',
    );
    expect(screen.getByTestId('icon', hidden)).toHaveProp(
      'accessibilityElementsHidden',
      true,
    );
  });
});
