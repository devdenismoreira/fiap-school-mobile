import { InvalidCredentialsError } from './InvalidCredentialsError';

describe('InvalidCredentialsError', () => {
  it('é identificável por instanceof e não expõe qual campo falhou', () => {
    const error = new InvalidCredentialsError();

    expect(error).toBeInstanceOf(InvalidCredentialsError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('InvalidCredentialsError');
    expect(error.message).not.toMatch(/cpf|senha|password/i);
  });
});
