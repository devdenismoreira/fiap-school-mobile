import { GuardianLocalDataSource } from '@/data/datasources/local/GuardianLocalDataSource';
import { AsyncStorageSessionRepository } from '@/data/repositories/AsyncStorageSessionRepository';
import { GuardianRepositoryImpl } from '@/data/repositories/GuardianRepositoryImpl';
import { createAuthenticateGuardian } from '@/domain/usecases/authenticateGuardian';
import { createRestoreSession } from '@/domain/usecases/restoreSession';
import type { SessionDependencies } from '@/app/providers/SessionProvider';

export const SIGN_IN_LATENCY_MS = 800;

type Options = {
  signInLatencyMs?: number;
};

export function createDependencies({
  signInLatencyMs = SIGN_IN_LATENCY_MS,
}: Options = {}): SessionDependencies {
  const guardianRepository = new GuardianRepositoryImpl(
    new GuardianLocalDataSource({ signInLatencyMs }),
  );
  const sessionRepository = new AsyncStorageSessionRepository();

  return {
    sessionRepository,
    authenticateGuardian: createAuthenticateGuardian(guardianRepository),
    restoreSession: createRestoreSession(guardianRepository, sessionRepository),
  };
}
