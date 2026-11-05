import type { AxiosInstance } from 'axios';

import type { TokenStore } from '@/core/storage/tokenStore';

export const LOGOUT_PATH = '/v1/auth/logout';
export const LOGOUT_TIMEOUT_MS = 5_000;

export function createEndSession(http: AxiosInstance, tokens: TokenStore) {
  return async (): Promise<void> => {
    const refreshToken = await tokens.getRefreshToken();
    await tokens.clear();
    if (refreshToken) {
      http
        .post(
          LOGOUT_PATH,
          { refreshToken },
          { skipAuth: true, timeout: LOGOUT_TIMEOUT_MS },
        )
        .catch(() => undefined);
    }
  };
}
