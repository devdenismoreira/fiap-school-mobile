import { InvalidCredentialsError } from '../../core/errors/InvalidCredentialsError';
import { isValidCpf, normalizeCpf } from '../../core/utils/cpf';
import type { Guardian } from '../entities/Guardian';
import type { GuardianRepository } from '../repositories/GuardianRepository';

export type AuthenticateGuardian = (
  cpfInput: string,
  password: string,
) => Promise<Guardian>;

/**
 * Normaliza o CPF e valida antes de consultar os dados. Qualquer falha gera o
 * mesmo erro genérico, sem indicar se o CPF ou a senha está errado.
 */
export function createAuthenticateGuardian(
  guardians: GuardianRepository,
): AuthenticateGuardian {
  return async (cpfInput, password) => {
    const cpf = normalizeCpf(cpfInput);
    if (!isValidCpf(cpf) || password.length === 0) {
      throw new InvalidCredentialsError();
    }

    const guardian = await guardians.findByCredentials(cpf, password);
    if (!guardian) {
      throw new InvalidCredentialsError();
    }
    return guardian;
  };
}
