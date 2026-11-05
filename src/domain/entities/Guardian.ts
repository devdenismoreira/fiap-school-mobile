import type { Student } from './Student';

export type Guardian = {
  id: number;
  firstName: string;
  lastName: string;
  students: Student[];
};
