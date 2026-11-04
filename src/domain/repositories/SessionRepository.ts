import type { StoredSession } from '@/domain/entities/Session';

export interface SessionRepository {
  /** Retorna `null` se não houver sessão ou se o conteúdo salvo for inválido. */
  load(): Promise<StoredSession | null>;
  save(session: StoredSession): Promise<void>;
  clear(): Promise<void>;
}
