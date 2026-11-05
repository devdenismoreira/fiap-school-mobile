export class TooManyAttemptsError extends Error {
  constructor() {
    super('Muitas tentativas');
    this.name = 'TooManyAttemptsError';
    Object.setPrototypeOf(this, TooManyAttemptsError.prototype);
  }
}
