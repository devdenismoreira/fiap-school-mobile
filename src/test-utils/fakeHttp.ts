import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { SessionTokens, TokenStore } from '@/core/storage/tokenStore';

export type FakeReply =
  | { status: number; data?: unknown }
  | 'network-error'
  | 'timeout';

export type FakeRoute = (
  request: InternalAxiosRequestConfig,
) => FakeReply | Promise<FakeReply>;

export function createFakeAdapter(route: FakeRoute) {
  const requests: InternalAxiosRequestConfig[] = [];

  const adapter: AxiosAdapter = async config => {
    const snapshot = {
      ...config,
      headers: new AxiosHeaders(config.headers.toJSON()),
    };
    requests.push(snapshot);
    const reply = await route(snapshot);
    if (reply === 'network-error') {
      throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config);
    }
    if (reply === 'timeout') {
      throw new AxiosError('timeout', AxiosError.ECONNABORTED, config);
    }
    const response: AxiosResponse = {
      data: reply.data ?? '',
      status: reply.status,
      statusText: '',
      headers: {},
      config,
    };
    if (reply.status >= 200 && reply.status < 300) {
      return response;
    }
    throw new AxiosError(
      `Request failed with status code ${reply.status}`,
      reply.status >= 500
        ? AxiosError.ERR_BAD_RESPONSE
        : AxiosError.ERR_BAD_REQUEST,
      config,
      null,
      response,
    );
  };

  return { adapter, requests };
}

export const apiError = (status: number, codigo: string) => ({
  status,
  data: { erro: { codigo, mensagem: codigo } },
});

export const authHeader = (request: InternalAxiosRequestConfig) =>
  request.headers.get('Authorization');

export const requestBody = (request: InternalAxiosRequestConfig): unknown =>
  typeof request.data === 'string' ? JSON.parse(request.data) : request.data;

export function createMemoryTokenStore(
  initial: Partial<SessionTokens> = {},
): TokenStore & {
  saved: SessionTokens[];
  setRefreshToken: (token: string) => void;
} {
  let accessToken = initial.accessToken ?? null;
  let refreshToken = initial.refreshToken ?? null;
  const saved: SessionTokens[] = [];

  return {
    saved,
    setRefreshToken: token => {
      refreshToken = token;
    },
    getAccessToken: () => accessToken,
    getRefreshToken: async () => refreshToken,
    save: async tokens => {
      saved.push(tokens);
      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;
    },
    clear: async () => {
      accessToken = null;
      refreshToken = null;
    },
  };
}
