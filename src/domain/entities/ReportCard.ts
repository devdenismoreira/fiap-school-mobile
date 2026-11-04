export type SubjectGrade = {
  name: string;
  /** `null` = não avaliado. Nunca é calculado nem preenchido. */
  grade: number | null;
  /** `null` = não avaliado. */
  absences: number | null;
};

export type Term = {
  number: number;
  subjects: SubjectGrade[];
};

export type ReportCard = {
  year: string;
  /** Turma do aluno naquele ano (pode diferir da turma atual). */
  className: string;
  terms: Term[];
};
