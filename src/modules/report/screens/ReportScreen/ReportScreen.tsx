import { Box } from '@/core/theme';
import { Dropdown } from '@/shared/components/Dropdown';
import { TabScreenLayout } from '@/shared/components/TabScreenLayout';
import { TermAccordion } from './components/TermAccordion';
import { useReportViewModel } from './useReportViewModel';

/** Aba Boletim (Figma 3:317, 3:1054, 3:389, 3:549): ano, trimestres e disciplinas. */
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
