import { Box } from '@/core/theme';
import { Dropdown } from '@/shared/components/Dropdown';
import { TabScreenLayout } from '@/shared/components/TabScreenLayout';
import { ClassItem } from './components/ClassItem';
import { NoClassesState } from './components/NoClassesState';
import { useAgendaViewModel } from './useAgendaViewModel';

/** Aba Agenda (Figma 2:24, 2:48, 2:88): seletor de dia e aulas do dia. */
export function AgendaScreen() {
  const viewModel = useAgendaViewModel();

  return (
    <TabScreenLayout title="AGENDA">
      <Box paddingHorizontal="l" marginTop="xl">
        {viewModel.hasSchedule ? (
          <Dropdown
            testID="agenda-day-dropdown"
            accessibilityLabel="Dia selecionado"
            options={viewModel.days}
            selectedValue={viewModel.selectedDate}
            isOpen={viewModel.isDropdownOpen}
            onToggle={viewModel.toggleDropdown}
            onClose={viewModel.closeDropdown}
            onSelect={viewModel.selectDate}
          />
        ) : null}

        {viewModel.isEmptyDay ? (
          <NoClassesState />
        ) : (
          <Box marginTop="l" paddingLeft="m" gap="m">
            {viewModel.classes.map((session, index) => (
              // Disciplinas podem se repetir no mesmo dia; o índice mantém a ordem do JSON.
              <ClassItem key={`${session.time}-${index}`} session={session} />
            ))}
          </Box>
        )}
      </Box>
    </TabScreenLayout>
  );
}
