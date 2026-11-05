import { Box } from '@/core/theme';
import { Dropdown } from '@/shared/components/Dropdown';
import { EmptyState } from '@/shared/components/EmptyState';
import { TabScreenLayout } from '@/shared/components/TabScreenLayout';
import { TermAccordion } from './components/TermAccordion';
import { useReportViewModel } from './useReportViewModel';

export function ReportScreen() {
  const viewModel = useReportViewModel();

  return (
    <TabScreenLayout title="BOLETIM">
      <Box paddingHorizontal="m" marginTop="m">
        {viewModel.hasReportCards ? (
          <Dropdown
            testID="report-year-dropdown"
            accessibilityLabel="Ano selecionado"
            contentPadding="sm"
            options={viewModel.years}
            selectedValue={viewModel.selectedYear}
            isOpen={viewModel.isYearDropdownOpen}
            onToggle={viewModel.toggleYearDropdown}
            onClose={viewModel.closeYearDropdown}
            onSelect={viewModel.selectYear}
          />
        ) : null}

        {viewModel.hasReportCards ? null : (
          <EmptyState
            testID="report-empty"
            title="Nenhum boletim encontrado"
            description="Não encontramos boletins para este aluno."
            actionLabel="TENTAR NOVAMENTE"
            onAction={viewModel.reload}
            actionLoading={viewModel.isRefreshing}
          />
        )}

        <Box marginTop="m" gap="m">
          {viewModel.terms.map(term => (
            <TermAccordion
              key={term.number}
              term={term}
              onToggle={() => viewModel.toggleTerm(term.number)}
              onToggleSubject={viewModel.toggleSubject}
            />
          ))}
        </Box>
      </Box>
    </TabScreenLayout>
  );
}
