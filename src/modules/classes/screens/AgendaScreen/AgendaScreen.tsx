import Animated from 'react-native-reanimated';

import { Box } from '@/core/theme';
import { fadeInSmooth, listItemEntering } from '@/shared/animations';
import { Dropdown } from '@/shared/components/Dropdown';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState';
import { TabScreenLayout } from '@/shared/components/TabScreenLayout';
import { ClassItem } from './components/ClassItem';
import { useAgendaViewModel } from './useAgendaViewModel';

export function AgendaScreen() {
  const viewModel = useAgendaViewModel();
  const dayKey = viewModel.selectedDate ?? 'sem-agenda';

  return (
    <TabScreenLayout title="AGENDA">
      {viewModel.status === 'loading' ? <LoadingState /> : null}

      {viewModel.status === 'error' ? (
        <EmptyState
          testID="agenda-error"
          title="Não foi possível carregar a agenda"
          description="Verifique sua conexão e tente novamente."
          actionLabel="TENTAR NOVAMENTE"
          onAction={viewModel.reload}
          actionLoading={viewModel.isReloading}
        />
      ) : null}

      {viewModel.status === 'ready' ? (
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
            <Animated.View key={dayKey} entering={fadeInSmooth}>
              <EmptyState title="Sem aulas neste dia" />
            </Animated.View>
          ) : (
            <Box marginTop="l" paddingLeft="m" gap="m">
              {viewModel.classes.map((session, index) => (
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
      ) : null}
    </TabScreenLayout>
  );
}
