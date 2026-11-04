import { act, screen } from '@testing-library/react-native';
import { getAnimatedStyle } from 'react-native-reanimated';

import { motion } from '@/core/theme';
import { renderWithTheme } from '@/test-utils/renderWithTheme';
import { ExpandArrow } from './ExpandArrow';

describe('ExpandArrow', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  // O tipo público de getAnimatedStyle não declara parâmetros, mas a versão de
  // testes (ativada por setUpTests) recebe o componente e devolve o estilo animado.
  const readAnimatedStyle = getAnimatedStyle as unknown as (
    component: unknown,
  ) => { transform?: unknown };

  const rotation = () =>
    readAnimatedStyle(
      screen.getByTestId('arrow', { includeHiddenElements: true }),
    ).transform;

  it('fechada aponta para baixo e aberta gira 180°', async () => {
    const view = await renderWithTheme(
      <ExpandArrow testID="arrow" expanded={false} />,
    );
    expect(rotation()).toEqual([{ rotate: '0deg' }]);

    await view.rerender(<ExpandArrow testID="arrow" expanded />);
    await act(async () => jest.advanceTimersByTime(motion.fast));

    expect(rotation()).toEqual([{ rotate: '180deg' }]);
  });

  it('começa já girada quando montada aberta', async () => {
    await renderWithTheme(<ExpandArrow testID="arrow" expanded />);

    expect(rotation()).toEqual([{ rotate: '180deg' }]);
  });
});
