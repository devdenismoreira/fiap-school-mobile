import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { act, screen } from '@testing-library/react-native';

import { NetworkError } from '@/core/errors/NetworkError';
import { CONNECTIVITY_SETTLE_MS } from '@/core/network/useConnectivity';
import { makeGuardian } from '@/test-utils/fixtures';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import {
  ConnectivityFeedback,
  OFFLINE_MESSAGE,
  ONLINE_MESSAGE,
} from './ConnectivityFeedback';

const addEventListener = NetInfo.addEventListener as jest.Mock;

const emit = (isConnected: boolean) =>
  act(async () => {
    const listener = addEventListener.mock.calls.at(-1)?.[0] as (
      state: Partial<NetInfoState>,
    ) => void;
    listener({ isConnected, isInternetReachable: isConnected });
  });

const settle = () =>
  act(async () => jest.advanceTimersByTime(CONNECTIVITY_SETTLE_MS));

describe('ConnectivityFeedback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    addEventListener.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  it('o estado ao abrir o app não gera aviso', async () => {
    await renderWithSession(<ConnectivityFeedback />);

    await emit(false);
    await settle();

    expect(screen.queryByText(OFFLINE_MESSAGE)).toBeNull();
  });

  it('avisa quando a conexão cai e quando volta', async () => {
    await renderWithSession(<ConnectivityFeedback />);
    await emit(true);

    await emit(false);
    await settle();
    expect(screen.getByText(OFFLINE_MESSAGE)).toBeOnTheScreen();

    await emit(true);
    await settle();
    expect(screen.getByText(ONLINE_MESSAGE)).toBeOnTheScreen();
    expect(screen.queryByText(OFFLINE_MESSAGE)).toBeNull();
  });

  it(`ignora quedas de menos de ${CONNECTIVITY_SETTLE_MS} ms`, async () => {
    await renderWithSession(<ConnectivityFeedback />);
    await emit(true);

    await emit(false);
    await act(async () => jest.advanceTimersByTime(CONNECTIVITY_SETTLE_MS / 2));
    await emit(true);
    await settle();

    expect(screen.queryByText(OFFLINE_MESSAGE)).toBeNull();
    expect(screen.queryByText(ONLINE_MESSAGE)).toBeNull();
  });

  it('na tela de conexão, tenta restaurar a sessão sozinho quando a internet volta', async () => {
    const restoreSession = jest
      .fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValueOnce({
        guardian: makeGuardian(),
        selectedStudentRm: 100,
      });
    await renderWithSession(
      <ConnectivityFeedback />,
      makeSessionDependencies({ restoreSession }),
    );
    await emit(false);
    expect(restoreSession).toHaveBeenCalledTimes(1);

    await emit(true);
    await settle();

    expect(restoreSession).toHaveBeenCalledTimes(2);
    expect(screen.getByText(ONLINE_MESSAGE)).toBeOnTheScreen();
  });
});
