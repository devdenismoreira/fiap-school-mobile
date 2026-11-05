import type { AxiosInstance } from 'axios';

import type { SessionDependencies } from '@/app/providers/SessionProvider';
import { getApiUrl } from '@/core/config/apiConfig';
import { createApiClient } from '@/core/http/apiClient';
import { createTokenStore, type TokenStore } from '@/core/storage/tokenStore';
import type { GuardianDataSource } from '@/data/datasources/GuardianDataSource';
import { GuardianLocalDataSource } from '@/data/datasources/local/GuardianLocalDataSource';
import { GuardianRemoteDataSource } from '@/data/datasources/remote/GuardianRemoteDataSource';
import { createEndSession } from '@/data/datasources/remote/remoteSession';
import { AsyncStorageSessionRepository } from '@/data/repositories/AsyncStorageSessionRepository';
import { GuardianRepositoryImpl } from '@/data/repositories/GuardianRepositoryImpl';
import { createAuthenticateGuardian } from '@/domain/usecases/authenticateGuardian';
import { createRestoreSession } from '@/domain/usecases/restoreSession';

function composeSession(
  dataSource: GuardianDataSource,
  endSession: SessionDependencies['endSession'],
): SessionDependencies {
  const guardianRepository = new GuardianRepositoryImpl(dataSource);
  const sessionRepository = new AsyncStorageSessionRepository();

  return {
    sessionRepository,
    authenticateGuardian: createAuthenticateGuardian(guardianRepository),
    restoreSession: createRestoreSession(guardianRepository, sessionRepository),
    endSession,
  };
}

export function createRemoteDependencies(
  http: AxiosInstance,
  tokenStore: TokenStore,
): SessionDependencies {
  return composeSession(
    new GuardianRemoteDataSource(http, tokenStore),
    createEndSession(http, tokenStore),
  );
}

export function createDependencies(): SessionDependencies {
  const tokenStore = createTokenStore();
  const http = createApiClient({ baseURL: getApiUrl(), tokenStore });

  return createRemoteDependencies(http, tokenStore);
}

type LocalOptions = {
  signInLatencyMs?: number;
};

export function createLocalDependencies({
  signInLatencyMs = 0,
}: LocalOptions = {}): SessionDependencies {
  return composeSession(
    new GuardianLocalDataSource({ signInLatencyMs }),
    async () => undefined,
  );
}
