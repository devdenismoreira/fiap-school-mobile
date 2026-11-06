import { createRemoteDependencies } from '@/app/bootstrap/dependencies';
import { createApiClient, REFRESH_PATH } from '@/core/http/apiClient';
import type { ResponsavelDTO } from '@/data/datasources/dtos';
import {
  LOGIN_PATH,
  ME_PATH,
} from '@/data/datasources/remote/GuardianRemoteDataSource';
import { LOGOUT_PATH } from '@/data/datasources/remote/remoteSession';
import {
  apiError,
  authHeader,
  createFakeAdapter,
  createMemoryTokenStore,
  requestBody,
  type FakeRoute,
} from './fakeHttp';
import {
  toGuardian,
  toReportCard,
  toScheduleDay,
} from '@/data/mappers/guardianMapper';
import type { Guardian } from '@/domain/entities/Guardian';
import responsaveis from './fixtures/responsaveis.json';

export type FixtureGuardian = (typeof responsaveis)[number];

export const fixtureGuardians: FixtureGuardian[] = responsaveis;

export const withoutCredentials = (
  record: FixtureGuardian,
): ResponsavelDTO => ({
  id: record.id,
  primeiroNome: record.primeiroNome,
  sobrenome: record.sobrenome,
  alunos: record.alunos.map(
    ({ agenda: _agenda, boletim: _boletim, ...aluno }) => aluno,
  ),
});

export function toGuardianWithRecords(record: FixtureGuardian): Guardian {
  const guardian = toGuardian(withoutCredentials(record));
  return {
    ...guardian,
    students: guardian.students.map((student, index) => ({
      ...student,
      schedule: record.alunos[index].agenda.map(toScheduleDay),
      reportCards: record.alunos[index].boletim.map(toReportCard),
    })),
  };
}

const tokensFor = (guardianId: number, round: number) => ({
  accessToken: `access-${guardianId}-${round}`,
  tokenType: 'Bearer',
  expiresIn: 900,
  refreshToken: `refresh-${guardianId}-${round}`,
  refreshExpiresIn: 2592000,
});

const guardianIdIn = (token: unknown, kind: 'access' | 'refresh') => {
  const match =
    typeof token === 'string'
      ? token.match(new RegExp(`^(?:Bearer )?${kind}-(\\d+)-\\d+$`))
      : null;
  return match ? Number(match[1]) : null;
};

export function createFakeApi(records: FixtureGuardian[] = fixtureGuardians) {
  const tokenStore = createMemoryTokenStore();
  const byId = (id: number | null) => records.find(r => r.id === id);
  let round = 0;

  const studentRoute = (request: Parameters<FakeRoute>[0]) => {
    const match = request.url?.match(
      /^\/v1\/alunos\/(\d+)\/(agenda|boletins)$/,
    );
    if (!match) {
      return null;
    }
    const owner = byId(guardianIdIn(authHeader(request), 'access'));
    if (!owner) {
      return apiError(401, 'TOKEN_INVALIDO');
    }
    const student = owner.alunos.find(a => a.rm === Number(match[1]));
    if (!student) {
      return apiError(404, 'ALUNO_NAO_ENCONTRADO');
    }
    return match[2] === 'agenda'
      ? { status: 200, data: { agenda: student.agenda } }
      : { status: 200, data: { boletins: student.boletim } };
  };

  const route: FakeRoute = request => {
    const student = studentRoute(request);
    if (student) {
      return student;
    }
    switch (request.url) {
      case LOGIN_PATH: {
        const { cpf, senha } = requestBody(request) as {
          cpf: string;
          senha: string;
        };
        const record = records.find(r => r.cpf === cpf && r.senha === senha);
        return record
          ? {
              status: 200,
              data: {
                ...tokensFor(record.id, ++round),
                responsavel: withoutCredentials(record),
              },
            }
          : apiError(401, 'CREDENCIAIS_INVALIDAS');
      }
      case REFRESH_PATH: {
        const { refreshToken } = requestBody(request) as {
          refreshToken: string;
        };
        const record = byId(guardianIdIn(refreshToken, 'refresh'));
        return record
          ? { status: 200, data: tokensFor(record.id, ++round) }
          : apiError(401, 'REFRESH_INVALIDO');
      }
      case ME_PATH: {
        const record = byId(guardianIdIn(authHeader(request), 'access'));
        return record
          ? { status: 200, data: withoutCredentials(record) }
          : apiError(401, 'TOKEN_INVALIDO');
      }
      case LOGOUT_PATH:
        return { status: 204 };
      default:
        return apiError(404, 'NAO_ENCONTRADO');
    }
  };

  const { adapter, requests } = createFakeAdapter(route);
  const http = createApiClient({
    baseURL: 'http://api.test',
    tokenStore,
    adapter,
  });

  return {
    dependencies: createRemoteDependencies(http, tokenStore),
    tokenStore,
    requests,
    keepSignedIn: (guardianId: number) =>
      tokenStore.setRefreshToken(`refresh-${guardianId}-0`),
  };
}
