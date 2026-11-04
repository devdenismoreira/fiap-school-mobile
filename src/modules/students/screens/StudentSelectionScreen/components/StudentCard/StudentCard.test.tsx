import { fireEvent, screen } from '@testing-library/react-native';

import { theme } from '@/core/theme';
import { makeStudent } from '@/test-utils/fixtures';
import { renderWithTheme } from '@/test-utils/renderWithTheme';
import { StudentCard } from './StudentCard';

const student = makeStudent({
  rm: 12567,
  firstName: 'Rafael',
  lastName: 'da Silva',
  className: '7EF',
  shift: 'Matutino',
});

describe('StudentCard', () => {
  it('mostra o nome completo em caixa alta e a linha turma/RM/período', async () => {
    await renderWithTheme(
      <StudentCard student={student} selected={false} onPress={jest.fn()} />,
    );

    expect(screen.getByText('RAFAEL DA SILVA')).toBeOnTheScreen();
    expect(screen.getByText('7EF - RM 12567 - Matutino')).toBeOnTheScreen();
  });

  it('segue o visual do Figma: fundo surfaceRaised, raio 8, 90 pt de altura', async () => {
    await renderWithTheme(
      <StudentCard student={student} selected={false} onPress={jest.fn()} />,
    );

    expect(screen.getByTestId('student-card-12567')).toHaveStyle({
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: 8,
      height: 90,
      padding: 15,
      borderWidth: 1,
    });
  });

  it('selecionado: borda primary e estado marcado para leitores de tela', async () => {
    await renderWithTheme(
      <StudentCard student={student} selected onPress={jest.fn()} />,
    );

    expect(screen.getByRole('radio')).toBeChecked();
    expect(screen.getByTestId('student-card-12567')).toHaveStyle({
      borderColor: theme.colors.primary,
    });
  });

  it('não selecionado: borda transparente (o texto não muda de posição)', async () => {
    await renderWithTheme(
      <StudentCard student={student} selected={false} onPress={jest.fn()} />,
    );

    expect(screen.getByRole('radio')).not.toBeChecked();
    expect(screen.getByTestId('student-card-12567')).toHaveStyle({
      borderColor: 'transparent',
    });
  });

  it('tem rótulo acessível descritivo e dispara onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(
      <StudentCard student={student} selected={false} onPress={onPress} />,
    );

    await fireEvent.press(
      screen.getByRole('radio', {
        name: 'Rafael da Silva, 7EF, RM 12567, Matutino',
      }),
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
