import { NetworkError } from '@/core/errors/NetworkError';
import { TooManyAttemptsError } from '@/core/errors/TooManyAttemptsError';
import { createApiClient, REFRESH_PATH } from '@/core/http/apiClient';
import type { ResponsavelDTO } from '@/data/datasources/dtos';
import responsaveis from '@/test-utils/fixtures/responsaveis.json';
import {
  apiError,
  authHeader,
  createFakeAdapter,
  createMemoryTokenStore,
  requestBody,
  type FakeRoute,
} from '@/test-utils/fakeHttp';
import {
  GuardianRemoteDataSource,
  LOGIN_PATH,
  ME_PATH,
} from './GuardianRemoteDataSource';

const record = responsaveis[0];
const responsavel: ResponsavelDTO = {
  id: record.id,
  primeiroNome: record.primeiroNome,
  sobrenome: record.sobrenome,
  alunos: record.alunos,
};

const loginReply = {
  status: 200,
  data: {
    accessToken: 'access-1',
    tokenType: 'Bearer',
    expiresIn: 900,
    refreshToken: 'refresh-1',
    refreshExpiresIn: 2592000,
    responsavel,
  },
};

function setup(
  route: FakeRoute,
  tokens: { accessToken?: string; refreshToken?: string } = {},
) {
  const tokenStore = createMemoryTokenStore(tokens);
  const { adapter, requests } = createFakeAdapter(route);
  const http = createApiClient({
    baseURL: 'http://api.test',
    tokenStore,
    adapter,
  });
  return {
    dataSource: new GuardianRemoteDataSource(http, tokenStore),
    tokenStore,
    requests,
  };
}

describe('GuardianRemoteDataSource.signIn', () => {
  it('envia CPF e senha sem Bearer, guarda os tokens e devolve o responsável no formato do JSON', async () => {
    const { dataSource, tokenStore, requests } = setup(() => loginReply);

    const result = await dataSource.signIn(record.cpf, record.senha);

    expect(result).toEqual(responsavel);
    expect(result).not.toHaveProperty('cpf');
    expect(requests[0].url).toBe(LOGIN_PATH);
    expect(requests[0].method).toBe('post');
    expect(requestBody(requests[0])).toEqual({
      cpf: record.cpf,
      senha: record.senha,
    });
    expect(authHeader(requests[0])).toBeFalsy();
    expect(tokenStore.saved).toEqual([
      { accessToken: 'access-1', refreshToken: 'refresh-1' },
    ]);
  });

  it.each([
    [401, 'CREDENCIAIS_INVALIDAS'],
    [400, 'DADOS_INVALIDOS'],
  ])(
    '%s %s devolve null (credenciais inválidas) sem guardar tokens',
    async (status, codigo) => {
      const { dataSource, tokenStore } = setup(() => apiError(status, codigo));

      await expect(dataSource.signIn(record.cpf, 'errada')).resolves.toBeNull();
      expect(tokenStore.saved).toHaveLength(0);
    },
  );

  it('429 vira TooManyAttemptsError', async () => {
    const { dataSource } = setup(() => apiError(429, 'MUITAS_TENTATIVAS'));

    await expect(dataSource.signIn(record.cpf, 'x')).rejects.toBeInstanceOf(
      TooManyAttemptsError,
    );
  });

  it.each([
    ['sem conexão', 'network-error' as const],
    ['timeout', 'timeout' as const],
    ['servidor fora do ar', { status: 500, data: {} }],
  ])('%s vira NetworkError', async (_label, reply) => {
    const { dataSource } = setup(() => reply);

    await expect(dataSource.signIn(record.cpf, 'x')).rejects.toBeInstanceOf(
      NetworkError,
    );
  });
});

describe('GuardianRemoteDataSource.getById', () => {
  const meRoute: FakeRoute = request =>
    request.url === REFRESH_PATH
      ? {
          status: 200,
          data: { accessToken: 'access-novo', refreshToken: 'refresh-novo' },
        }
      : { status: 200, data: responsavel };

  it('ao abrir o app, renova com o refresh guardado e busca o /me', async () => {
    const { dataSource, requests } = setup(meRoute, {
      refreshToken: 'refresh-salvo',
    });

    await expect(dataSource.getById(record.id)).resolves.toEqual(responsavel);
    expect(requests.map(r => r.url)).toEqual([REFRESH_PATH, ME_PATH]);
    expect(authHeader(requests[1])).toBe('Bearer access-novo');
  });

  it('devolve null se o /me for de outro responsável', async () => {
    const { dataSource } = setup(meRoute, { refreshToken: 'refresh-salvo' });

    await expect(dataSource.getById(record.id + 1)).resolves.toBeNull();
  });

  it('sem tokens guardados devolve null sem chamar a API', async () => {
    const { dataSource, requests } = setup(meRoute);

    await expect(dataSource.getById(record.id)).resolves.toBeNull();
    expect(requests).toHaveLength(0);
  });

  it('refresh recusado devolve null e apaga os tokens', async () => {
    const { dataSource, tokenStore } = setup(
      () => apiError(401, 'REFRESH_INVALIDO'),
      { refreshToken: 'refresh-revogado' },
    );

    await expect(dataSource.getById(record.id)).resolves.toBeNull();
    await expect(tokenStore.getRefreshToken()).resolves.toBeNull();
  });

  it('sem conexão propaga NetworkError e mantém o refresh guardado', async () => {
    const { dataSource, tokenStore } = setup(() => 'network-error', {
      refreshToken: 'refresh-salvo',
    });

    await expect(dataSource.getById(record.id)).rejects.toBeInstanceOf(
      NetworkError,
    );
    await expect(tokenStore.getRefreshToken()).resolves.toBe('refresh-salvo');
  });

  it('429 na renovação vira TooManyAttemptsError', async () => {
    const { dataSource } = setup(() => apiError(429, 'MUITAS_TENTATIVAS'), {
      refreshToken: 'refresh-salvo',
    });

    await expect(dataSource.getById(record.id)).rejects.toBeInstanceOf(
      TooManyAttemptsError,
    );
  });
});
