import { useState } from 'react';

import { useSession } from '@/app/providers/SessionProvider';
import { formatDayLabel } from '@/core/utils/formatDayLabel';
import type { DropdownOption } from '@/shared/components/Dropdown';

export function useAgendaViewModel() {
  const { selectedStudent } = useSession();
  const schedule = selectedStudent?.schedule ?? [];

  // Data escolhida pelo usuário. O dia exibido é derivado dela: se o aluno
  // atual não tiver essa data (ou nada foi escolhido), vale o primeiro dia
  // da agenda, como no Figma (D-02). Assim a troca de aluno mantém a data
  // quando ela existe, sem efeitos colaterais.
  const [preferredDate, setPreferredDate] = useState<string | null>(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const selectedDay =
    schedule.find(day => day.date === preferredDate) ?? schedule[0] ?? null;

  const days: DropdownOption[] = schedule.map(day => ({
    value: day.date,
    label: formatDayLabel(day.date),
  }));

  return {
    hasSchedule: schedule.length > 0,
    days,
    selectedDate: selectedDay?.date ?? null,
    classes: selectedDay?.classes ?? [],
    isEmptyDay: !selectedDay || selectedDay.classes.length === 0,
    isDropdownOpen,
    toggleDropdown: () => setDropdownOpen(open => !open),
    closeDropdown: () => setDropdownOpen(false),
    selectDate: (date: string) => {
      setPreferredDate(date);
      setDropdownOpen(false);
    },
  };
}
