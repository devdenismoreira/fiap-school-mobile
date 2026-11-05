import { act, fireEvent, screen } from '@testing-library/react-native';
import { Keyboard, Pressable, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initialWindowMetrics } from 'react-native-safe-area-context';

import { motion, sizes, theme } from '@/core/theme';
import { renderWithTheme } from '@/test-utils/renderWithTheme';
import {
  ToastProvider,
  useToast,
  useToastBottomInset,
  type ToastOptions,
} from './ToastProvider';

const SAFE_AREA_BOTTOM = initialWindowMetrics?.insets.bottom ?? 0;

function Trigger({
  message,
  options,
  testID,
}: {
  message: string;
  options?: ToastOptions;
  testID: string;
}) {
  const { showToast } = useToast();
  return (
    <Pressable testID={testID} onPress={() => showToast(message, options)}>
      <Text>{testID}</Text>
    </Pressable>
  );
}

function Closer() {
  const { hideToast } = useToast();
  return (
    <Pressable testID="close" onPress={hideToast}>
      <Text>close</Text>
    </Pressable>
  );
}

function ScreenWithBar({ height }: { height: number }) {
  useToastBottomInset(height);
  return null;
}

async function renderProvider(children: React.ReactNode) {
  await renderWithTheme(
    <GestureHandlerRootView style={styles.root}>
      <ToastProvider>{children}</ToastProvider>
    </GestureHandlerRootView>,
  );
}

const hostBottom = () =>
  StyleSheet.flatten(screen.getByTestId('toast-host').props.style).bottom;

describe('ToastProvider', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('showToast mostra o toast e ele some sozinho depois da duração', async () => {
    await renderProvider(<Trigger testID="show" message="Olá" />);

    await fireEvent.press(screen.getByTestId('show'));
    expect(screen.getByText('Olá')).toBeOnTheScreen();

    await act(async () => jest.advanceTimersByTime(motion.toastDuration));
    expect(screen.queryByText('Olá')).toBeNull();
  });

  it('respeita a duração informada', async () => {
    await renderProvider(
      <Trigger
        testID="show"
        message="Longo"
        options={{ duration: motion.toastDurationLong }}
      />,
    );

    await fireEvent.press(screen.getByTestId('show'));
    await act(async () => jest.advanceTimersByTime(motion.toastDuration));
    expect(screen.getByText('Longo')).toBeOnTheScreen();

    await act(async () =>
      jest.advanceTimersByTime(motion.toastDurationLong - motion.toastDuration),
    );
    expect(screen.queryByText('Longo')).toBeNull();
  });

  it('um toast novo substitui o atual (um por vez)', async () => {
    await renderProvider(
      <>
        <Trigger testID="first" message="Primeiro" />
        <Trigger testID="second" message="Segundo" />
      </>,
    );

    await fireEvent.press(screen.getByTestId('first'));
    await fireEvent.press(screen.getByTestId('second'));

    expect(screen.getByText('Segundo')).toBeOnTheScreen();
    expect(screen.queryByText('Primeiro')).toBeNull();
  });

  it('o mesmo id substitui o texto no lugar e reinicia a duração', async () => {
    await renderProvider(
      <>
        <Trigger
          testID="offline"
          message="Sem conexão"
          options={{ id: 'connectivity' }}
        />
        <Trigger
          testID="online"
          message="Conexão de volta"
          options={{ id: 'connectivity' }}
        />
      </>,
    );

    await fireEvent.press(screen.getByTestId('offline'));
    await act(async () => jest.advanceTimersByTime(motion.toastDuration - 500));
    await fireEvent.press(screen.getByTestId('online'));
    await act(async () => jest.advanceTimersByTime(1000));

    expect(screen.getByText('Conexão de volta')).toBeOnTheScreen();
    expect(screen.queryByText('Sem conexão')).toBeNull();
  });

  it('hideToast fecha na hora', async () => {
    await renderProvider(
      <>
        <Trigger testID="show" message="Olá" />
        <Closer />
      </>,
    );

    await fireEvent.press(screen.getByTestId('show'));
    await fireEvent.press(screen.getByTestId('close'));

    expect(screen.queryByText('Olá')).toBeNull();
  });

  it('fica acima da barra registrada pela tela e da área segura', async () => {
    await renderProvider(
      <>
        <ScreenWithBar height={sizes.tabBar.height} />
        <Trigger testID="show" message="Olá" />
      </>,
    );

    await fireEvent.press(screen.getByTestId('show'));

    expect(hostBottom()).toBe(
      SAFE_AREA_BOTTOM + sizes.tabBar.height + theme.spacing.xs,
    );
  });

  it('com o teclado aberto, sobe acima dele', async () => {
    const listeners: Record<string, (event: unknown) => void> = {};
    jest
      .spyOn(Keyboard, 'addListener')
      .mockImplementation((event, listener) => {
        listeners[event] = listener as (event: unknown) => void;
        return { remove: jest.fn() } as unknown as ReturnType<
          typeof Keyboard.addListener
        >;
      });
    await renderProvider(
      <>
        <ScreenWithBar height={sizes.primaryButtonHeight} />
        <Trigger testID="show" message="Olá" />
      </>,
    );

    await fireEvent.press(screen.getByTestId('show'));
    await act(async () =>
      listeners.keyboardWillShow({ endCoordinates: { height: 300 } }),
    );

    expect(hostBottom()).toBe(
      300 + sizes.primaryButtonHeight + theme.spacing.xs,
    );
  });

  it('useToast fora do provider lança erro explícito', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      renderWithTheme(<Trigger testID="x" message="x" />),
    ).rejects.toThrow('useToast deve ser usado dentro de ToastProvider');
  });
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
