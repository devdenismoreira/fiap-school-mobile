import type { Guardian } from '@/domain/entities/Guardian';
import type { GuardianRepository } from '@/domain/repositories/GuardianRepository';
import type { GuardianDataSource } from '@/data/datasources/GuardianDataSource';
import {
  toGuardian,
  toReportCard,
  toScheduleDay,
} from '@/data/mappers/guardianMapper';
import type { ReportCard } from '@/domain/entities/ReportCard';
import type { ScheduleDay } from '@/domain/entities/Schedule';

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

  async findStudentSchedule(rm: number): Promise<ScheduleDay[]> {
    const days = await this.dataSource.getSchedule(rm);
    return days.map(toScheduleDay);
  }

  async findStudentReportCards(rm: number): Promise<ReportCard[]> {
    const reportCards = await this.dataSource.getReportCards(rm);
    return reportCards.map(toReportCard);
  }
}
