import {
  keyValueStorage,
  type KeyValueStorage,
} from '@/core/storage/keyValueStorage';
import type { StoredSession } from '@/domain/entities/Session';
import type { SessionRepository } from '@/domain/repositories/SessionRepository';

export const SESSION_STORAGE_KEY = '@fiap-school/session';
const SESSION_VERSION = 1;

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function parseSession(raw: string): StoredSession | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const { version, guardianId, selectedStudentRm } = value as Record<
    string,
    unknown
  >;
  if (
    version !== SESSION_VERSION ||
    !isPositiveInteger(guardianId) ||
    !(selectedStudentRm === null || isPositiveInteger(selectedStudentRm))
  ) {
    return null;
  }

  return { guardianId, selectedStudentRm };
}

export class AsyncStorageSessionRepository implements SessionRepository {
  constructor(private readonly storage: KeyValueStorage = keyValueStorage) {}

  async load(): Promise<StoredSession | null> {
    const raw = await this.storage.getItem(SESSION_STORAGE_KEY);
    return raw === null ? null : parseSession(raw);
  }

  async save(session: StoredSession): Promise<void> {
    // Campos explícitos: nada além dos identificadores chega ao storage.
    const payload = {
      version: SESSION_VERSION,
      guardianId: session.guardianId,
      selectedStudentRm: session.selectedStudentRm,
    };
    await this.storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  }

  async clear(): Promise<void> {
    await this.storage.removeItem(SESSION_STORAGE_KEY);
  }
}
