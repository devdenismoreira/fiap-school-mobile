import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import type { Guardian } from '@/domain/entities/Guardian';
import { makeGuardian, makeStudent } from '@/test-utils/fixtures';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import { AppHeader } from './AppHeader';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

async function renderHeader(
  guardian: Guardian = makeGuardian(),
  selectedStudentRm: number | null = 100,
) {
  const dependencies = makeSessionDependencies({
    restoreSession: jest.fn().mockResolvedValue({ guardian, selectedStudentRm }),
  });
  await renderWithSession(<AppHeader />, dependencies);
  await screen.findByText(/^Olá, /);
  return dependencies;
}

describe('AppHeader', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('mostra a saudação e o aluno selecionado em caixa alta, como no Figma', async () => {
    await renderHeader();

    expect(screen.getByText('Olá, ANA')).toBeOnTheScreen();
    expect(screen.getByText('RUI')).toBeOnTheScreen();
    expect(screen.getByText('7EF - RM 100 - Matutino')).toBeOnTheScreen();
  });

  it('com 2+ alunos mostra TROCAR PERFIL, que abre a seleção de aluno', async () => {
    await renderHeader();

    await fireEvent.press(screen.getByRole('button', { name: 'TROCAR PERFIL' }));

    expect(mockNavigate).toHaveBeenCalledWith('StudentSelection');
    expect(screen.getByRole('button', { name: 'SAIR' })).toBeOnTheScreen();
  });

  it('com 1 aluno mostra só SAIR (variante 17:14 do Figma)', async () => {
    await renderHeader(makeGuardian({ students: [makeStudent({ rm: 100 })] }));

    expect(screen.queryByRole('button', { name: 'TROCAR PERFIL' })).toBeNull();
    expect(screen.getByRole('button', { name: 'SAIR' })).toBeOnTheScreen();
  });

  it('sem alunos mostra só a saudação', async () => {
    await renderHeader(makeGuardian({ students: [] }), null);

    expect(screen.getByText('Olá, ANA')).toBeOnTheScreen();
    expect(screen.queryByText(/RM/)).toBeNull();
  });

  it('SAIR encerra a sessão', async () => {
    const dependencies = await renderHeader();

    await fireEvent.press(screen.getByRole('button', { name: 'SAIR' }));

    expect(dependencies.sessionRepository.clear).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByText(/^Olá, /)).toBeNull());
  });
});
