import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import { ConnectionErrorScreen } from './ConnectionErrorScreen';

describe('ConnectionErrorScreen', () => {
  it('mostra o logo, a mensagem de conexão e o botão TENTAR NOVAMENTE', async () => {
    await renderWithSession(<ConnectionErrorScreen />);

    expect(
      screen.getByRole('image', { name: 'FIAP School' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText('Não foi possível conectar.\nVerifique sua internet.'),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'TENTAR NOVAMENTE' }),
    ).toBeEnabled();
  });

  it('anuncia a mensagem ao leitor de tela', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

    await renderWithSession(<ConnectionErrorScreen />);

    expect(announce).toHaveBeenCalledWith(
      'Não foi possível conectar. Verifique sua internet.',
    );
  });

  it('TENTAR NOVAMENTE refaz a restauração da sessão', async () => {
    const dependencies = makeSessionDependencies();
    await renderWithSession(<ConnectionErrorScreen />, dependencies);
    await waitFor(() =>
      expect(dependencies.restoreSession).toHaveBeenCalledTimes(1),
    );

    await fireEvent.press(
      screen.getByRole('button', { name: 'TENTAR NOVAMENTE' }),
    );

    await waitFor(() =>
      expect(dependencies.restoreSession).toHaveBeenCalledTimes(2),
    );
  });
});
