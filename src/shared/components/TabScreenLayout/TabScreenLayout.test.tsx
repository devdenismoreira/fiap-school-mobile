import { act, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { makeGuardian } from '@/test-utils/fixtures';
import {
  makeSessionDependencies,
  renderWithSession,
} from '@/test-utils/renderWithSession';
import { TabScreenLayout } from './TabScreenLayout';

async function renderLayout(loadStudentRecords = jest.fn()) {
  loadStudentRecords.mockResolvedValue({ schedule: [], reportCards: [] });
  await renderWithSession(
    <TabScreenLayout title="AGENDA">
      <Text>conteúdo</Text>
    </TabScreenLayout>,
    makeSessionDependencies({
      restoreSession: jest.fn().mockResolvedValue({
        guardian: makeGuardian(),
        selectedStudentRm: 100,
      }),
      loadStudentRecords,
    }),
  );
  await screen.findByText('conteúdo');
  return loadStudentRecords;
}

const pullToRefresh = () => {
  const { refreshControl } = screen.getByTestId('tab-scroll').props;
  return act(async () => refreshControl.props.onRefresh());
};

describe('TabScreenLayout: puxar para atualizar', () => {
  it('puxar a tela para baixo busca de novo a agenda e os boletins do aluno selecionado', async () => {
    const loadStudentRecords = await renderLayout();
    await act(async () => undefined);
    expect(loadStudentRecords).toHaveBeenCalledTimes(1);

    await pullToRefresh();

    expect(loadStudentRecords).toHaveBeenCalledTimes(2);
    expect(loadStudentRecords).toHaveBeenLastCalledWith(100);
  });

  it('se a atualização falhar, avisa com toast de erro e mantém a tela', async () => {
    const loadStudentRecords = await renderLayout();
    await act(async () => undefined);
    loadStudentRecords.mockRejectedValueOnce(new Error('sem rede'));

    await pullToRefresh();

    expect(
      await screen.findByText('Não foi possível atualizar'),
    ).toBeOnTheScreen();
    expect(screen.getByText('conteúdo')).toBeOnTheScreen();
  });
});
