import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import App from '../App';
import { NetworkError } from '@/core/errors/NetworkError';
import { onlyDigits } from '@/core/utils/cpf';
import {
  reportCardsPath,
  schedulePath,
} from '@/data/datasources/remote/GuardianRemoteDataSource';
import { SESSION_STORAGE_KEY } from '@/data/repositories/AsyncStorageSessionRepository';
import { createFakeApi, fixtureGuardians } from '@/test-utils/fakeApi';

const [guardian, singleStudentGuardian] = fixtureGuardians;
const [firstStudent, secondStudent] = guardian.alunos;
const studentInfo = (student: typeof firstStudent) =>
  `${student.turma} - RM ${student.rm} - ${student.periodo}`;

let api = createFakeApi();

const renderApp = () => render(<App dependencies={api.dependencies} />);

const storeSession = async (
  guardianId: number,
  selectedStudentRm: number | null,
) => {
  api.keepSignedIn(guardianId);
  await AsyncStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ version: 1, guardianId, selectedStudentRm }),
  );
};

const loginButton = () => screen.findByRole('button', { name: 'FAZER LOGIN' });
const tab = (name: 'AGENDA' | 'BOLETIM') => screen.getByRole('tab', { name });
const sectionTitle = (name: 'AGENDA' | 'BOLETIM') =>
  screen.findByRole('header', { name });

describe('App (fluxo de sessão e navegação)', () => {
  beforeEach(async () => {
    api = createFakeApi();
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  });

  it('sem sessão salva, abre no Login', async () => {
    await renderApp();

    expect(await loginButton()).toBeOnTheScreen();
  });

  it('login válido abre a aba Agenda com o cabeçalho e salva só os identificadores', async () => {
    await renderApp();

    await fireEvent.changeText(
      await screen.findByLabelText('CPF'),
      guardian.cpf,
    );
    await fireEvent.changeText(screen.getByLabelText('SENHA'), guardian.senha);
    await fireEvent.press(screen.getByRole('button', { name: 'FAZER LOGIN' }));

    expect(await sectionTitle('AGENDA')).toBeOnTheScreen();
    expect(tab('AGENDA')).toBeSelected();
    expect(
      screen.getByText(`Olá, ${guardian.primeiroNome.toUpperCase()}`),
    ).toBeOnTheScreen();
    expect(screen.getByText(studentInfo(firstStudent))).toBeOnTheScreen();

    const stored = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    expect(JSON.parse(stored!)).toEqual({
      version: 1,
      guardianId: guardian.id,
      selectedStudentRm: firstStudent.rm,
    });
    expect(stored).not.toContain(onlyDigits(guardian.cpf));
    expect(stored).not.toContain(guardian.email);
  });

  it('login inválido mostra o erro e permanece no Login', async () => {
    await renderApp();

    await fireEvent.changeText(
      await screen.findByLabelText('CPF'),
      guardian.cpf,
    );
    await fireEvent.changeText(
      screen.getByLabelText('SENHA'),
      `${guardian.senha}x`,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'FAZER LOGIN' }));

    expect(
      await screen.findByText(/Usuário ou senha inválida/),
    ).toBeOnTheScreen();
    expect(await AsyncStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('com sessão salva, abre direto nas abas com o aluno salvo', async () => {
    await storeSession(guardian.id, secondStudent.rm);

    await renderApp();

    expect(await sectionTitle('AGENDA')).toBeOnTheScreen();
    expect(screen.getByText(studentInfo(secondStudent))).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'FAZER LOGIN' })).toBeNull();
  });

  it('troca de aba mantém o cabeçalho e destaca a aba ativa', async () => {
    await storeSession(guardian.id, firstStudent.rm);
    await renderApp();
    await sectionTitle('AGENDA');

    await fireEvent.press(tab('BOLETIM'));

    expect(await sectionTitle('BOLETIM')).toBeOnTheScreen();
    expect(tab('BOLETIM')).toBeSelected();
    expect(tab('AGENDA')).not.toBeSelected();
    expect(screen.getByText(studentInfo(firstStudent))).toBeOnTheScreen();
  });

  it('só a barra de ações é fixa (uma instância); a saudação rola dentro de cada aba', async () => {
    await storeSession(guardian.id, firstStudent.rm);
    await renderApp();
    await sectionTitle('AGENDA');
    await fireEvent.press(tab('BOLETIM'));
    await sectionTitle('BOLETIM');

    const hidden = { includeHiddenElements: true };
    expect(
      screen.getAllByRole('button', { name: 'SAIR', ...hidden }),
    ).toHaveLength(1);
    expect(screen.getAllByText(/^Olá, /, hidden)).toHaveLength(2);
  });

  it('TROCAR PERFIL abre a seleção acima das abas e FECHAR volta à mesma aba', async () => {
    await storeSession(guardian.id, firstStudent.rm);
    await renderApp();
    await sectionTitle('AGENDA');
    await fireEvent.press(tab('BOLETIM'));
    await sectionTitle('BOLETIM');

    await fireEvent.press(
      screen.getByRole('button', { name: 'TROCAR PERFIL' }),
    );
    expect(
      await screen.findByText('Escolha o perfil\nque você quer visualizar'),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'FECHAR' }));

    await waitFor(() =>
      expect(screen.queryByText(/Escolha o perfil/)).toBeNull(),
    );
    expect(tab('BOLETIM')).toBeSelected();
  });

  it('trocar de aluno volta à aba de origem com o cabeçalho do novo aluno e persiste', async () => {
    await storeSession(guardian.id, firstStudent.rm);
    await renderApp();
    await sectionTitle('AGENDA');
    await fireEvent.press(tab('BOLETIM'));
    await sectionTitle('BOLETIM');

    await fireEvent.press(
      screen.getByRole('button', { name: 'TROCAR PERFIL' }),
    );
    const fullName = `${secondStudent.primeiroNome} ${secondStudent.sobrenome}`;
    await fireEvent.press(
      await screen.findByRole('radio', { name: new RegExp(`^${fullName},`) }),
    );

    await waitFor(() =>
      expect(screen.queryByText(/Escolha o perfil/)).toBeNull(),
    );
    expect(tab('BOLETIM')).toBeSelected();
    expect(screen.getByText(studentInfo(secondStudent))).toBeOnTheScreen();
    expect(screen.queryByText(studentInfo(firstStudent))).toBeNull();
    expect(
      JSON.parse((await AsyncStorage.getItem(SESSION_STORAGE_KEY))!),
    ).toMatchObject({ selectedStudentRm: secondStudent.rm });
    expect(api.requests.map(r => r.url)).toEqual(
      expect.arrayContaining([
        schedulePath(secondStudent.rm),
        reportCardsPath(secondStudent.rm),
      ]),
    );
  });

  it('responsável com 1 aluno não vê TROCAR PERFIL', async () => {
    await storeSession(
      singleStudentGuardian.id,
      singleStudentGuardian.alunos[0].rm,
    );
    await renderApp();

    expect(await sectionTitle('AGENDA')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'TROCAR PERFIL' })).toBeNull();
    expect(screen.getByRole('button', { name: 'SAIR' })).toBeOnTheScreen();
  });

  it('responsável sem alunos vê só a mensagem e o SAIR, sem abas', async () => {
    const noStudents = { ...guardian, id: 99, alunos: [] };
    api = createFakeApi([...fixtureGuardians, noStudents]);
    await storeSession(noStudents.id, null);
    await renderApp();

    expect(await screen.findByText('Nenhum aluno vinculado')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'SAIR' })).toBeOnTheScreen();
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByRole('button', { name: 'TROCAR PERFIL' })).toBeNull();
  });

  it('SAIR limpa a sessão e volta ao Login', async () => {
    await storeSession(guardian.id, firstStudent.rm);
    await renderApp();

    await fireEvent.press(await screen.findByRole('button', { name: 'SAIR' }));

    expect(await loginButton()).toBeOnTheScreen();
    expect(await AsyncStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('sem conexão ao abrir mostra a tela de conexão e entra ao tentar de novo', async () => {
    await storeSession(guardian.id, firstStudent.rm);
    const restoreSession = jest
      .fn(api.dependencies.restoreSession)
      .mockRejectedValueOnce(new NetworkError());
    await render(
      <App dependencies={{ ...api.dependencies, restoreSession }} />,
    );

    const retry = await screen.findByRole('button', {
      name: 'TENTAR NOVAMENTE',
    });
    expect(
      screen.getByText('Não foi possível conectar.\nVerifique sua internet.'),
    ).toBeOnTheScreen();
    expect(await AsyncStorage.getItem(SESSION_STORAGE_KEY)).not.toBeNull();

    await fireEvent.press(retry);

    expect(await sectionTitle('AGENDA')).toBeOnTheScreen();
    expect(screen.getByText(studentInfo(firstStudent))).toBeOnTheScreen();
  });
});
