import { makeGuardian } from '@/test-utils/fixtures';
import type { StoredSession } from '@/domain/entities/Session';
import type { GuardianRepository } from '@/domain/repositories/GuardianRepository';
import type { SessionRepository } from '@/domain/repositories/SessionRepository';
import { createRestoreSession } from './restoreSession';

function setup({
  stored = null as StoredSession | null,
  guardian = makeGuardian() as ReturnType<typeof makeGuardian> | null,
} = {}) {
  const guardians: GuardianRepository = {
    findByCredentials: jest.fn(),
    findById: jest.fn().mockResolvedValue(guardian),
  };
  const sessions: SessionRepository = {
    load: jest.fn().mockResolvedValue(stored),
    save: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  };
  return {
    guardians,
    sessions,
    restore: createRestoreSession(guardians, sessions),
  };
}

describe('restoreSession', () => {
  it('retorna null e limpa o storage quando não há sessão válida', async () => {
    const { restore, sessions, guardians } = setup();

    await expect(restore()).resolves.toBeNull();
    expect(sessions.clear).toHaveBeenCalled();
    expect(guardians.findById).not.toHaveBeenCalled();
  });

  it('restaura o responsável e o aluno salvos', async () => {
    const { restore, sessions } = setup({
      stored: { guardianId: 1, selectedStudentRm: 200 },
    });

    await expect(restore()).resolves.toEqual({
      guardian: makeGuardian(),
      selectedStudentRm: 200,
    });
    expect(sessions.save).not.toHaveBeenCalled();
  });

  it('descarta a sessão se o responsável não existe mais', async () => {
    const { restore, sessions } = setup({
      stored: { guardianId: 9, selectedStudentRm: 100 },
      guardian: null,
    });

    await expect(restore()).resolves.toBeNull();
    expect(sessions.clear).toHaveBeenCalled();
  });

  it('troca pelo primeiro aluno quando o salvo não pertence mais ao responsável', async () => {
    const { restore, sessions } = setup({
      stored: { guardianId: 1, selectedStudentRm: 999 },
    });

    await expect(restore()).resolves.toMatchObject({ selectedStudentRm: 100 });
    expect(sessions.save).toHaveBeenCalledWith({
      guardianId: 1,
      selectedStudentRm: 100,
    });
  });

  it('usa null quando o responsável não tem alunos', async () => {
    const { restore } = setup({
      stored: { guardianId: 1, selectedStudentRm: 100 },
      guardian: makeGuardian({ students: [] }),
    });

    await expect(restore()).resolves.toMatchObject({ selectedStudentRm: null });
  });

  it('trata falha de leitura do storage como sessão ausente', async () => {
    const { restore, sessions } = setup();
    (sessions.load as jest.Mock).mockRejectedValue(new Error('falha'));

    await expect(restore()).resolves.toBeNull();
  });

  it('não falha se a regravação no storage falhar', async () => {
    const { restore, sessions } = setup({
      stored: { guardianId: 1, selectedStudentRm: 999 },
    });
    (sessions.save as jest.Mock).mockRejectedValue(new Error('falha'));

    await expect(restore()).resolves.toMatchObject({ selectedStudentRm: 100 });
  });
});
