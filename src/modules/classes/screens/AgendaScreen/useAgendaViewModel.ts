import { useState } from 'react';

import { useSession } from '@/app/providers/SessionProvider';
import { formatDayLabel } from '@/core/utils/formatDayLabel';
import type { DropdownOption } from '@/shared/components/Dropdown';

export function useAgendaViewModel() {
  const { selectedStudent } = useSession();
  const schedule = selectedStudent?.schedule ?? [];

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
