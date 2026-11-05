import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';

import App from '../App';
import { createRemoteDependencies } from '@/app/bootstrap/dependencies';
import { createApiClient, REFRESH_PATH } from '@/core/http/apiClient';
import type { ResponsavelDTO } from '@/data/datasources/dtos';
import responsaveis from '@/data/datasources/local/responsaveis.json';
import {
  LOGIN_PATH,
  ME_PATH,
} from '@/data/datasources/remote/GuardianRemoteDataSource';
import { LOGOUT_PATH } from '@/data/datasources/remote/remoteSession';
import { SESSION_STORAGE_KEY } from '@/data/repositories/AsyncStorageSessionRepository';
import {
  apiError,
  createFakeAdapter,
  createMemoryTokenStore,
  requestBody,
  type FakeRoute,
} from '@/test-utils/fakeHttp';

const record = responsaveis[0];
const responsavel: ResponsavelDTO = {
  id: record.id,
  primeiroNome: record.primeiroNome,
  sobrenome: record.sobrenome,
  alunos: record.alunos,
};
const studentInfo = (student: (typeof record.alunos)[number]) =>
  `${student.turma} - RM ${student.rm} - ${student.periodo}`;

const tokens = (n: number) => ({
  accessToken: `access-${n}`,
  tokenType: 'Bearer',
  expiresIn: 900,
  refreshToken: `refresh-${n}`,
  refreshExpiresIn: 2592000,
});

const fakeApi: FakeRoute = request => {
  switch (request.url) {
    case LOGIN_PATH: {
      const body = requestBody(request) as { cpf: string; senha: string };
      return body.cpf === record.cpf && body.senha === record.senha
        ? { status: 200, data: { ...tokens(1), responsavel } }
        : apiError(401, 'CREDENCIAIS_INVALIDAS');
    }
    case REFRESH_PATH:
      return { status: 200, data: tokens(2) };
    case ME_PATH:
      return { status: 200, data: responsavel };
    case LOGOUT_PATH:
      return { status: 204 };
    default:
      return apiError(404, 'NAO_ENCONTRADO');
  }
};

function startApp(tokenStore = createMemoryTokenStore()) {
  const { adapter, requests } = createFakeAdapter(fakeApi);
  const http = createApiClient({
    baseURL: 'http://api.test',
    tokenStore,
    adapter,
  });
  const urls = () => requests.map(r => r.url);
  return {
    tokenStore,
    requests,
    urls,
    render: () =>
      render(<App dependencies={createRemoteDependencies(http, tokenStore)} />),
  };
}

async function storedValues() {
  const keys = await AsyncStorage.getAllKeys();
  const values = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
  return values.join('\n');
}

describe('App com a FIAP School API (simulada)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('login pela API abre a Agenda e não grava token nenhum no AsyncStorage', async () => {
    const app = startApp();
    await app.render();

    await fireEvent.changeText(await screen.findByLabelText('CPF'), record.cpf);
    await fireEvent.changeText(screen.getByLabelText('SENHA'), record.senha);
    await fireEvent.press(screen.getByRole('button', { name: 'FAZER LOGIN' }));

    expect(
      await screen.findByRole('header', { name: 'AGENDA' }),
    ).toBeOnTheScreen();
    expect(screen.getByText(studentInfo(record.alunos[0]))).toBeOnTheScreen();
    expect(app.tokenStore.getAccessToken()).toBe('access-1');

    const stored = await storedValues();
    expect(stored).toContain(`"guardianId":${record.id}`);
    for (const secret of ['access-1', 'refresh-1', record.senha]) {
      expect(stored).not.toContain(secret);
    }
  });

  it('ao reabrir com refresh guardado, renova e entra sem pedir login', async () => {
    await AsyncStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        guardianId: record.id,
        selectedStudentRm: record.alunos[0].rm,
      }),
    );
    const app = startApp(createMemoryTokenStore({ refreshToken: 'refresh-1' }));
    await app.render();

    expect(
      await screen.findByRole('header', { name: 'AGENDA' }),
    ).toBeOnTheScreen();
    expect(app.urls()).toEqual([REFRESH_PATH, ME_PATH]);
    expect(app.tokenStore.getAccessToken()).toBe('access-2');
  });

  it('SAIR revoga a sessão na API, apaga os tokens e volta ao Login', async () => {
    await AsyncStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        guardianId: record.id,
        selectedStudentRm: record.alunos[0].rm,
      }),
    );
    const app = startApp(createMemoryTokenStore({ refreshToken: 'refresh-1' }));
    await app.render();

    await fireEvent.press(await screen.findByRole('button', { name: 'SAIR' }));

    expect(
      await screen.findByRole('button', { name: 'FAZER LOGIN' }),
    ).toBeOnTheScreen();
    const logout = app.requests.find(r => r.url === LOGOUT_PATH);
    expect(logout && requestBody(logout)).toEqual({
      refreshToken: 'refresh-2',
    });
    expect(app.tokenStore.getAccessToken()).toBeNull();
    await expect(app.tokenStore.getRefreshToken()).resolves.toBeNull();
    expect(await AsyncStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
