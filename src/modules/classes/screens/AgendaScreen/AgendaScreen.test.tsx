import { fireEvent, screen } from '@testing-library/react-native';

import { toGuardian } from '@/data/mappers/guardianMapper';
import responsaveis from '@/data/datasources/local/responsaveis.json';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import { AgendaScreen } from './AgendaScreen';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

// Dados reais do JSON (responsável 1, aluno RM 12567 — o mesmo dos frames do Figma).
const guardian = toGuardian(responsaveis[0]);
const student = guardian.students[0];
const monday = student.schedule.find(day => day.date === '2025-03-17')!;

async function renderAgenda() {
  await renderWithSession(
    <AgendaScreen />,
    makeSessionDependencies({
      restoreSession: jest
        .fn()
        .mockResolvedValue({ guardian, selectedStudentRm: student.rm }),
    }),
  );
  return screen.findByRole('button', { name: /^Dia selecionado:/ });
}

describe('AgendaScreen', () => {
  it('abre no primeiro dia (domingo, sem aulas) com o estado vazio do Figma', async () => {
    const dropdown = await renderAgenda();

    expect(dropdown).toHaveAccessibleName(
      'Dia selecionado: 16 de março, domingo',
    );
    expect(screen.getByText('Sem aulas neste dia')).toBeOnTheScreen();
  });

  it('lista os 7 dias do JSON com os rótulos do Figma', async () => {
    await fireEvent.press(await renderAgenda());

    expect(
      screen.getAllByRole('menuitem').map(item => item.props.accessibilityLabel ?? ''),
    ).toHaveLength(7);
    for (const label of [
      '16 de março, domingo',
      '17 de março, segunda-feira',
      '18 de março, terça-feira',
      '19 de março, quarta-feira',
      '20 de março, quinta-feira',
      '21 de março, sexta-feira',
      '22 de março, sábado',
    ]) {
      expect(screen.getByRole('menuitem', { name: label })).toBeOnTheScreen();
    }
  });

  it('segunda-feira mostra as 6 aulas na ordem do JSON, sem agrupar repetidas', async () => {
    await fireEvent.press(await renderAgenda());
    await fireEvent.press(
      screen.getByRole('menuitem', { name: '17 de março, segunda-feira' }),
    );

    expect(screen.queryByText('Sem aulas neste dia')).toBeNull();
    const items = screen.getAllByLabelText(/ às /);
    expect(items.map(item => item.props.accessibilityLabel)).toEqual(
      monday.classes.map(
        session => `${session.time.replace(' - ', ' às ')}, ${session.subject}`,
      ),
    );
    expect(items).toHaveLength(6);
  });

  it('sábado volta ao estado vazio', async () => {
    await fireEvent.press(await renderAgenda());
    await fireEvent.press(
      screen.getByRole('menuitem', { name: '17 de março, segunda-feira' }),
    );
    await fireEvent.press(
      screen.getByRole('button', { name: /^Dia selecionado:/ }),
    );
    await fireEvent.press(
      screen.getByRole('menuitem', { name: '22 de março, sábado' }),
    );

    expect(screen.getByText('Sem aulas neste dia')).toBeOnTheScreen();
  });
});
