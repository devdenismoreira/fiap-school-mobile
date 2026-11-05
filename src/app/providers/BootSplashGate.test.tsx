import BootSplash from 'react-native-bootsplash';
import { waitFor } from '@testing-library/react-native';

import { NetworkError } from '@/core/errors/NetworkError';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import { BootSplashGate } from './BootSplashGate';

const hide = BootSplash.hide as jest.Mock;

describe('BootSplashGate', () => {
  beforeEach(() => hide.mockClear());

  it('mantém a abertura enquanto a sessão é restaurada e esconde ao terminar', async () => {
    let finish: (value: null) => void = () => undefined;
    const restoreSession = jest.fn(
      () => new Promise<null>(resolve => (finish = resolve)),
    );
    await renderWithSession(
      <BootSplashGate />,
      makeSessionDependencies({ restoreSession }),
    );

    expect(hide).not.toHaveBeenCalled();

    finish(null);
    await waitFor(() => expect(hide).toHaveBeenCalledWith({ fade: true }));
  });

  it('esconde também quando a restauração falha por falta de conexão', async () => {
    await renderWithSession(
      <BootSplashGate />,
      makeSessionDependencies({
        restoreSession: jest.fn().mockRejectedValue(new NetworkError()),
      }),
    );

    await waitFor(() => expect(hide).toHaveBeenCalledTimes(1));
  });
});
