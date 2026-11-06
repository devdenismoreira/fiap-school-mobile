import { act, fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { motion } from '@/core/theme';
import { renderWithTheme } from '@/test-utils/renderWithTheme';
import { Collapsible } from './Collapsible';

const hidden = { includeHiddenElements: true };

describe('Collapsible', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('fechado não renderiza o conteúdo', async () => {
    await renderWithTheme(
      <Collapsible expanded={false}>
        <Text>Conteúdo</Text>
      </Collapsible>,
    );

    expect(screen.queryByText('Conteúdo', hidden)).toBeNull();
  });

  it('ao abrir, renderiza o conteúdo e informa a altura medida', async () => {
    const onContentHeight = jest.fn();
    const props = { testID: 'collapsible', onContentHeight };
    const view = await renderWithTheme(
      <Collapsible {...props} expanded={false}>
        <Text>Conteúdo</Text>
      </Collapsible>,
    );

    await view.rerender(
      <Collapsible {...props} expanded>
        <Text>Conteúdo</Text>
      </Collapsible>,
    );
    expect(screen.getByText('Conteúdo')).toBeOnTheScreen();

    await fireEvent(screen.getByTestId('collapsible-content'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 320, height: 120 } },
    });
    expect(onContentHeight).toHaveBeenCalledWith(120);
  });

  it('ao fechar, some para leitores de tela na hora e só sai da árvore depois da animação', async () => {
    const view = await renderWithTheme(
      <Collapsible expanded>
        <Text>Conteúdo</Text>
      </Collapsible>,
    );

    await view.rerender(
      <Collapsible expanded={false}>
        <Text>Conteúdo</Text>
      </Collapsible>,
    );
    expect(screen.queryByText('Conteúdo')).toBeNull();
    expect(screen.getByText('Conteúdo', hidden)).toBeOnTheScreen();

    await act(async () => jest.advanceTimersByTime(motion.open + 50));
    expect(screen.queryByText('Conteúdo', hidden)).toBeNull();
  });
});
