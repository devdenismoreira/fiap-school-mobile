import type { ReportCard } from '@/domain/entities/ReportCard';
import type { ScheduleDay } from '@/domain/entities/Schedule';
import type { GuardianRepository } from '@/domain/repositories/GuardianRepository';

export type StudentRecords = {
  schedule: ScheduleDay[];
  reportCards: ReportCard[];
};

export type LoadStudentRecords = (rm: number) => Promise<StudentRecords>;

export function createLoadStudentRecords(
  guardians: GuardianRepository,
): LoadStudentRecords {
  return async rm => {
    const [schedule, reportCards] = await Promise.all([
      guardians.findStudentSchedule(rm),
      guardians.findStudentReportCards(rm),
    ]);
    return { schedule, reportCards };
  };
}
