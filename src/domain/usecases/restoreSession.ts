import type { Guardian } from '@/domain/entities/Guardian';
import type { GuardianRepository } from '@/domain/repositories/GuardianRepository';
import type { SessionRepository } from '@/domain/repositories/SessionRepository';

export type RestoredSession = {
  guardian: Guardian;
  selectedStudentRm: number | null;
};

export type RestoreSession = () => Promise<RestoredSession | null>;

/**
 * Restaura a sessão salva. Sessão ausente, inválida ou de um responsável que
 * não existe mais é descartada; aluno que não pertence mais ao responsável é
 * trocado pelo primeiro aluno. Falhas de gravação no storage não impedem a
 * restauração.
 */
export function createRestoreSession(
  guardians: GuardianRepository,
  sessions: SessionRepository,
): RestoreSession {
  const discard = async () => {
    await sessions.clear().catch(() => undefined);
    return null;
  };

  return async () => {
    const stored = await sessions.load().catch(() => null);
    if (!stored) {
      return discard();
    }

    const guardian = await guardians.findById(stored.guardianId);
    if (!guardian) {
      return discard();
    }

    const stillLinked = guardian.students.some(
      student => student.rm === stored.selectedStudentRm,
    );
    const selectedStudentRm = stillLinked
      ? stored.selectedStudentRm
      : guardian.students[0]?.rm ?? null;

    if (selectedStudentRm !== stored.selectedStudentRm) {
      await sessions
        .save({ guardianId: guardian.id, selectedStudentRm })
        .catch(() => undefined);
    }

    return { guardian, selectedStudentRm };
  };
}
