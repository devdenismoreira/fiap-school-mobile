import type { ResponsavelDTO } from './dtos';

export interface GuardianDataSource {
  signIn(cpfDigits: string, password: string): Promise<ResponsavelDTO | null>;
  getById(id: number): Promise<ResponsavelDTO | null>;
}
