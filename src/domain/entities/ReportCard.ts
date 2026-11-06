export type SubjectGrade = {
  name: string;
  grade: number | null;
  absences: number | null;
};

export type Term = {
  number: number;
  subjects: SubjectGrade[];
};

export type ReportCard = {
  year: string;
  className: string;
  terms: Term[];
};
