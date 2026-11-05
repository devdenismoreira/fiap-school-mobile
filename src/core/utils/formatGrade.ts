export const NOT_EVALUATED = '-';

export function formatGrade(grade: number | null): string {
  if (grade === null) {
    return NOT_EVALUATED;
  }
  return grade.toFixed(1).replace('.', ',');
}

export function formatAbsences(absences: number | null): string {
  if (absences === null) {
    return NOT_EVALUATED;
  }
  return String(absences);
}
