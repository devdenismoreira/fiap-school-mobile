import { act, fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo, StyleSheet } from 'react-native';
import { GestureHandlerRootView, State } from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';

import { getAnimatedStyle } from 'react-native-reanimated';

import { motion, theme } from '@/core/theme';
import { renderWithTheme } from '@/test-utils/renderWithTheme';
import { Toast, TOAST_DISMISS_DISTANCE } from './Toast';
import type { ToastVariant } from './ToastIcon';

const TITLE = 'Sessão expirada';
const MESSAGE = 'Entre novamente para continuar.';

async function renderToast(variant: ToastVariant = 'warning') {
  const onDismiss = jest.fn();
  await renderWithTheme(
    <GestureHandlerRootView style={styles.root}>
      <Toast
        title={TITLE}
        message={MESSAGE}
        variant={variant}
        onDismiss={onDismiss}
      />
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
  it('usa os tokens do design system: fundo surface, raio 8, título e mensagem', async () => {
    await renderToast();

    expect(screen.getByText(TITLE)).toHaveStyle({
      color: theme.colors.textPrimary,
    });
    expect(screen.getByText(MESSAGE)).toHaveProp('numberOfLines', 2);
    expect(screen.getByTestId('toast').children[0]).toHaveStyle({
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadii.m,
    });
  });

  it.each([
    ['success', theme.colors.feedbackSuccess],
    ['info', theme.colors.feedbackInfo],
    ['error', theme.colors.feedbackError],
    ['warning', theme.colors.feedbackWarning],
  ] as const)(
    'variante %s usa a cor de destaque na linha inferior',
    async (variant, color) => {
      await renderToast(variant);

      expect(screen.getByTestId('toast-accent')).toHaveStyle({
        backgroundColor: color,
      });
    },
  );

  it('a linha de destaque encolhe como um progresso até o fim da duração', async () => {
    jest.useFakeTimers();
    await renderToast();
    const scale = () =>
      (
        getAnimatedStyle as unknown as (c: unknown) => {
          transform?: { scaleX: number }[];
        }
      )(screen.getByTestId('toast-accent')).transform?.[0].scaleX;

    expect(scale()).toBe(1);
    await act(async () => jest.advanceTimersByTime(motion.toastDuration / 2));
    expect(scale()).toBeCloseTo(0.5, 1);
    await act(async () => jest.advanceTimersByTime(motion.toastDuration));
    expect(scale()).toBe(0);
    jest.useRealTimers();
  });

  it('anuncia título e mensagem ao leitor de tela e se apresenta como botão de fechar', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

    await renderToast();

    const spoken = `${TITLE}. ${MESSAGE}`;
    expect(announce).toHaveBeenCalledWith(spoken);
    const toast = screen.getByRole('button', { name: spoken });
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
