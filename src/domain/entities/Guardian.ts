import type { Student } from './Student';

/** Responsável autenticado. Não contém CPF, senha nem e-mail. */
export type Guardian = {
  id: number;
  firstName: string;
  lastName: string;
  students: Student[];
};
