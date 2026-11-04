import type { Guardian } from '../entities/Guardian';

export interface GuardianRepository {
  /** Retorna `null` para qualquer divergência, sem indicar qual campo falhou. */
  findByCredentials(cpfDigits: string, password: string): Promise<Guardian | null>;
  findById(id: number): Promise<Guardian | null>;
}
