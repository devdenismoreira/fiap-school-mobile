export class NetworkError extends Error {
  constructor() {
    super('Falha de conexão com a API');
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}
