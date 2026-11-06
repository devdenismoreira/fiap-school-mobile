export class SessionExpiredError extends Error {
  constructor() {
    super('Sessão expirada ou revogada');
    this.name = 'SessionExpiredError';
    Object.setPrototypeOf(this, SessionExpiredError.prototype);
  }
}
