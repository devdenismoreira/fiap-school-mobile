import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { InvalidCredentialsError } from '../../core/errors/InvalidCredentialsError';
import type { RestoredSession } from '../../domain/usecases/restoreSession';
import { makeGuardian } from '../../test-utils/fixtures';
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
      load: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined),
    },
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

    expect(dependencies.sessionRepository.clear).toHaveBeenCalled();
    expect(result.current.state.status).toBe('signedOut');
    expect(result.current.selectedStudent).toBeNull();
  });

  it('useSession fora do provider lança erro explícito', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(renderHook(() => useSession())).rejects.toThrow(
      'useSession deve ser usado dentro de SessionProvider',
    );
  });
});
