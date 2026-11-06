import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import type { Guardian } from '@/domain/entities/Guardian';
import { makeGuardian, makeStudent } from '@/test-utils/fixtures';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import { AppActionBar } from './AppActionBar';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

async function renderActionBar(guardian: Guardian = makeGuardian()) {
  const dependencies = makeSessionDependencies({
    restoreSession: jest.fn().mockResolvedValue({
      guardian,
      selectedStudentRm: guardian.students[0]?.rm ?? null,
    }),
  });
  await renderWithSession(<AppActionBar />, dependencies);
  await screen.findByRole('button', { name: 'SAIR' });
  return dependencies;
}

describe('AppActionBar', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('mostra o logo e as ações em uma linha só', async () => {
    await renderActionBar();

    expect(
      screen.getByRole('image', { name: 'FIAP School' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('TROCAR PERFIL')).toHaveProp('numberOfLines', 1);
    expect(screen.getByText('SAIR')).toHaveProp('numberOfLines', 1);
  });

  it('com 2+ alunos mostra TROCAR PERFIL, que abre a seleção de aluno', async () => {
    await renderActionBar();

    await fireEvent.press(
      screen.getByRole('button', { name: 'TROCAR PERFIL' }),
    );

    expect(mockNavigate).toHaveBeenCalledWith('StudentSelection');
  });

  it('com 1 aluno mostra só SAIR (variante 17:14 do Figma)', async () => {
    await renderActionBar(
      makeGuardian({ students: [makeStudent({ rm: 100 })] }),
    );

    expect(screen.queryByRole('button', { name: 'TROCAR PERFIL' })).toBeNull();
    expect(screen.getByRole('button', { name: 'SAIR' })).toBeOnTheScreen();
  });

  it('SAIR encerra a sessão', async () => {
    const dependencies = await renderActionBar();

    await fireEvent.press(screen.getByRole('button', { name: 'SAIR' }));

    expect(dependencies.sessionRepository.clear).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'SAIR' })).toBeNull(),
    );
  });
});
