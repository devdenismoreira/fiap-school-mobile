import { act, fireEvent, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { makeGuardian } from '@/test-utils/fixtures';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import { StudentSelectionScreen } from './StudentSelectionScreen';

const mockGoBack = jest.fn();
const mockListeners: Record<string, () => void> = {};
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
    addListener: (event: string, listener: () => void) => {
      mockListeners[event] = listener;
      return () => delete mockListeners[event];
    },
  }),
}));

async function renderScreen() {
  const dependencies = makeSessionDependencies({
    restoreSession: jest
      .fn()
      .mockResolvedValue({ guardian: makeGuardian(), selectedStudentRm: 100 }),
  });
  await renderWithSession(<StudentSelectionScreen />, dependencies);
  await screen.findAllByRole('radio');
  return dependencies;
}

const card = (rm: number) =>
  screen.getByRole('radio', { name: new RegExp(`RM ${rm},`) });

describe('StudentSelectionScreen', () => {
  beforeEach(() => mockGoBack.mockClear());

  it('ao terminar a transição, leva o foco do leitor de tela ao título', async () => {
    const focus = jest
      .spyOn(AccessibilityInfo, 'sendAccessibilityEvent')
      .mockImplementation(() => undefined);
    await renderScreen();

    await act(async () => mockListeners.transitionEnd?.());

    expect(focus).toHaveBeenCalledWith(expect.anything(), 'focus');
    focus.mockRestore();
  });

  it('mostra o título e os alunos na ordem do JSON, com o atual marcado', async () => {
    await renderScreen();

    expect(
      screen.getByRole('header', {
        name: 'Escolha o perfil\nque você quer visualizar',
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getAllByRole('radio').map(item => item.props.accessibilityLabel),
    ).toEqual([
      'Rui Teste, 7EF, RM 100, Matutino',
      'Bia Teste, 7EF, RM 200, Matutino',
    ]);
    expect(card(100)).toBeChecked();
    expect(card(200)).not.toBeChecked();
  });

  it('selecionar outro aluno troca, persiste e volta para a tela anterior', async () => {
    const dependencies = await renderScreen();

    await fireEvent.press(card(200));

    expect(dependencies.sessionRepository.save).toHaveBeenCalledWith({
      guardianId: 1,
      selectedStudentRm: 200,
    });
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('selecionar o aluno atual só fecha, sem gravar nada', async () => {
    const dependencies = await renderScreen();

    await fireEvent.press(card(100));

    expect(dependencies.sessionRepository.save).not.toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('FECHAR volta sem alterar o aluno', async () => {
    const dependencies = await renderScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'FECHAR' }));

    expect(dependencies.sessionRepository.save).not.toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    expect(card(100)).toBeChecked();
  });
});
