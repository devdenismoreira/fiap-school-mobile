import { fireEvent, screen } from '@testing-library/react-native';

import { theme } from '@/core/theme';
import { renderWithTheme } from '@/test-utils/renderWithTheme';
import { PrimaryButton } from './PrimaryButton';

describe('PrimaryButton', () => {
  it('habilitado: texto preto e dispara onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<PrimaryButton label="FAZER LOGIN" onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'FAZER LOGIN' });
    expect(button).toBeEnabled();
    expect(screen.getByText('FAZER LOGIN')).toHaveStyle({
      color: theme.colors.onPrimary,
    });

    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('desabilitado: texto #777777 e não dispara onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <PrimaryButton label="FAZER LOGIN" onPress={onPress} disabled />,
    );

    const button = screen.getByRole('button', { name: 'FAZER LOGIN' });
    expect(button).toBeDisabled();
    expect(screen.getByText('FAZER LOGIN')).toHaveStyle({
      color: theme.colors.textDisabled,
    });

    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('carregando: botão vazio, ocupado e sem disparar onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <PrimaryButton label="FAZER LOGIN" onPress={onPress} loading />,
    );

    const button = screen.getByRole('button', { name: 'FAZER LOGIN' });
    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    expect(screen.queryByText('FAZER LOGIN')).toBeNull();

    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('pinta a área segura inferior com a cor do botão', async () => {
    await renderWithTheme(
      <PrimaryButton label="FAZER LOGIN" onPress={jest.fn()} bottomInset={34} />,
    );

    expect(screen.getByRole('button', { name: 'FAZER LOGIN' })).toHaveStyle({
      backgroundColor: theme.colors.primary,
      paddingBottom: 34,
    });
  });
});
