import type { Guardian } from '@/domain/entities/Guardian';

export interface GuardianRepository {
  findByCredentials(
    cpfDigits: string,
    password: string,
  ): Promise<Guardian | null>;
  findById(id: number): Promise<Guardian | null>;
}
