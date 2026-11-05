import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';

import App from '../App';
import { REFRESH_PATH } from '@/core/http/apiClient';
import { ME_PATH } from '@/data/datasources/remote/GuardianRemoteDataSource';
import { LOGOUT_PATH } from '@/data/datasources/remote/remoteSession';
import { SESSION_STORAGE_KEY } from '@/data/repositories/AsyncStorageSessionRepository';
import { requestBody } from '@/test-utils/fakeHttp';
import { createFakeApi, fixtureGuardians } from '@/test-utils/fakeApi';

const [record] = fixtureGuardians;
const studentInfo = (student: (typeof record.alunos)[number]) =>
  `${student.turma} - RM ${student.rm} - ${student.periodo}`;

async function storedValues() {
  const keys = await AsyncStorage.getAllKeys();
  const values = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
  return values.join('\n');
}

async function storeSession(api: ReturnType<typeof createFakeApi>) {
  api.keepSignedIn(record.id);
  await AsyncStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      guardianId: record.id,
      selectedStudentRm: record.alunos[0].rm,
    }),
  );
}

describe('App com a FIAP School API (simulada)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('login pela API abre a Agenda e não grava token nenhum no AsyncStorage', async () => {
    const api = createFakeApi();
    await render(<App dependencies={api.dependencies} />);

    await fireEvent.changeText(await screen.findByLabelText('CPF'), record.cpf);
    await fireEvent.changeText(screen.getByLabelText('SENHA'), record.senha);
    await fireEvent.press(screen.getByRole('button', { name: 'FAZER LOGIN' }));

    expect(
      await screen.findByRole('header', { name: 'AGENDA' }),
    ).toBeOnTheScreen();
    expect(screen.getByText(studentInfo(record.alunos[0]))).toBeOnTheScreen();
    const accessToken = api.tokenStore.getAccessToken();
    const refreshToken = await api.tokenStore.getRefreshToken();
    expect(accessToken).toBeTruthy();

    const stored = await storedValues();
    expect(stored).toContain(`"guardianId":${record.id}`);
    for (const secret of [accessToken!, refreshToken!, record.senha]) {
      expect(stored).not.toContain(secret);
    }
  });

  it('ao reabrir com refresh guardado, renova e entra sem pedir login', async () => {
    const api = createFakeApi();
    await storeSession(api);
    await render(<App dependencies={api.dependencies} />);

    expect(
      await screen.findByRole('header', { name: 'AGENDA' }),
    ).toBeOnTheScreen();
    expect(api.requests.map(r => r.url)).toEqual([REFRESH_PATH, ME_PATH]);
    expect(api.tokenStore.getAccessToken()).toBeTruthy();
  });

  it('SAIR revoga a sessão na API, apaga os tokens e volta ao Login', async () => {
    const api = createFakeApi();
    await storeSession(api);
    await render(<App dependencies={api.dependencies} />);
    await screen.findByRole('header', { name: 'AGENDA' });
    const refreshToken = await api.tokenStore.getRefreshToken();

    await fireEvent.press(screen.getByRole('button', { name: 'SAIR' }));

    expect(
      await screen.findByRole('button', { name: 'FAZER LOGIN' }),
    ).toBeOnTheScreen();
    const logout = api.requests.find(r => r.url === LOGOUT_PATH);
    expect(logout && requestBody(logout)).toEqual({ refreshToken });
    expect(api.tokenStore.getAccessToken()).toBeNull();
    await expect(api.tokenStore.getRefreshToken()).resolves.toBeNull();
    expect(await AsyncStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('sessão recusada pela API ao abrir leva ao Login e apaga o refresh', async () => {
    const api = createFakeApi();
    await storeSession(api);
    api.tokenStore.setRefreshToken('refresh-revogado');
    await render(<App dependencies={api.dependencies} />);

    expect(
      await screen.findByRole('button', { name: 'FAZER LOGIN' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText('Sua sessão expirou.\nEntre novamente.'),
    ).toBeOnTheScreen();
    await expect(api.tokenStore.getRefreshToken()).resolves.toBeNull();
    expect(await AsyncStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('SAIR leva ao Login sem o aviso de sessão expirada', async () => {
    const api = createFakeApi();
    await storeSession(api);
    await render(<App dependencies={api.dependencies} />);
    await screen.findByRole('header', { name: 'AGENDA' });

    await fireEvent.press(screen.getByRole('button', { name: 'SAIR' }));

    expect(
      await screen.findByRole('button', { name: 'FAZER LOGIN' }),
    ).toBeOnTheScreen();
    expect(screen.queryByText(/Sua sessão expirou/)).toBeNull();
  });
});
