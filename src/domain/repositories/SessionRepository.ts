import type { StoredSession } from '@/domain/entities/Session';

export interface SessionRepository {
  load(): Promise<StoredSession | null>;
  save(session: StoredSession): Promise<void>;
  clear(): Promise<void>;
}
