import type { ReportCard } from './ReportCard';
import type { ScheduleDay } from './Schedule';

export type Student = {
  rm: number;
  className: string;
  shift: string;
  firstName: string;
  lastName: string;
  schedule: ScheduleDay[];
  reportCards: ReportCard[];
};
