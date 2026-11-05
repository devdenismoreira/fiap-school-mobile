import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import type { Guardian } from '@/domain/entities/Guardian';
import type { StoredSession } from '@/domain/entities/Session';
import type { Student } from '@/domain/entities/Student';
import type { SessionRepository } from '@/domain/repositories/SessionRepository';
import type { AuthenticateGuardian } from '@/domain/usecases/authenticateGuardian';
import type { RestoreSession } from '@/domain/usecases/restoreSession';

export type SessionState =
  | { status: 'restoring' }
  | { status: 'signedOut' }
  | {
      status: 'signedIn';
      guardian: Guardian;
      selectedStudentRm: number | null;
    };

export type SessionDependencies = {
  authenticateGuardian: AuthenticateGuardian;
  restoreSession: RestoreSession;
  sessionRepository: SessionRepository;
};

export type SessionContextValue = {
  state: SessionState;
  selectedStudent: Student | null;
  signIn(cpf: string, password: string): Promise<void>;
  selectStudent(rm: number): Promise<void>;
  signOut(): Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = PropsWithChildren<{
  dependencies: SessionDependencies;
}>;

export function SessionProvider({
  dependencies,
  children,
}: SessionProviderProps) {
  const { authenticateGuardian, restoreSession, sessionRepository } =
    dependencies;
  const [state, setState] = useState<SessionState>({ status: 'restoring' });

  useEffect(() => {
    let active = true;
    restoreSession()
      .then(restored => {
        if (active) {
          setState(
            restored
              ? { status: 'signedIn', ...restored }
              : { status: 'signedOut' },
          );
        }
      })
      .catch(() => {
        if (active) {
          setState({ status: 'signedOut' });
        }
      });
    return () => {
      active = false;
    };
  }, [restoreSession]);

  const persist = (session: StoredSession) =>
    sessionRepository.save(session).catch(() => undefined);

  const signIn = async (cpf: string, password: string) => {
    const guardian = await authenticateGuardian(cpf, password);
    const selectedStudentRm = guardian.students[0]?.rm ?? null;
    setState({ status: 'signedIn', guardian, selectedStudentRm });
    await persist({ guardianId: guardian.id, selectedStudentRm });
  };

  const selectStudent = async (rm: number) => {
    if (
      state.status !== 'signedIn' ||
      !state.guardian.students.some(student => student.rm === rm)
    ) {
      return;
    }
    setState({ ...state, selectedStudentRm: rm });
    await persist({ guardianId: state.guardian.id, selectedStudentRm: rm });
  };

  const signOut = async () => {
    await sessionRepository.clear().catch(() => undefined);
    setState({ status: 'signedOut' });
  };

  const selectedStudent =
    state.status === 'signedIn'
      ? state.guardian.students.find(
          student => student.rm === state.selectedStudentRm,
        ) ?? null
      : null;

  return (
    <SessionContext.Provider
      value={{ state, selectedStudent, signIn, selectStudent, signOut }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession deve ser usado dentro de SessionProvider');
  }
  return context;
}
