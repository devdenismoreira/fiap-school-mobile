import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { InvalidCredentialsError } from '@/core/errors/InvalidCredentialsError';
import { NetworkError } from '@/core/errors/NetworkError';
import { SessionExpiredError } from '@/core/errors/SessionExpiredError';
import { TooManyAttemptsError } from '@/core/errors/TooManyAttemptsError';
import type { StoredSession } from '@/domain/entities/Session';
import type { RestoredSession } from '@/domain/usecases/restoreSession';
import { makeGuardian } from '@/test-utils/fixtures';
import {
  SessionProvider,
  useSession,
  type SessionDependencies,
} from './SessionProvider';

function makeDependencies(restored: RestoredSession | null = null) {
  const dependencies = {
    authenticateGuardian: jest.fn().mockResolvedValue(makeGuardian()),
    restoreSession: jest.fn().mockResolvedValue(restored),
    sessionRepository: {
      load: jest
        .fn<Promise<StoredSession | null>, []>()
        .mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    },
    loadStudentRecords: jest
      .fn()
      .mockResolvedValue({ schedule: [], reportCards: [] }),
    endSession: jest.fn().mockResolvedValue(undefined),
  } satisfies SessionDependencies;
  return dependencies;
}

async function renderSession(dependencies: SessionDependencies) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <SessionProvider dependencies={dependencies}>{children}</SessionProvider>
  );
  return renderHook(() => useSession(), { wrapper });
}

describe('SessionProvider', () => {
  it('começa restaurando e vai para signedOut sem sessão salva', async () => {
    const { result } = await renderSession(makeDependencies(null));

    await waitFor(() => expect(result.current.state.status).toBe('signedOut'));
    expect(result.current.selectedStudent).toBeNull();
  });

  it('restaura a sessão salva com o aluno selecionado', async () => {
    const guardian = makeGuardian();
    const { result } = await renderSession(
      makeDependencies({ guardian, selectedStudentRm: 200 }),
    );

    await waitFor(() => expect(result.current.state.status).toBe('signedIn'));
    expect(result.current.selectedStudent?.rm).toBe(200);
  });

  it('vai para signedOut se a restauração falhar', async () => {
    const dependencies = makeDependencies();
    dependencies.restoreSession.mockRejectedValue(new Error('falha'));
    const { result } = await renderSession(dependencies);

    await waitFor(() => expect(result.current.state.status).toBe('signedOut'));
  });

  it('sessão salva recusada pela API: signedOut com sessionExpired', async () => {
    const dependencies = makeDependencies(null);
    dependencies.sessionRepository.load.mockResolvedValue({
      guardianId: 1,
      selectedStudentRm: 100,
    });
    const { result } = await renderSession(dependencies);

    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: 'signedOut',
        sessionExpired: true,
      }),
    );
  });

  it('sem sessão salva: signedOut sem sessionExpired', async () => {
    const { result } = await renderSession(makeDependencies(null));

    await waitFor(() =>
      expect(result.current.state).toEqual({
        status: 'signedOut',
        sessionExpired: false,
      }),
    );
  });

  it('sem sessão para restaurar, encerra a sessão remota (refresh antigo no Keychain)', async () => {
    const dependencies = makeDependencies(null);
    const { result } = await renderSession(dependencies);

    await waitFor(() => expect(result.current.state.status).toBe('signedOut'));
    expect(dependencies.endSession).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['sem conexão', new NetworkError()],
    ['muitas tentativas', new TooManyAttemptsError()],
  ])(
    '%s na restauração vai para unreachable, sem apagar a sessão',
    async (_label, error) => {
      const dependencies = makeDependencies();
      dependencies.restoreSession.mockRejectedValue(error);
      const { result } = await renderSession(dependencies);

      await waitFor(() =>
        expect(result.current.state.status).toBe('unreachable'),
      );
      expect(dependencies.endSession).not.toHaveBeenCalled();
      expect(dependencies.sessionRepository.clear).not.toHaveBeenCalled();
    },
  );

  it('retryRestore tenta de novo e entra quando a conexão volta', async () => {
    const guardian = makeGuardian();
    const dependencies = makeDependencies();
    dependencies.restoreSession
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValueOnce({ guardian, selectedStudentRm: 100 });
    const { result } = await renderSession(dependencies);
    await waitFor(() =>
      expect(result.current.state.status).toBe('unreachable'),
    );

    await act(async () => result.current.retryRestore());

    await waitFor(() => expect(result.current.state.status).toBe('signedIn'));
    expect(dependencies.restoreSession).toHaveBeenCalledTimes(2);
  });

  it('signIn entra com o primeiro aluno e persiste só os identificadores', async () => {
    const dependencies = makeDependencies();
    const { result } = await renderSession(dependencies);
    await waitFor(() => expect(result.current.state.status).toBe('signedOut'));

    await act(() => result.current.signIn('529.982.247-25', 'segredo'));

    expect(dependencies.authenticateGuardian).toHaveBeenCalledWith(
      '529.982.247-25',
      'segredo',
    );
    expect(result.current.state.status).toBe('signedIn');
    expect(result.current.selectedStudent?.rm).toBe(100);
    expect(dependencies.sessionRepository.save).toHaveBeenCalledWith({
      guardianId: 1,
      selectedStudentRm: 100,
    });
  });

  it('signIn propaga o erro de credenciais e não persiste nada', async () => {
    const dependencies = makeDependencies();
    dependencies.authenticateGuardian.mockRejectedValue(
      new InvalidCredentialsError(),
    );
    const { result } = await renderSession(dependencies);
    await waitFor(() => expect(result.current.state.status).toBe('signedOut'));

    await act(async () => {
      await expect(
        result.current.signIn('52998224725', 'errada'),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    expect(result.current.state.status).toBe('signedOut');
    expect(dependencies.sessionRepository.save).not.toHaveBeenCalled();
  });

  it('mantém a sessão em memória se a gravação falhar', async () => {
    const dependencies = makeDependencies();
    dependencies.sessionRepository.save.mockRejectedValue(new Error('falha'));
    const { result } = await renderSession(dependencies);
    await waitFor(() => expect(result.current.state.status).toBe('signedOut'));

    await act(() => result.current.signIn('52998224725', 'segredo'));

    expect(result.current.state.status).toBe('signedIn');
  });

  it('selectStudent troca e persiste o aluno; RM de outro responsável é ignorado', async () => {
    const dependencies = makeDependencies({
      guardian: makeGuardian(),
      selectedStudentRm: 100,
    });
    const { result } = await renderSession(dependencies);
    await waitFor(() => expect(result.current.state.status).toBe('signedIn'));

    await act(() => result.current.selectStudent(200));
    expect(result.current.selectedStudent?.rm).toBe(200);
    expect(dependencies.sessionRepository.save).toHaveBeenLastCalledWith({
      guardianId: 1,
      selectedStudentRm: 200,
    });

    await act(() => result.current.selectStudent(999));
    expect(result.current.selectedStudent?.rm).toBe(200);
    expect(dependencies.sessionRepository.save).toHaveBeenCalledTimes(1);
  });

  it('signOut limpa o storage e volta para signedOut', async () => {
    const dependencies = makeDependencies({
      guardian: makeGuardian(),
      selectedStudentRm: 100,
    });
    const { result } = await renderSession(dependencies);
    await waitFor(() => expect(result.current.state.status).toBe('signedIn'));

    await act(() => result.current.signOut());

    expect(dependencies.endSession).toHaveBeenCalledTimes(1);
    expect(dependencies.sessionRepository.clear).toHaveBeenCalled();
    expect(result.current.state.status).toBe('signedOut');
    expect(result.current.selectedStudent).toBeNull();
  });

  it('signOut sai mesmo se o encerramento remoto falhar', async () => {
    const dependencies = makeDependencies({
      guardian: makeGuardian(),
      selectedStudentRm: 100,
    });
    dependencies.endSession.mockRejectedValue(new NetworkError());
    const { result } = await renderSession(dependencies);
    await waitFor(() => expect(result.current.state.status).toBe('signedIn'));

    await act(() => result.current.signOut());

    expect(dependencies.sessionRepository.clear).toHaveBeenCalled();
    expect(result.current.state.status).toBe('signedOut');
  });

  describe('dados do aluno (agenda e boletins pelas rotas de alunos)', () => {
    const recordsOf = (label: string) => ({
      schedule: [{ date: `2025-03-17-${label}`, classes: [] }],
      reportCards: [{ year: '2025', className: label, terms: [] }],
    });

    it('ao restaurar, carrega só o aluno selecionado e o expõe em selectedStudent', async () => {
      const dependencies = makeDependencies({
        guardian: makeGuardian(),
        selectedStudentRm: 200,
      });
      dependencies.loadStudentRecords.mockResolvedValue(recordsOf('bia'));
      const { result } = await renderSession(dependencies);

      await waitFor(() => expect(result.current.recordsStatus).toBe('ready'));

      expect(dependencies.loadStudentRecords).toHaveBeenCalledTimes(1);
      expect(dependencies.loadStudentRecords).toHaveBeenCalledWith(200);
      expect(result.current.selectedStudent?.schedule).toEqual(
        recordsOf('bia').schedule,
      );
      expect(result.current.selectedStudent?.reportCards).toEqual(
        recordsOf('bia').reportCards,
      );
    });

    it('ao trocar de aluno, busca os dados do novo aluno e não reaproveita os do anterior', async () => {
      const dependencies = makeDependencies({
        guardian: makeGuardian(),
        selectedStudentRm: 100,
      });
      let finishSecond: () => void = () => undefined;
      dependencies.loadStudentRecords.mockImplementation(
        (rm: number) =>
          new Promise(resolve => {
            if (rm === 100) {
              resolve(recordsOf('100'));
              return;
            }
            finishSecond = () => resolve(recordsOf('200'));
          }),
      );
      const { result } = await renderSession(dependencies);
      await waitFor(() => expect(result.current.recordsStatus).toBe('ready'));

      await act(() => result.current.selectStudent(200));

      expect(result.current.recordsStatus).toBe('loading');
      expect(result.current.selectedStudent?.schedule).toEqual([]);
      await act(async () => finishSecond());
      await waitFor(() => expect(result.current.recordsStatus).toBe('ready'));
      expect(dependencies.loadStudentRecords).toHaveBeenLastCalledWith(200);
      expect(result.current.selectedStudent?.reportCards[0].className).toBe(
        '200',
      );
    });

    it('falha ao carregar: status error; reloadRecords tenta de novo e recupera', async () => {
      const dependencies = makeDependencies({
        guardian: makeGuardian(),
        selectedStudentRm: 100,
      });
      dependencies.loadStudentRecords
        .mockRejectedValueOnce(new NetworkError())
        .mockResolvedValueOnce(recordsOf('rui'));
      const { result } = await renderSession(dependencies);
      await waitFor(() => expect(result.current.recordsStatus).toBe('error'));

      await act(() => result.current.reloadRecords());

      expect(result.current.recordsStatus).toBe('ready');
      expect(result.current.selectedStudent?.schedule).toEqual(
        recordsOf('rui').schedule,
      );
    });

    it('reloadRecords que falha mantém os dados já carregados e rejeita', async () => {
      const dependencies = makeDependencies({
        guardian: makeGuardian(),
        selectedStudentRm: 100,
      });
      dependencies.loadStudentRecords
        .mockResolvedValueOnce(recordsOf('rui'))
        .mockRejectedValueOnce(new NetworkError());
      const { result } = await renderSession(dependencies);
      await waitFor(() => expect(result.current.recordsStatus).toBe('ready'));

      await act(async () => {
        await expect(result.current.reloadRecords()).rejects.toBeInstanceOf(
          NetworkError,
        );
      });

      expect(result.current.recordsStatus).toBe('ready');
      expect(result.current.selectedStudent?.schedule).toEqual(
        recordsOf('rui').schedule,
      );
    });

    it('sessão recusada ao carregar os dados leva ao Login com o aviso de sessão expirada', async () => {
      const dependencies = makeDependencies({
        guardian: makeGuardian(),
        selectedStudentRm: 100,
      });
      dependencies.loadStudentRecords.mockRejectedValue(
        new SessionExpiredError(),
      );
      const { result } = await renderSession(dependencies);

      await waitFor(() =>
        expect(result.current.state).toEqual({
          status: 'signedOut',
          sessionExpired: true,
        }),
      );
      expect(dependencies.endSession).toHaveBeenCalled();
    });

    it('responsável sem alunos não carrega nada', async () => {
      const dependencies = makeDependencies({
        guardian: makeGuardian({ students: [] }),
        selectedStudentRm: null,
      });
      const { result } = await renderSession(dependencies);
      await waitFor(() => expect(result.current.state.status).toBe('signedIn'));

      expect(result.current.recordsStatus).toBe('idle');
      expect(dependencies.loadStudentRecords).not.toHaveBeenCalled();
    });
  });

  it('useSession fora do provider lança erro explícito', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(renderHook(() => useSession())).rejects.toThrow(
      'useSession deve ser usado dentro de SessionProvider',
    );
  });
});
