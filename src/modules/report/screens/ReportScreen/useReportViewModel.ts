import { useState } from 'react';

import { useSession } from '@/app/providers/SessionProvider';
import { formatAbsences, formatGrade } from '@/core/utils/formatGrade';
import type { DropdownOption } from '@/shared/components/Dropdown';
import { useRecordsReload } from '@/shared/hooks/useRecordsReload';

type ReportUiState = {
  studentRm: number | null;
  year: string | null;
  expandedTerms: number[];
  expandedSubjects: string[];
};

const initialState = (studentRm: number | null): ReportUiState => ({
  studentRm,
  year: null,
  expandedTerms: [],
  expandedSubjects: [],
});

const toggle = <T>(items: T[], item: T) =>
  items.includes(item)
    ? items.filter(value => value !== item)
    : [...items, item];

export function useReportViewModel() {
  const { selectedStudent, recordsStatus } = useSession();
  const { reload, isReloading } = useRecordsReload();
  const reportCards = selectedStudent?.reportCards ?? [];
  const studentRm = selectedStudent?.rm ?? null;

  const [uiState, setUiState] = useState(() => initialState(studentRm));
  const [isYearDropdownOpen, setYearDropdownOpen] = useState(false);

  const current =
    uiState.studentRm === studentRm ? uiState : initialState(studentRm);
  const update = (change: (state: ReportUiState) => Partial<ReportUiState>) =>
    setUiState(previous => {
      const base =
        previous.studentRm === studentRm ? previous : initialState(studentRm);
      return { ...base, ...change(base) };
    });

  const reportCard =
    reportCards.find(card => card.year === current.year) ??
    reportCards[0] ??
    null;

  const years: DropdownOption[] = reportCards.map(card => ({
    value: card.year,
    label: `${card.className} - ${card.year}`,
  }));

  const terms = (reportCard?.terms ?? []).map(term => ({
    number: term.number,
    label: `${term.number}º TRIMESTRE`,
    isExpanded: current.expandedTerms.includes(term.number),
    subjects: term.subjects.map((subject, index) => {
      const key = `${term.number}:${index}`;
      return {
        key,
        name: subject.name,
        grade: formatGrade(subject.grade),
        absences: formatAbsences(subject.absences),
        isEvaluated: subject.grade !== null || subject.absences !== null,
        isExpanded: current.expandedSubjects.includes(key),
      };
    }),
  }));

  return {
    status: recordsStatus,
    isRefreshing: isReloading,
    reload,
    hasReportCards: reportCards.length > 0,
    years,
    selectedYear: reportCard?.year ?? null,
    terms,
    isYearDropdownOpen,
    toggleYearDropdown: () => setYearDropdownOpen(open => !open),
    closeYearDropdown: () => setYearDropdownOpen(false),
    selectYear: (year: string) => {
      update(() => ({ year, expandedTerms: [], expandedSubjects: [] }));
      setYearDropdownOpen(false);
    },
    toggleTerm: (termNumber: number) =>
      update(state => ({
        expandedTerms: toggle(state.expandedTerms, termNumber),
      })),
    toggleSubject: (key: string) =>
      update(state => ({
        expandedSubjects: toggle(state.expandedSubjects, key),
      })),
  };
}

export type ReportTerm = ReturnType<typeof useReportViewModel>['terms'][number];
export type ReportSubject = ReportTerm['subjects'][number];
