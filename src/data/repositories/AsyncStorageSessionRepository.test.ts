import AsyncStorage from '@react-native-async-storage/async-storage';

import type { KeyValueStorage } from '@/core/storage/keyValueStorage';
import {
  AsyncStorageSessionRepository,
  SESSION_STORAGE_KEY,
} from './AsyncStorageSessionRepository';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: KeyValueStorage = {
    getItem: async key => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
    removeItem: async key => {
      data.delete(key);
    },
  };
  return { storage, data };
}

const session = { guardianId: 1, selectedStudentRm: 12567 };

describe('AsyncStorageSessionRepository', () => {
  it('salva e recupera a sessão', async () => {
    const { storage } = createMemoryStorage();
    const repository = new AsyncStorageSessionRepository(storage);

    await repository.save(session);

    await expect(repository.load()).resolves.toEqual(session);
  });

  it('persiste apenas versão e identificadores', async () => {
    const { storage, data } = createMemoryStorage();
    const repository = new AsyncStorageSessionRepository(storage);

    await repository.save({
      ...session,
      // Campos extras não devem chegar ao storage, mesmo que venham por engano.
      ...({ cpf: '52998224725', senha: 'x' } as object),
    });

    expect(JSON.parse(data.get(SESSION_STORAGE_KEY)!)).toEqual({
      version: 1,
      guardianId: 1,
      selectedStudentRm: 12567,
    });
  });

  it('aceita sessão sem aluno selecionado (responsável sem alunos)', async () => {
    const { storage } = createMemoryStorage();
    const repository = new AsyncStorageSessionRepository(storage);

    await repository.save({ guardianId: 1, selectedStudentRm: null });

    await expect(repository.load()).resolves.toEqual({
      guardianId: 1,
      selectedStudentRm: null,
    });
  });

  it('retorna null quando não há sessão', async () => {
    const { storage } = createMemoryStorage();
    await expect(
      new AsyncStorageSessionRepository(storage).load(),
    ).resolves.toBeNull();
  });

  it.each([
    ['JSON inválido', '{nao-e-json'],
    ['valor não-objeto', '42'],
    ['null', 'null'],
    [
      'versão desconhecida',
      '{"version":2,"guardianId":1,"selectedStudentRm":12567}',
    ],
    ['sem versão', '{"guardianId":1,"selectedStudentRm":12567}'],
    [
      'id como string',
      '{"version":1,"guardianId":"1","selectedStudentRm":12567}',
    ],
    ['rm decimal', '{"version":1,"guardianId":1,"selectedStudentRm":1.5}'],
    ['id zero', '{"version":1,"guardianId":0,"selectedStudentRm":12567}'],
    ['rm ausente', '{"version":1,"guardianId":1}'],
  ])('retorna null para conteúdo inválido (%s)', async (_, raw) => {
    const { storage } = createMemoryStorage({ [SESSION_STORAGE_KEY]: raw });
    await expect(
      new AsyncStorageSessionRepository(storage).load(),
    ).resolves.toBeNull();
  });

  it('limpa a sessão', async () => {
    const { storage, data } = createMemoryStorage();
    const repository = new AsyncStorageSessionRepository(storage);

    await repository.save(session);
    await repository.clear();

    expect(data.has(SESSION_STORAGE_KEY)).toBe(false);
    await expect(repository.load()).resolves.toBeNull();
  });

  it('usa o AsyncStorage por padrão', async () => {
    const repository = new AsyncStorageSessionRepository();

    await repository.save(session);

    await expect(AsyncStorage.getItem(SESSION_STORAGE_KEY)).resolves.toBe(
      JSON.stringify({ version: 1, ...session }),
    );
    await repository.clear();
  });
});
