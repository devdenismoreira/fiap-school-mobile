import { fireEvent, screen } from '@testing-library/react-native';

import { theme } from '@/core/theme';
import { renderWithTheme } from '@/test-utils/renderWithTheme';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('mostra só o título quando não há descrição nem ação', async () => {
    await renderWithTheme(<EmptyState title="Sem aulas neste dia" />);

    expect(screen.getByText('Sem aulas neste dia')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('mostra descrição e o botão de ação no padrão do design system', async () => {
    const onAction = jest.fn();
    await renderWithTheme(
      <EmptyState
        testID="empty"
        title="Nenhum boletim encontrado"
        description="Não encontramos boletins para este aluno."
        actionLabel="TENTAR NOVAMENTE"
        onAction={onAction}
      />,
    );

    expect(
      screen.getByText('Não encontramos boletins para este aluno.'),
    ).toBeOnTheScreen();
    const action = screen.getByRole('button', { name: 'TENTAR NOVAMENTE' });
    expect(screen.getByTestId('empty-action')).toHaveStyle({
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadii.m,
    });

    await fireEvent.press(action);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('carregando: troca o texto por indicador e não dispara a ação', async () => {
    const onAction = jest.fn();
    await renderWithTheme(
      <EmptyState
        title="Erro"
        actionLabel="TENTAR NOVAMENTE"
        onAction={onAction}
        actionLoading
      />,
    );

    const action = screen.getByRole('button', { name: 'TENTAR NOVAMENTE' });
    expect(action).toBeBusy();
    expect(screen.queryByText('TENTAR NOVAMENTE')).toBeNull();
    await fireEvent.press(action);
    expect(onAction).not.toHaveBeenCalled();
  });
});
