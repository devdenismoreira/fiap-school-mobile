import type { Guardian } from '@/domain/entities/Guardian';
import type { ReportCard } from '@/domain/entities/ReportCard';
import type { ScheduleDay } from '@/domain/entities/Schedule';

export interface GuardianRepository {
  findByCredentials(
    cpfDigits: string,
    password: string,
  ): Promise<Guardian | null>;
  findById(id: number): Promise<Guardian | null>;
  findStudentSchedule(rm: number): Promise<ScheduleDay[]>;
  findStudentReportCards(rm: number): Promise<ReportCard[]>;
}
