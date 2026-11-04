import { GuardianLocalDataSource } from '../../data/datasources/local/GuardianLocalDataSource';
import { AsyncStorageSessionRepository } from '../../data/repositories/AsyncStorageSessionRepository';
import { GuardianRepositoryImpl } from '../../data/repositories/GuardianRepositoryImpl';
import { createAuthenticateGuardian } from '../../domain/usecases/authenticateGuardian';
import { createRestoreSession } from '../../domain/usecases/restoreSession';
import type { SessionDependencies } from '../providers/SessionProvider';

/** Latência simulada do login (decisão D-04), para o estado "carregando" do Figma aparecer. */
export const SIGN_IN_LATENCY_MS = 800;

type Options = {
  signInLatencyMs?: number;
};

/** Composition root: única fábrica que conhece as implementações concretas. */
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
