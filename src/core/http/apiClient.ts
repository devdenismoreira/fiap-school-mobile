import axios, {
  isAxiosError,
  type AxiosAdapter,
  type AxiosInstance,
} from 'axios';

import { SessionExpiredError } from '@/core/errors/SessionExpiredError';
import type { TokenStore } from '@/core/storage/tokenStore';
import { ApiError, normalizeApiError } from './apiErrors';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    retriedAfterRefresh?: boolean;
  }
}

export const API_TIMEOUT_MS = 20_000;
export const REFRESH_PATH = '/v1/auth/refresh';

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

type ApiClientOptions = {
  baseURL: string;
  tokenStore: TokenStore;
  timeout?: number;
  adapter?: AxiosAdapter;
};

const bearer = (accessToken: string) => `Bearer ${accessToken}`;

export function createApiClient({
  baseURL,
  tokenStore,
  timeout = API_TIMEOUT_MS,
  adapter,
}: ApiClientOptions): AxiosInstance {
  const http = axios.create({
    baseURL,
    timeout,
    headers: { Accept: 'application/json' },
    ...(adapter ? { adapter } : {}),
  });

  let pendingRefresh: Promise<string> | null = null;

  const performRefresh = async () => {
    const refreshToken = await tokenStore.getRefreshToken();
    if (!refreshToken) {
      throw new SessionExpiredError();
    }
    try {
      const { data } = await http.post<RefreshResponse>(
        REFRESH_PATH,
        { refreshToken },
        { skipAuth: true },
      );
      await tokenStore.save({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return data.accessToken;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await tokenStore.clear();
        throw new SessionExpiredError();
      }
      throw error;
    }
  };

  const refreshAccessToken = () => {
    if (!pendingRefresh) {
      pendingRefresh = performRefresh().finally(() => {
        pendingRefresh = null;
      });
    }
    return pendingRefresh;
  };

  http.interceptors.request.use(async config => {
    if (config.skipAuth) {
      return config;
    }
    const accessToken =
      tokenStore.getAccessToken() ?? (await refreshAccessToken());
    config.headers.set('Authorization', bearer(accessToken));
    return config;
  });

  http.interceptors.response.use(undefined, async (error: unknown) => {
    const failure = normalizeApiError(error);
    const config = isAxiosError(error) ? error.config : undefined;

    if (
      !(failure instanceof ApiError) ||
      failure.status !== 401 ||
      !config ||
      config.skipAuth
    ) {
      throw failure;
    }

    if (failure.code === 'TOKEN_EXPIRADO' && !config.retriedAfterRefresh) {
      const current = tokenStore.getAccessToken();
      const sentWith = config.headers.get('Authorization');
      const accessToken =
        current && bearer(current) !== sentWith
          ? current
          : await refreshAccessToken();
      config.retriedAfterRefresh = true;
      config.headers.set('Authorization', bearer(accessToken));
      return http.request(config);
    }

    await tokenStore.clear();
    throw new SessionExpiredError();
  });

  return http;
}
