/** Identificadores mínimos para restaurar a sessão. Nada de dados pessoais. */
export type StoredSession = {
  guardianId: number;
  /** `null` só se o responsável não tiver alunos (caso defensivo; não ocorre no JSON). */
  selectedStudentRm: number | null;
};
