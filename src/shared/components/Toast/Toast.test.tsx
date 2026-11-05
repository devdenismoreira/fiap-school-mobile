import { act, fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import { GestureHandlerRootView, State } from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';

import { theme } from '@/core/theme';
import { renderWithTheme } from '@/test-utils/renderWithTheme';
import { Toast, TOAST_DISMISS_DISTANCE } from './Toast';

const MESSAGE = 'Sua sessão expirou.\nEntre novamente.';

async function renderToast() {
  const onDismiss = jest.fn();
  await renderWithTheme(
    <GestureHandlerRootView style={styles.root}>
      <Toast message={MESSAGE} onDismiss={onDismiss} />
    </GestureHandlerRootView>,
  );
  return onDismiss;
}

const swipe = (distance: number) =>
  act(async () =>
    fireGestureHandler(getByGestureTestId('toast-pan'), [
      { state: State.BEGAN, translationY: 0 },
      { state: State.ACTIVE, translationY: distance },
      { state: State.END, translationY: distance },
    ]),
  );

describe('Toast', () => {
  it('usa os tokens do design system: surfaceRaised, raio 8 e texto branco em 2 linhas no máximo', async () => {
    await renderToast();

    const text = screen.getByText(MESSAGE);
    expect(text).toHaveProp('numberOfLines', 2);
    expect(text).toHaveStyle({ color: theme.colors.textPrimary });
    expect(screen.getByTestId('toast').children[0]).toHaveStyle({
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: theme.borderRadii.m,
    });
  });

  it('anuncia a mensagem ao leitor de tela e se apresenta como botão de fechar', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

    await renderToast();

    expect(announce).toHaveBeenCalledWith(
      'Sua sessão expirou. Entre novamente.',
    );
    const toast = screen.getByRole('button', {
      name: 'Sua sessão expirou. Entre novamente.',
    });
    expect(toast).toHaveProp('accessibilityHint', 'Toque para fechar');
  });

  it('fecha ao tocar', async () => {
    const onDismiss = await renderToast();

    await fireEvent.press(screen.getByTestId('toast'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it(`fecha ao arrastar para baixo mais de ${TOAST_DISMISS_DISTANCE} pt`, async () => {
    const onDismiss = await renderToast();

    await swipe(TOAST_DISMISS_DISTANCE + 16);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('arrasto curto não fecha', async () => {
    const onDismiss = await renderToast();

    await swipe(TOAST_DISMISS_DISTANCE - 8);

    expect(onDismiss).not.toHaveBeenCalled();
  });
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
