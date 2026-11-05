import type { AxiosInstance } from 'axios';

import { SessionExpiredError } from '@/core/errors/SessionExpiredError';
import { TooManyAttemptsError } from '@/core/errors/TooManyAttemptsError';
import { ApiError } from '@/core/http/apiErrors';
import type { TokenStore } from '@/core/storage/tokenStore';
import type { GuardianDataSource } from '@/data/datasources/GuardianDataSource';
import type { ResponsavelDTO } from '@/data/datasources/dtos';

export const LOGIN_PATH = '/v1/auth/login';
export const ME_PATH = '/v1/me';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  responsavel: ResponsavelDTO;
};

const hasStatus = (error: unknown, ...statuses: number[]) =>
  error instanceof ApiError && statuses.includes(error.status);

export class GuardianRemoteDataSource implements GuardianDataSource {
  constructor(
    private readonly http: AxiosInstance,
    private readonly tokens: TokenStore,
  ) {}

  async signIn(
    cpfDigits: string,
    password: string,
  ): Promise<ResponsavelDTO | null> {
    try {
      const { data } = await this.http.post<LoginResponse>(
        LOGIN_PATH,
        { cpf: cpfDigits, senha: password },
        { skipAuth: true },
      );
      await this.tokens.save({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return data.responsavel;
    } catch (error) {
      if (hasStatus(error, 400, 401)) {
        return null;
      }
      if (hasStatus(error, 429)) {
        throw new TooManyAttemptsError();
      }
      throw error;
    }
  }

  async getById(id: number): Promise<ResponsavelDTO | null> {
    try {
      const { data } = await this.http.get<ResponsavelDTO>(ME_PATH);
      return data.id === id ? data : null;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        return null;
      }
      if (hasStatus(error, 429)) {
        throw new TooManyAttemptsError();
      }
      throw error;
    }
  }
}
