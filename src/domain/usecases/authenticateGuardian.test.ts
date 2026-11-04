import { InvalidCredentialsError } from '@/core/errors/InvalidCredentialsError';
import { makeGuardian } from '@/test-utils/fixtures';
import type { GuardianRepository } from '@/domain/repositories/GuardianRepository';
import { createAuthenticateGuardian } from './authenticateGuardian';

// CPF fictício com dígitos verificadores válidos (não pertence ao JSON).
const VALID_CPF = '52998224725';

function makeRepository(result = makeGuardian()): GuardianRepository {
  return {
    findByCredentials: jest.fn().mockResolvedValue(result),
    findById: jest.fn(),
  };
}

describe('authenticateGuardian', () => {
  it('normaliza o CPF mascarado e devolve o responsável', async () => {
    const repository = makeRepository();
    const authenticate = createAuthenticateGuardian(repository);

    await expect(authenticate('529.982.247-25', 'segredo')).resolves.toEqual(
      makeGuardian(),
    );
    expect(repository.findByCredentials).toHaveBeenCalledWith(
      VALID_CPF,
      'segredo',
    );
  });

  it('lança erro genérico quando as credenciais não conferem', async () => {
    const repository = makeRepository();
    (repository.findByCredentials as jest.Mock).mockResolvedValue(null);

    await expect(
      createAuthenticateGuardian(repository)(VALID_CPF, 'errada'),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it.each([
    ['dígito verificador inválido', '52998224724'],
    ['incompleto', '5299822472'],
    ['dígitos repetidos', '11111111111'],
  ])('rejeita CPF %s sem consultar os dados', async (_, cpf) => {
    const repository = makeRepository();

    await expect(
      createAuthenticateGuardian(repository)(cpf, 'segredo'),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(repository.findByCredentials).not.toHaveBeenCalled();
  });

  it('rejeita senha vazia sem consultar os dados', async () => {
    const repository = makeRepository();

    await expect(
      createAuthenticateGuardian(repository)(VALID_CPF, ''),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(repository.findByCredentials).not.toHaveBeenCalled();
  });
});
