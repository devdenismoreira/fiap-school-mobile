import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';

import App from '../App';
import { createDependencies } from '../src/app/bootstrap/dependencies';
import { onlyDigits } from '../src/core/utils/cpf';
import responsaveis from '../src/data/datasources/local/responsaveis.json';
import { SESSION_STORAGE_KEY } from '../src/data/repositories/AsyncStorageSessionRepository';

// Dados reais do fixture, lidos em tempo de execução (nada de credenciais no teste).
const [guardian] = responsaveis;
const [firstStudent, secondStudent] = guardian.alunos;
const studentInfo = (student: typeof firstStudent) =>
  `${student.turma} - RM ${student.rm} - ${student.periodo}`;

const renderApp = () =>
  render(<App dependencies={createDependencies({ signInLatencyMs: 0 })} />);

describe('App (fluxo de sessão)', () => {
  beforeEach(async () => {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
  });

  it('sem sessão salva, abre no Login', async () => {
    await renderApp();

    expect(
      await screen.findByRole('button', { name: 'FAZER LOGIN' }),
    ).toBeOnTheScreen();
  });

  it('login válido entra na área autenticada e salva só os identificadores', async () => {
    await renderApp();

    await fireEvent.changeText(await screen.findByLabelText('CPF'), guardian.cpf);
    await fireEvent.changeText(screen.getByLabelText('SENHA'), guardian.senha);
    await fireEvent.press(screen.getByRole('button', { name: 'FAZER LOGIN' }));

    expect(await screen.findByText(studentInfo(firstStudent))).toBeOnTheScreen();

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

  it('com sessão salva, abre direto na área autenticada com o aluno salvo', async () => {
    await AsyncStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        guardianId: guardian.id,
        selectedStudentRm: secondStudent.rm,
      }),
    );

    await renderApp();

    expect(await screen.findByText(studentInfo(secondStudent))).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'FAZER LOGIN' })).toBeNull();
  });

  it('SAIR limpa a sessão e volta ao Login', async () => {
    await AsyncStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        guardianId: guardian.id,
        selectedStudentRm: firstStudent.rm,
      }),
    );
    await renderApp();

    await fireEvent.press(await screen.findByRole('button', { name: 'SAIR' }));

    expect(
      await screen.findByRole('button', { name: 'FAZER LOGIN' }),
    ).toBeOnTheScreen();
    expect(await AsyncStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
