import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import { NetworkError } from '@/core/errors/NetworkError';
import { SessionExpiredError } from '@/core/errors/SessionExpiredError';
import { TooManyAttemptsError } from '@/core/errors/TooManyAttemptsError';
import type { Guardian } from '@/domain/entities/Guardian';
import type { StoredSession } from '@/domain/entities/Session';
import type { Student } from '@/domain/entities/Student';
import type { SessionRepository } from '@/domain/repositories/SessionRepository';
import type { AuthenticateGuardian } from '@/domain/usecases/authenticateGuardian';
import type {
  LoadStudentRecords,
  StudentRecords,
} from '@/domain/usecases/loadStudentRecords';
import type { RestoreSession } from '@/domain/usecases/restoreSession';

export type SessionState =
  | { status: 'restoring' }
  | { status: 'unreachable' }
  | { status: 'signedOut'; sessionExpired?: boolean }
  | {
      status: 'signedIn';
      guardian: Guardian;
      selectedStudentRm: number | null;
    };

export type SessionDependencies = {
  authenticateGuardian: AuthenticateGuardian;
  restoreSession: RestoreSession;
  sessionRepository: SessionRepository;
  loadStudentRecords: LoadStudentRecords;
  endSession: () => Promise<void>;
};

export type RecordsStatus = 'idle' | 'loading' | 'ready' | 'error';

type LoadedRecords = StudentRecords & { rm: number };

export type SessionContextValue = {
  state: SessionState;
  selectedStudent: Student | null;
  signIn(cpf: string, password: string): Promise<void>;
  selectStudent(rm: number): Promise<void>;
  signOut(): Promise<void>;
  recordsStatus: RecordsStatus;
  reloadRecords(): Promise<void>;
  retryRestore(): void;
};

const isConnectionFailure = (error: unknown) =>
  error instanceof NetworkError || error instanceof TooManyAttemptsError;

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = PropsWithChildren<{
  dependencies: SessionDependencies;
}>;

export function SessionProvider({
  dependencies,
  children,
}: SessionProviderProps) {
  const {
    authenticateGuardian,
    restoreSession,
    sessionRepository,
    loadStudentRecords,
    endSession,
  } = dependencies;
  const [state, setState] = useState<SessionState>({ status: 'restoring' });
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [records, setRecords] = useState<LoadedRecords | null>(null);
  const [recordsStatus, setRecordsStatus] = useState<RecordsStatus>('idle');
  const signedInGuardianId =
    state.status === 'signedIn' ? state.guardian.id : null;
  const selectedRm =
    state.status === 'signedIn' ? state.selectedStudentRm : null;

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const stored = await sessionRepository.load().catch(() => null);
      const restored = await restoreSession();
      return { restored, hadSession: Boolean(stored) };
    };
    restore()
      .then(({ restored, hadSession }) => {
        if (!active) {
          return;
        }
        if (restored) {
          setState({ status: 'signedIn', ...restored });
          return;
        }
        setState({ status: 'signedOut', sessionExpired: hadSession });
        endSession().catch(() => undefined);
      })
      .catch((error: unknown) => {
        if (active) {
          setState(
            isConnectionFailure(error)
              ? { status: 'unreachable' }
              : { status: 'signedOut' },
          );
        }
      });
    return () => {
      active = false;
    };
  }, [restoreSession, sessionRepository, endSession, restoreAttempt]);

  const retryRestore = () => {
    setState({ status: 'restoring' });
    setRestoreAttempt(attempt => attempt + 1);
  };

  const expireSession = useCallback(() => {
    setState({ status: 'signedOut', sessionExpired: true });
    endSession().catch(() => undefined);
  }, [endSession]);

  useEffect(() => {
    if (signedInGuardianId === null || selectedRm === null) {
      setRecords(null);
      setRecordsStatus('idle');
      return;
    }
    let active = true;
    setRecords(null);
    setRecordsStatus('loading');
    loadStudentRecords(selectedRm)
      .then(loaded => {
        if (active) {
          setRecords({ rm: selectedRm, ...loaded });
          setRecordsStatus('ready');
        }
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        if (error instanceof SessionExpiredError) {
          expireSession();
          return;
        }
        setRecordsStatus('error');
      });
    return () => {
      active = false;
    };
  }, [signedInGuardianId, selectedRm, loadStudentRecords, expireSession]);

  const reloadRecords = async () => {
    if (selectedRm === null) {
      return;
    }
    try {
      const loaded = await loadStudentRecords(selectedRm);
      setRecords({ rm: selectedRm, ...loaded });
      setRecordsStatus('ready');
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        expireSession();
        return;
      }
      throw error;
    }
  };

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
    await endSession().catch(() => undefined);
    await sessionRepository.clear().catch(() => undefined);
    setState({ status: 'signedOut' });
  };

  const baseStudent =
    state.status === 'signedIn'
      ? state.guardian.students.find(
          student => student.rm === state.selectedStudentRm,
        ) ?? null
      : null;
  const selectedStudent: Student | null = baseStudent
    ? {
        ...baseStudent,
        schedule: records?.rm === baseStudent.rm ? records.schedule : [],
        reportCards: records?.rm === baseStudent.rm ? records.reportCards : [],
      }
    : null;

  return (
    <SessionContext.Provider
      value={{
        state,
        selectedStudent,
        signIn,
        selectStudent,
        signOut,
        recordsStatus,
        reloadRecords,
        retryRestore,
      }}
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
