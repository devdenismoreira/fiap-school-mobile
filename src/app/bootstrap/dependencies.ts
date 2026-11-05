import type { AxiosInstance } from 'axios';

import type { SessionDependencies } from '@/app/providers/SessionProvider';
import { getApiUrl } from '@/core/config/apiConfig';
import { createApiClient } from '@/core/http/apiClient';
import { createTokenStore, type TokenStore } from '@/core/storage/tokenStore';
import { GuardianRemoteDataSource } from '@/data/datasources/remote/GuardianRemoteDataSource';
import { createEndSession } from '@/data/datasources/remote/remoteSession';
import { AsyncStorageSessionRepository } from '@/data/repositories/AsyncStorageSessionRepository';
import { GuardianRepositoryImpl } from '@/data/repositories/GuardianRepositoryImpl';
import { createAuthenticateGuardian } from '@/domain/usecases/authenticateGuardian';
import { createRestoreSession } from '@/domain/usecases/restoreSession';

export function createRemoteDependencies(
  http: AxiosInstance,
  tokenStore: TokenStore,
): SessionDependencies {
  const guardianRepository = new GuardianRepositoryImpl(
    new GuardianRemoteDataSource(http, tokenStore),
  );
  const sessionRepository = new AsyncStorageSessionRepository();

  return {
    sessionRepository,
    authenticateGuardian: createAuthenticateGuardian(guardianRepository),
    restoreSession: createRestoreSession(guardianRepository, sessionRepository),
    endSession: createEndSession(http, tokenStore),
  };
}

export function createDependencies(): SessionDependencies {
  const tokenStore = createTokenStore();
  const http = createApiClient({ baseURL: getApiUrl(), tokenStore });

  return createRemoteDependencies(http, tokenStore);
}
