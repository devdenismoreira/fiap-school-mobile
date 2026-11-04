import type { Guardian } from '@/domain/entities/Guardian';
import type { GuardianRepository } from '@/domain/repositories/GuardianRepository';
import type { GuardianDataSource } from '@/data/datasources/GuardianDataSource';
import { toGuardian } from '@/data/mappers/guardianMapper';

export class GuardianRepositoryImpl implements GuardianRepository {
  constructor(private readonly dataSource: GuardianDataSource) {}

  async findByCredentials(
    cpfDigits: string,
    password: string,
  ): Promise<Guardian | null> {
    const dto = await this.dataSource.signIn(cpfDigits, password);
    return dto ? toGuardian(dto) : null;
  }

  async findById(id: number): Promise<Guardian | null> {
    const dto = await this.dataSource.getById(id);
    return dto ? toGuardian(dto) : null;
  }
}
