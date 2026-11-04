/** Falha de login genérica: não indica se o CPF ou a senha está errado. */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Credenciais inválidas');
    this.name = 'InvalidCredentialsError';
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}
