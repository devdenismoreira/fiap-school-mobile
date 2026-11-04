import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import App from '../App';
import { createDependencies } from '../src/app/bootstrap/dependencies';
import { onlyDigits } from '../src/core/utils/cpf';
import responsaveis from '../src/data/datasources/local/responsaveis.json';
import { SESSION_STORAGE_KEY } from '../src/data/repositories/AsyncStorageSessionRepository';

// Dados reais do fixture, lidos em tempo de execução (nada de credenciais no teste).
const [guardian, singleStudentGuardian] = responsaveis;
const [firstStudent, secondStudent] = guardian.alunos;
const studentInfo = (student: typeof firstStudent) =>
  `${student.turma} - RM ${student.rm} - ${student.periodo}`;

const renderApp = () =>
  render(<App dependencies={createDependencies({ signInLatencyMs: 0 })} />);

const storeSession = (guardianId: number, selectedStudentRm: number) =>
  AsyncStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ version: 1, guardianId, selectedStudentRm }),
  );

const loginButton = () => screen.findByRole('button', { name: 'FAZER LOGIN' });
const tab = (name: 'AGENDA' | 'BOLETIM') => screen.getByRole('tab', { name });
const sectionTitle = (name: 'AGENDA' | 'BOLETIM') =>
  screen.findByRole('header', { name });

describe('App (fluxo de sessão e navegação)', () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  });

  it('sem sessão salva, abre no Login', async () => {
    await renderApp();

    expect(await loginButton()).toBeOnTheScreen();
  });

  it('login válido abre a aba Agenda com o cabeçalho e salva só os identificadores', async () => {
    await renderApp();

    await fireEvent.changeText(await screen.findByLabelText('CPF'), guardian.cpf);
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

    await fireEvent.changeText(await screen.findByLabelText('CPF'), guardian.cpf);
    await fireEvent.changeText(screen.getByLabelText('SENHA'), `${guardian.senha}x`);
    await fireEvent.press(screen.getByRole('button', { name: 'FAZER LOGIN' }));

    expect(await screen.findByText(/Usuário ou senha inválida/)).toBeOnTheScreen();
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

  it('TROCAR PERFIL abre a seleção acima das abas e FECHAR volta à mesma aba', async () => {
    await storeSession(guardian.id, firstStudent.rm);
    await renderApp();
    await sectionTitle('AGENDA');
    await fireEvent.press(tab('BOLETIM'));
    await sectionTitle('BOLETIM');

    await fireEvent.press(screen.getByRole('button', { name: 'TROCAR PERFIL' }));
    expect(
      await screen.findByText('Escolha o perfil\nque você quer visualizar'),
    ).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'FECHAR' }));

    await waitFor(() =>
      expect(screen.queryByText(/Escolha o perfil/)).toBeNull(),
    );
    expect(tab('BOLETIM')).toBeSelected();
  });

  it('responsável com 1 aluno não vê TROCAR PERFIL', async () => {
    await storeSession(singleStudentGuardian.id, singleStudentGuardian.alunos[0].rm);
    await renderApp();

    expect(await sectionTitle('AGENDA')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'TROCAR PERFIL' })).toBeNull();
    expect(screen.getByRole('button', { name: 'SAIR' })).toBeOnTheScreen();
  });

  it('SAIR limpa a sessão e volta ao Login', async () => {
    await storeSession(guardian.id, firstStudent.rm);
    await renderApp();

    await fireEvent.press(await screen.findByRole('button', { name: 'SAIR' }));

    expect(await loginButton()).toBeOnTheScreen();
    expect(await AsyncStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
