import type { InternalAxiosRequestConfig } from 'axios';

import { NetworkError } from '@/core/errors/NetworkError';
import { SessionExpiredError } from '@/core/errors/SessionExpiredError';
import {
  apiError,
  authHeader,
  createFakeAdapter,
  createMemoryTokenStore,
  requestBody,
  type FakeRoute,
} from '@/test-utils/fakeHttp';
import { createApiClient, REFRESH_PATH } from './apiClient';
import { ApiError } from './apiErrors';

const tokensReply = (accessToken: string, refreshToken: string) => ({
  status: 200,
  data: {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 900,
    refreshToken,
    refreshExpiresIn: 2592000,
  },
});

function setup(
  route: FakeRoute,
  tokens: { accessToken?: string; refreshToken?: string } = {},
) {
  const tokenStore = createMemoryTokenStore(tokens);
  const { adapter, requests } = createFakeAdapter(route);
  const http = createApiClient({
    baseURL: 'http://api.test',
    tokenStore,
    adapter,
  });
  const callsTo = (url: string) => requests.filter(r => r.url === url);
  return { http, tokenStore, requests, callsTo };
}

const isMe = (request: InternalAxiosRequestConfig) => request.url === '/v1/me';

describe('createApiClient', () => {
  it('envia o access token da memória como Bearer', async () => {
    const { http, requests } = setup(() => ({ status: 200, data: {} }), {
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });

    await http.get('/v1/me');

    expect(authHeader(requests[0])).toBe('Bearer access-1');
  });

  it('sem access em memória, renova antes de enviar e guarda o novo par', async () => {
    const { http, tokenStore, requests } = setup(
      request =>
        request.url === REFRESH_PATH
          ? tokensReply('access-novo', 'refresh-novo')
          : { status: 200, data: { id: 1 } },
      { refreshToken: 'refresh-salvo' },
    );

    const { data } = await http.get('/v1/me');

    expect(data).toEqual({ id: 1 });
    expect(requests.map(r => r.url)).toEqual([REFRESH_PATH, '/v1/me']);
    expect(requestBody(requests[0])).toEqual({ refreshToken: 'refresh-salvo' });
    expect(authHeader(requests[0])).toBeFalsy();
    expect(authHeader(requests[1])).toBe('Bearer access-novo');
    expect(tokenStore.saved).toEqual([
      { accessToken: 'access-novo', refreshToken: 'refresh-novo' },
    ]);
  });

  it('401 TOKEN_EXPIRADO: renova uma vez e repete a requisição original uma vez', async () => {
    const { http, callsTo } = setup(
      request => {
        if (request.url === REFRESH_PATH) {
          return tokensReply('access-novo', 'refresh-novo');
        }
        return authHeader(request) === 'Bearer access-velho'
          ? apiError(401, 'TOKEN_EXPIRADO')
          : { status: 200, data: { ok: true } };
      },
      { accessToken: 'access-velho', refreshToken: 'refresh-1' },
    );

    const { data } = await http.get('/v1/me');

    expect(data).toEqual({ ok: true });
    expect(callsTo(REFRESH_PATH)).toHaveLength(1);
    expect(callsTo('/v1/me').map(authHeader)).toEqual([
      'Bearer access-velho',
      'Bearer access-novo',
    ]);
  });

  it('cinco requisições simultâneas com 401 geram um único refresh', async () => {
    let expiredReplies = 0;
    let releaseRefresh: () => void = () => undefined;
    const allExpired = new Promise<void>(resolve => {
      releaseRefresh = resolve;
    });

    const { http, callsTo } = setup(
      async request => {
        if (request.url === REFRESH_PATH) {
          await allExpired;
          return tokensReply('access-novo', 'refresh-novo');
        }
        if (authHeader(request) === 'Bearer access-velho') {
          expiredReplies += 1;
          if (expiredReplies === 5) {
            releaseRefresh();
          }
          return apiError(401, 'TOKEN_EXPIRADO');
        }
        return { status: 200, data: { url: request.url } };
      },
      { accessToken: 'access-velho', refreshToken: 'refresh-1' },
    );

    const results = await Promise.all(
      [1, 2, 3, 4, 5].map(n => http.get(`/v1/alunos/${n}/agenda`)),
    );

    expect(results.map(r => r.data.url)).toEqual(
      [1, 2, 3, 4, 5].map(n => `/v1/alunos/${n}/agenda`),
    );
    expect(callsTo(REFRESH_PATH)).toHaveLength(1);
  });

  it('401 que chega depois da renovação repete com o token novo, sem outro refresh', async () => {
    const { http, tokenStore, callsTo } = setup(
      request => {
        if (request.url === REFRESH_PATH) {
          return tokensReply('access-novo', 'refresh-novo');
        }
        return authHeader(request) === 'Bearer access-velho'
          ? apiError(401, 'TOKEN_EXPIRADO')
          : { status: 200, data: {} };
      },
      { accessToken: 'access-velho', refreshToken: 'refresh-1' },
    );

    await http.get('/v1/me');
    await tokenStore.save({ accessToken: 'access-novo', refreshToken: 'r' });
    const late = http.get('/v1/me', {
      headers: { Authorization: 'Bearer access-velho' },
    });

    await expect(late).resolves.toBeDefined();
    expect(callsTo(REFRESH_PATH)).toHaveLength(1);
  });

  it('refresh recusado (401) limpa os tokens e rejeita com SessionExpiredError', async () => {
    const { http, tokenStore, requests } = setup(
      request =>
        request.url === REFRESH_PATH
          ? apiError(401, 'REFRESH_INVALIDO')
          : { status: 200, data: {} },
      { refreshToken: 'refresh-revogado' },
    );

    await expect(http.get('/v1/me')).rejects.toBeInstanceOf(
      SessionExpiredError,
    );
    expect(requests.filter(isMe)).toHaveLength(0);
    expect(tokenStore.getAccessToken()).toBeNull();
    await expect(tokenStore.getRefreshToken()).resolves.toBeNull();
  });

  it('sem nenhum token, rejeita com SessionExpiredError sem chamar a API', async () => {
    const { http, requests } = setup(() => ({ status: 200 }));

    await expect(http.get('/v1/me')).rejects.toBeInstanceOf(
      SessionExpiredError,
    );
    expect(requests).toHaveLength(0);
  });

  it('nunca repete mais de uma vez: 401 depois da renovação encerra a sessão', async () => {
    const { http, tokenStore, callsTo } = setup(
      request =>
        request.url === REFRESH_PATH
          ? tokensReply('access-novo', 'refresh-novo')
          : apiError(401, 'TOKEN_EXPIRADO'),
      { accessToken: 'access-velho', refreshToken: 'refresh-1' },
    );

    await expect(http.get('/v1/me')).rejects.toBeInstanceOf(
      SessionExpiredError,
    );
    expect(callsTo('/v1/me')).toHaveLength(2);
    expect(callsTo(REFRESH_PATH)).toHaveLength(1);
    expect(tokenStore.getAccessToken()).toBeNull();
  });

  it('401 TOKEN_INVALIDO (sessão revogada) limpa os tokens sem tentar renovar', async () => {
    const { http, tokenStore, callsTo } = setup(
      () => apiError(401, 'TOKEN_INVALIDO'),
      { accessToken: 'access-1', refreshToken: 'refresh-1' },
    );

    await expect(http.get('/v1/me')).rejects.toBeInstanceOf(
      SessionExpiredError,
    );
    expect(callsTo(REFRESH_PATH)).toHaveLength(0);
    await expect(tokenStore.getRefreshToken()).resolves.toBeNull();
  });

  it('rotas de autenticação não enviam Bearer nem renovam no 401', async () => {
    const { http, callsTo } = setup(
      () => apiError(401, 'CREDENCIAIS_INVALIDAS'),
      { accessToken: 'access-1', refreshToken: 'refresh-1' },
    );

    const failure = await http
      .post('/v1/auth/login', { cpf: 'x', senha: 'y' }, { skipAuth: true })
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({
      status: 401,
      code: 'CREDENCIAIS_INVALIDAS',
    });
    expect(authHeader(callsTo('/v1/auth/login')[0])).toBeFalsy();
    expect(callsTo(REFRESH_PATH)).toHaveLength(0);
  });

  it.each([
    ['sem resposta', 'network-error' as const],
    ['timeout', 'timeout' as const],
    ['5xx', { status: 503, data: { status: 'indisponivel' } }],
  ])('%s vira NetworkError', async (_label, reply) => {
    const { http } = setup(() => reply, {
      accessToken: 'a',
      refreshToken: 'r',
    });

    await expect(http.get('/v1/me')).rejects.toBeInstanceOf(NetworkError);
  });

  it('4xx vira ApiError com o código do corpo { erro: { codigo } }', async () => {
    const { http } = setup(() => apiError(429, 'MUITAS_TENTATIVAS'));

    await expect(
      http.post('/v1/auth/login', {}, { skipAuth: true }),
    ).rejects.toMatchObject({ status: 429, code: 'MUITAS_TENTATIVAS' });
  });
});
