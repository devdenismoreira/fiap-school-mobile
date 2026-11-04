import { act, renderHook, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '@shopify/restyle';
import type { PropsWithChildren } from 'react';

import { SessionProvider, useSession } from '@/app/providers/SessionProvider';
import { theme } from '@/core/theme';
import type { Guardian } from '@/domain/entities/Guardian';
import type { ScheduleDay } from '@/domain/entities/Schedule';
import { makeGuardian, makeStudent } from '@/test-utils/fixtures';
import { makeSessionDependencies } from '@/test-utils/renderWithSession';
import { useAgendaViewModel } from './useAgendaViewModel';

const day = (date: string, subjects: string[] = []): ScheduleDay => ({
  date,
  classes: subjects.map((subject, index) => ({
    time: `0${7 + index}:00 - 0${7 + index}:45`,
    subject,
  })),
});

async function renderAgenda(guardian: Guardian, selectedStudentRm = 100) {
  const dependencies = makeSessionDependencies({
    restoreSession: jest.fn().mockResolvedValue({ guardian, selectedStudentRm }),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ThemeProvider theme={theme}>
      <SessionProvider dependencies={dependencies}>{children}</SessionProvider>
    </ThemeProvider>
  );
  const hook = await renderHook(
    () => ({ agenda: useAgendaViewModel(), session: useSession() }),
    { wrapper },
  );
  await waitFor(() =>
    expect(hook.result.current.session.state.status).toBe('signedIn'),
  );
  return hook;
}

const guardianWith = (...schedules: ScheduleDay[][]) =>
  makeGuardian({
    students: schedules.map((schedule, index) =>
      makeStudent({ rm: (index + 1) * 100, schedule }),
    ),
  });

describe('useAgendaViewModel', () => {
  it('começa no primeiro dia da agenda (D-02) e lista os dias na ordem do JSON', async () => {
    const { result } = await renderAgenda(
      guardianWith([day('2025-03-16'), day('2025-03-17', ['Arte'])]),
    );

    expect(result.current.agenda.selectedDate).toBe('2025-03-16');
    expect(result.current.agenda.isEmptyDay).toBe(true);
    expect(result.current.agenda.days).toEqual([
      { value: '2025-03-16', label: '16 de março, domingo' },
      { value: '2025-03-17', label: '17 de março, segunda-feira' },
    ]);
  });

  it('selecionar um dia mostra as aulas dele e fecha o dropdown', async () => {
    const { result } = await renderAgenda(
      guardianWith([day('2025-03-16'), day('2025-03-17', ['Arte', 'Arte'])]),
    );

    await act(async () => result.current.agenda.toggleDropdown());
    expect(result.current.agenda.isDropdownOpen).toBe(true);

    await act(async () => result.current.agenda.selectDate('2025-03-17'));

    expect(result.current.agenda.isDropdownOpen).toBe(false);
    expect(result.current.agenda.isEmptyDay).toBe(false);
    expect(result.current.agenda.classes.map(c => c.subject)).toEqual([
      'Arte',
      'Arte',
    ]);
  });

  it('agenda vazia: sem dias e com estado vazio', async () => {
    const { result } = await renderAgenda(guardianWith([]));

    expect(result.current.agenda.hasSchedule).toBe(false);
    expect(result.current.agenda.isEmptyDay).toBe(true);
    expect(result.current.agenda.selectedDate).toBeNull();
  });

  it('troca de aluno mantém a data quando ela existe no novo aluno', async () => {
    const { result } = await renderAgenda(
      guardianWith(
        [day('2025-03-16'), day('2025-03-17', ['Arte'])],
        [day('2025-03-16'), day('2025-03-17', ['Coding'])],
      ),
    );
    await act(async () => result.current.agenda.selectDate('2025-03-17'));

    await act(() => result.current.session.selectStudent(200));

    expect(result.current.agenda.selectedDate).toBe('2025-03-17');
    expect(result.current.agenda.classes[0].subject).toBe('Coding');
  });

  it('troca de aluno volta ao primeiro dia quando a data não existe no novo aluno', async () => {
    const { result } = await renderAgenda(
      guardianWith(
        [day('2025-03-16'), day('2025-03-17', ['Arte'])],
        [day('2025-04-01', ['História'])],
      ),
    );
    await act(async () => result.current.agenda.selectDate('2025-03-17'));

    await act(() => result.current.session.selectStudent(200));

    expect(result.current.agenda.selectedDate).toBe('2025-04-01');
  });
});
