import { act, fireEvent, screen } from '@testing-library/react-native';

import { motion, theme } from '@/core/theme';
import { renderWithTheme } from '@/test-utils/renderWithTheme';
import { Dropdown, type DropdownOption } from './Dropdown';

const options: DropdownOption[] = [
  { value: '2025-03-16', label: '16 de março, domingo' },
  { value: '2025-03-17', label: '17 de março, segunda-feira' },
];

function setup(isOpen: boolean) {
  const handlers = {
    onToggle: jest.fn(),
    onClose: jest.fn(),
    onSelect: jest.fn(),
  };
  const view = renderWithTheme(
    <Dropdown
      testID="dropdown"
      accessibilityLabel="Dia selecionado"
      options={options}
      selectedValue="2025-03-16"
      isOpen={isOpen}
      {...handlers}
    />,
  );
  return { handlers, view };
}

const trigger = () =>
  screen.getByRole('button', { name: 'Dia selecionado: 16 de março, domingo' });

describe('Dropdown', () => {
  it('ao fechar, mantém o painel durante a animação de saída e só depois o remove', async () => {
    jest.useFakeTimers();
    try {
      const props = {
        testID: 'dropdown',
        accessibilityLabel: 'Dia selecionado',
        options,
        selectedValue: '2025-03-16',
        onToggle: jest.fn(),
        onClose: jest.fn(),
        onSelect: jest.fn(),
      };
      const view = await renderWithTheme(<Dropdown {...props} isOpen />);
      expect(screen.getAllByRole('menuitem')).toHaveLength(2);

      await view.rerender(<Dropdown {...props} isOpen={false} />);
      expect(screen.getAllByRole('menuitem')).toHaveLength(2);

      await act(async () => jest.advanceTimersByTime(motion.normal + 50));
      expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it('fechado: mostra a opção selecionada e não lista as opções', async () => {
    const { handlers, view } = setup(false);
    await view;

    expect(trigger()).toHaveProp('accessibilityState', { expanded: false });
    expect(screen.queryAllByRole('menuitem')).toHaveLength(0);

    await fireEvent.press(trigger());
    expect(handlers.onToggle).toHaveBeenCalledTimes(1);
  });

  it('segue o Figma: 45 pt, fundo surface e raio 8', async () => {
    await setup(false).view;

    expect(screen.getByTestId('dropdown-trigger')).toHaveStyle({
      height: 45,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
    });
  });

  it('aberto: lista as opções com a atual selecionada', async () => {
    await setup(true).view;

    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toBeSelected();
    expect(items[1]).not.toBeSelected();
    expect(trigger()).toHaveProp('accessibilityState', { expanded: true });
  });

  it('selecionar uma opção chama onSelect com o valor', async () => {
    const { handlers, view } = setup(true);
    await view;

    await fireEvent.press(
      screen.getByRole('menuitem', { name: '17 de março, segunda-feira' }),
    );
    expect(handlers.onSelect).toHaveBeenCalledWith('2025-03-17');
  });

  it('tocar fora ou no próprio gatilho fecha sem selecionar', async () => {
    const { handlers, view } = setup(true);
    await view;

    await fireEvent.press(screen.getByTestId('dropdown-backdrop'));
    await fireEvent.press(trigger());

    expect(handlers.onClose).toHaveBeenCalledTimes(2);
    expect(handlers.onSelect).not.toHaveBeenCalled();
  });
});
