import Animated from 'react-native-reanimated';

import { Box } from '@/core/theme';
import { fadeInNormal, listItemEntering } from '@/shared/animations';
import { Dropdown } from '@/shared/components/Dropdown';
import { TabScreenLayout } from '@/shared/components/TabScreenLayout';
import { ClassItem } from './components/ClassItem';
import { NoClassesState } from './components/NoClassesState';
import { useAgendaViewModel } from './useAgendaViewModel';

/** Aba Agenda (Figma 2:24, 2:48, 2:88): seletor de dia e aulas do dia. */
export function AgendaScreen() {
  const viewModel = useAgendaViewModel();
  // As chaves incluem a data: ao trocar de dia, o conteúdo é recriado e anima a entrada.
  const dayKey = viewModel.selectedDate ?? 'sem-agenda';

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
          <Animated.View key={dayKey} entering={fadeInNormal}>
            <NoClassesState />
          </Animated.View>
        ) : (
          <Box marginTop="l" paddingLeft="m" gap="m">
            {viewModel.classes.map((session, index) => (
              // Disciplinas podem se repetir no mesmo dia; o índice mantém a ordem do JSON.
              <Animated.View
                key={`${dayKey}-${index}`}
                entering={listItemEntering(index)}
              >
                <ClassItem session={session} />
              </Animated.View>
            ))}
          </Box>
        )}
      </Box>
    </TabScreenLayout>
  );
}
