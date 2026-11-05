import { ThemeProvider } from '@shopify/restyle';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { SessionProvider, useSession } from '@/app/providers/SessionProvider';
import { ToastProvider } from '@/app/providers/ToastProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '@/core/theme';
import type { ReportCard } from '@/domain/entities/ReportCard';
import { makeGuardian, makeStudent } from '@/test-utils/fixtures';
import { makeSessionDependencies } from '@/test-utils/renderWithSession';
import { useReportViewModel } from './useReportViewModel';

const card = (
  year: string,
  className: string,
  grade: number | null,
): ReportCard => ({
  year,
  className,
  terms: [
    {
      number: 1,
      subjects: [{ name: 'Arte', grade, absences: grade === null ? null : 0 }],
    },
    { number: 2, subjects: [{ name: 'Arte', grade: null, absences: null }] },
  ],
});

async function renderReport(...reportCardsPerStudent: ReportCard[][]) {
  const guardian = makeGuardian({
    students: reportCardsPerStudent.map((reportCards, index) =>
      makeStudent({ rm: (index + 1) * 100, reportCards }),
    ),
  });
  const dependencies = makeSessionDependencies({
    restoreSession: jest
      .fn()
      .mockResolvedValue({ guardian, selectedStudentRm: 100 }),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <ThemeProvider theme={theme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ToastProvider>
          <SessionProvider dependencies={dependencies}>
            {children}
          </SessionProvider>
        </ToastProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
  const hook = await renderHook(
    () => ({ report: useReportViewModel(), session: useSession() }),
    { wrapper },
  );
  await waitFor(() =>
    expect(hook.result.current.session.state.status).toBe('signedIn'),
  );
  return hook;
}

describe('useReportViewModel', () => {
  it('lista os anos na ordem do JSON com "turma - ano" e seleciona o primeiro', async () => {
    const { result } = await renderReport([
      card('2025', '7EF', 9.5),
      card('2024', '6EF', 8),
    ]);

    expect(result.current.report.years).toEqual([
      { value: '2025', label: '7EF - 2025' },
      { value: '2024', label: '6EF - 2024' },
    ]);
    expect(result.current.report.selectedYear).toBe('2025');
    expect(
      result.current.report.terms.map(term => [term.label, term.isExpanded]),
    ).toEqual([
      ['1º TRIMESTRE', false],
      ['2º TRIMESTRE', false],
    ]);
  });

  it('formata nota e faltas sem inventar valores ("-" quando null)', async () => {
    const { result } = await renderReport([card('2025', '7EF', 8)]);

    const [first, second] = result.current.report.terms;
    expect(first.subjects[0]).toMatchObject({
      grade: '8,0',
      absences: '0',
      isEvaluated: true,
    });
    expect(second.subjects[0]).toMatchObject({
      grade: '-',
      absences: '-',
      isEvaluated: false,
    });
  });

  it('permite vários trimestres e disciplinas abertos ao mesmo tempo', async () => {
    const { result } = await renderReport([card('2025', '7EF', 9)]);

    await act(async () => result.current.report.toggleTerm(1));
    await act(async () => result.current.report.toggleTerm(2));
    await act(async () => result.current.report.toggleSubject('1:0'));
    await act(async () => result.current.report.toggleSubject('2:0'));

    expect(result.current.report.terms.every(term => term.isExpanded)).toBe(
      true,
    );
    expect(
      result.current.report.terms.every(term => term.subjects[0].isExpanded),
    ).toBe(true);

    await act(async () => result.current.report.toggleTerm(1));
    expect(result.current.report.terms.map(term => term.isExpanded)).toEqual([
      false,
      true,
    ]);
  });

  it('trocar de ano fecha o dropdown e recolhe tudo', async () => {
    const { result } = await renderReport([
      card('2025', '7EF', 9),
      card('2024', '6EF', 7),
    ]);
    await act(async () => result.current.report.toggleTerm(1));
    await act(async () => result.current.report.toggleYearDropdown());

    await act(async () => result.current.report.selectYear('2024'));

    expect(result.current.report.selectedYear).toBe('2024');
    expect(result.current.report.isYearDropdownOpen).toBe(false);
    expect(result.current.report.terms.some(term => term.isExpanded)).toBe(
      false,
    );
    expect(result.current.report.terms[0].subjects[0].grade).toBe('7,0');
  });

  it('trocar de aluno volta ao primeiro boletim, tudo recolhido', async () => {
    const { result } = await renderReport(
      [card('2025', '7EF', 9), card('2024', '6EF', 7)],
      [card('2025', '2EM', 10), card('2024', '1EM', 6)],
    );
    await act(async () => result.current.report.selectYear('2024'));
    await act(async () => result.current.report.toggleTerm(1));

    await act(() => result.current.session.selectStudent(200));

    expect(result.current.report.selectedYear).toBe('2025');
    expect(result.current.report.years[0].label).toBe('2EM - 2025');
    expect(result.current.report.terms.some(term => term.isExpanded)).toBe(
      false,
    );
  });

  it('sem boletins: sem anos e sem trimestres', async () => {
    const { result } = await renderReport([]);

    expect(result.current.report.hasReportCards).toBe(false);
    expect(result.current.report.terms).toEqual([]);
    expect(result.current.report.selectedYear).toBeNull();
  });
});
