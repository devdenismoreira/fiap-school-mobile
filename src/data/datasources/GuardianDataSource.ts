import type { ResponsavelDTO } from './dtos';

/**
 * Contrato da origem dos dados de responsáveis. Hoje é o JSON local;
 * uma implementação REST futura só precisa respeitar esta interface.
 */
export interface GuardianDataSource {
  /** Equivale a um POST de login: valida as credenciais e devolve o responsável sem elas. */
  signIn(cpfDigits: string, password: string): Promise<ResponsavelDTO | null>;
  getById(id: number): Promise<ResponsavelDTO | null>;
}
