import { screen } from '@testing-library/react-native';

import type { Guardian } from '@/domain/entities/Guardian';
import { makeGuardian } from '@/test-utils/fixtures';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import { StudentGreeting } from './StudentGreeting';

async function renderGreeting(
  guardian: Guardian = makeGuardian(),
  selectedStudentRm: number | null = 100,
) {
  await renderWithSession(
    <StudentGreeting />,
    makeSessionDependencies({
      restoreSession: jest
        .fn()
        .mockResolvedValue({ guardian, selectedStudentRm }),
    }),
  );
  await screen.findByText(/^Olá, /);
}

describe('StudentGreeting', () => {
  it('mostra a saudação e o aluno selecionado em caixa alta, como no Figma', async () => {
    await renderGreeting();

    expect(screen.getByText('Olá, ANA')).toBeOnTheScreen();
    expect(screen.getByText('RUI')).toBeOnTheScreen();
    expect(screen.getByText('7EF - RM 100 - Matutino')).toBeOnTheScreen();
  });

  it('acompanha o aluno selecionado', async () => {
    await renderGreeting(makeGuardian(), 200);

    expect(screen.getByText('BIA')).toBeOnTheScreen();
    expect(screen.getByText('7EF - RM 200 - Matutino')).toBeOnTheScreen();
  });

  it('sem alunos mostra só a saudação', async () => {
    await renderGreeting(makeGuardian({ students: [] }), null);

    expect(screen.getByText('Olá, ANA')).toBeOnTheScreen();
    expect(screen.queryByText(/RM/)).toBeNull();
  });
});
