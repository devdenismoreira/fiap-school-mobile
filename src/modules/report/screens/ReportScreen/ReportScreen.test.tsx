import { fireEvent, screen } from '@testing-library/react-native';

import { theme } from '@/core/theme';
import { toGuardianWithRecords } from '@/test-utils/fakeApi';
import responsaveis from '@/test-utils/fixtures/responsaveis.json';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import { ReportScreen } from './ReportScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const firstGuardian = toGuardianWithRecords(responsaveis[0]);
const singleStudentGuardian = toGuardianWithRecords(responsaveis[1]);

async function renderReport(guardian = firstGuardian) {
  await renderWithSession(
    <ReportScreen />,
    makeSessionDependencies({
      restoreSession: jest.fn().mockResolvedValue({
        guardian,
        selectedStudentRm: guardian.students[0].rm,
      }),
    }),
  );
  return screen.findByRole('button', { name: /^Ano selecionado:/ });
}

const term = (label: string) => screen.getByRole('button', { name: label });
const subjectRows = () => screen.getAllByTestId(/^subject-row-/);

describe('ReportScreen', () => {
  it('abre no primeiro boletim do JSON com os 3 trimestres recolhidos', async () => {
    const yearDropdown = await renderReport();

    expect(yearDropdown).toHaveAccessibleName('Ano selecionado: 7EF - 2025');
    for (const label of ['1º trimestre', '2º trimestre', '3º trimestre']) {
      expect(term(label)).toHaveProp('accessibilityState', { expanded: false });
    }
    expect(screen.getByTestId('term-card-1')).toHaveStyle({
      backgroundColor: theme.colors.surfaceRaised,
      height: 90,
      borderRadius: 8,
    });
  });

  it('o seletor de ano lista "7EF - 2025" e "6EF - 2024"', async () => {
    await fireEvent.press(await renderReport());

    expect(
      screen
        .getAllByRole('menuitem')
        .map(item => item.props.accessibilityLabel ?? ''),
    ).toHaveLength(2);
    expect(screen.getByRole('menuitem', { name: '7EF - 2025' })).toBeSelected();
    expect(
      screen.getByRole('menuitem', { name: '6EF - 2024' }),
    ).toBeOnTheScreen();
  });

  it('1º trimestre de 2025 lista 12 disciplinas na ordem do JSON, com notas do Figma', async () => {
    await renderReport();

    await fireEvent.press(term('1º trimestre'));
    const names =
      firstGuardian.students[0].reportCards[0].terms[0].subjects.map(
        s => s.name,
      );
    expect(subjectRows().map(row => row.props.accessibilityLabel)).toEqual(
      names,
    );
    expect(screen.getByText('LÍNGUA PORTUGUESA')).toBeOnTheScreen();

    await fireEvent.press(
      screen.getByRole('button', { name: 'Língua Portuguesa' }),
    );
    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Produção e Interpretação de Textos',
      }),
    );

    expect(screen.getByLabelText('Nota 9,5, faltas 0')).toBeOnTheScreen();
    expect(screen.getByLabelText('Nota 8,0, faltas 1')).toBeOnTheScreen();
  });

  it('2º trimestre de 2025 (não avaliado) mostra "-" em nota e faltas', async () => {
    await renderReport();

    await fireEvent.press(term('2º trimestre'));
    await fireEvent.press(
      screen.getByRole('button', { name: 'Língua Portuguesa' }),
    );

    const details = screen.getByLabelText(
      'Nota não lançada, faltas não lançadas',
    );
    expect(details).toHaveTextContent('Nota:-Faltas:-');
  });

  it('dois trimestres podem ficar abertos ao mesmo tempo', async () => {
    await renderReport();

    await fireEvent.press(term('1º trimestre'));
    await fireEvent.press(term('2º trimestre'));

    expect(term('1º trimestre')).toHaveProp('accessibilityState', {
      expanded: true,
    });
    expect(term('2º trimestre')).toHaveProp('accessibilityState', {
      expanded: true,
    });
    expect(subjectRows()).toHaveLength(24);
  });

  it('selecionar 2024 mostra o ano completo, com tudo recolhido', async () => {
    await fireEvent.press(await renderReport());
    await fireEvent.press(screen.getByRole('menuitem', { name: '6EF - 2024' }));

    expect(
      screen.getByRole('button', { name: /^Ano selecionado:/ }),
    ).toHaveAccessibleName('Ano selecionado: 6EF - 2024');
    expect(term('3º trimestre')).toHaveProp('accessibilityState', {
      expanded: false,
    });

    await fireEvent.press(term('3º trimestre'));
    await fireEvent.press(
      screen.getByRole('button', { name: 'Língua Portuguesa' }),
    );
    expect(screen.getByLabelText('Nota 8,0, faltas 0')).toBeOnTheScreen();
  });

  it('não exibe disciplina ausente do JSON (aluno sem Arte no 1º trimestre)', async () => {
    await renderReport(singleStudentGuardian);

    await fireEvent.press(term('1º trimestre'));
    expect(subjectRows()).toHaveLength(11);
    expect(screen.queryByText('ARTE')).toBeNull();

    await fireEvent.press(term('1º trimestre'));
    await fireEvent.press(term('2º trimestre'));
    expect(subjectRows()).toHaveLength(12);
    expect(screen.getByText('ARTE')).toBeOnTheScreen();
  });

  it('sem boletins: mostra o estado vazio e TENTAR NOVAMENTE busca os dados de novo', async () => {
    const loadStudentRecords = jest
      .fn()
      .mockResolvedValueOnce({ schedule: [], reportCards: [] })
      .mockResolvedValueOnce({
        schedule: [],
        reportCards: firstGuardian.students[0].reportCards,
      });
    await renderWithSession(
      <ReportScreen />,
      makeSessionDependencies({
        restoreSession: jest.fn().mockResolvedValue({
          guardian: firstGuardian,
          selectedStudentRm: firstGuardian.students[0].rm,
        }),
        loadStudentRecords,
      }),
    );

    expect(
      await screen.findByText('Nenhum boletim encontrado'),
    ).toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: /^Ano selecionado:/ }),
    ).toBeNull();

    await fireEvent.press(
      screen.getByRole('button', { name: 'TENTAR NOVAMENTE' }),
    );

    expect(
      await screen.findByRole('button', { name: /^Ano selecionado:/ }),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Nenhum boletim encontrado')).toBeNull();
    expect(loadStudentRecords).toHaveBeenCalledTimes(2);
  });

  it('carregando: mostra o indicador; falha: mostra o erro e permite tentar de novo', async () => {
    const loadStudentRecords = jest
      .fn()
      .mockRejectedValueOnce(new Error('falha'))
      .mockResolvedValueOnce({
        schedule: [],
        reportCards: firstGuardian.students[0].reportCards,
      });
    await renderWithSession(
      <ReportScreen />,
      makeSessionDependencies({
        restoreSession: jest.fn().mockResolvedValue({
          guardian: firstGuardian,
          selectedStudentRm: firstGuardian.students[0].rm,
        }),
        loadStudentRecords,
      }),
    );

    expect(
      await screen.findByText('Não foi possível carregar o boletim'),
    ).toBeOnTheScreen();

    await fireEvent.press(
      screen.getByRole('button', { name: 'TENTAR NOVAMENTE' }),
    );

    expect(
      await screen.findByRole('button', { name: /^Ano selecionado:/ }),
    ).toBeOnTheScreen();
  });

  it('não mostra média nem valores calculados', async () => {
    await renderReport();
    await fireEvent.press(term('1º trimestre'));

    expect(screen.queryByText(/média|aprovad|reprovad|total/i)).toBeNull();
  });
});
