/** Texto exibido quando o JSON traz `null` (não avaliado). */
export const NOT_EVALUATED = '-';

/** 9.5 → "9,5"; 8 → "8,0"; null → "-". */
export function formatGrade(grade: number | null): string {
  if (grade === null) {
    return NOT_EVALUATED;
  }
  return grade.toFixed(1).replace('.', ',');
}

/** 4 → "4"; null → "-". */
export function formatAbsences(absences: number | null): string {
  if (absences === null) {
    return NOT_EVALUATED;
  }
  return String(absences);
}
