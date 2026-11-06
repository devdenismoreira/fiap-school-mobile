import { createApiClient } from '@/core/http/apiClient';
import {
  createFakeAdapter,
  createMemoryTokenStore,
  requestBody,
  type FakeRoute,
} from '@/test-utils/fakeHttp';
import {
  createEndSession,
  LOGOUT_PATH,
  LOGOUT_TIMEOUT_MS,
} from './remoteSession';

function setup(route: FakeRoute, refreshToken?: string) {
  const tokenStore = createMemoryTokenStore({
    accessToken: refreshToken ? 'access-1' : undefined,
    refreshToken,
  });
  const { adapter, requests } = createFakeAdapter(route);
  const http = createApiClient({
    baseURL: 'http://api.test',
    tokenStore,
    adapter,
  });
  return {
    endSession: createEndSession(http, tokenStore),
    tokenStore,
    requests,
  };
}

const flush = () => new Promise<void>(resolve => setImmediate(() => resolve()));

describe('createEndSession', () => {
  it('apaga os tokens e revoga a sessão no servidor com o refresh, sem Bearer', async () => {
    const { endSession, tokenStore, requests } = setup(
      () => ({ status: 204 }),
      'refresh-1',
    );

    await endSession();
    await flush();

    expect(tokenStore.getAccessToken()).toBeNull();
    await expect(tokenStore.getRefreshToken()).resolves.toBeNull();
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe(LOGOUT_PATH);
    expect(requestBody(requests[0])).toEqual({ refreshToken: 'refresh-1' });
    expect(requests[0].headers.get('Authorization')).toBeFalsy();
    expect(requests[0].timeout).toBe(LOGOUT_TIMEOUT_MS);
  });

  it('não espera a resposta da API para terminar (sair é imediato)', async () => {
    const { endSession, tokenStore } = setup(
      () => new Promise(() => undefined),
      'refresh-1',
    );

    await endSession();

    await expect(tokenStore.getRefreshToken()).resolves.toBeNull();
  });

  it('falha de rede no logout é ignorada', async () => {
    const { endSession } = setup(() => 'network-error', 'refresh-1');

    await expect(endSession()).resolves.toBeUndefined();
    await flush();
  });

  it('sem refresh guardado, não chama a API', async () => {
    const { endSession, requests } = setup(() => ({ status: 204 }));

    await endSession();
    await flush();

    expect(requests).toHaveLength(0);
  });
});
