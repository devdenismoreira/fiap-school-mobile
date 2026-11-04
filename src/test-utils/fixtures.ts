import type { Guardian } from '../domain/entities/Guardian';
import type { Student } from '../domain/entities/Student';

export function makeStudent(overrides: Partial<Student> = {}): Student {
  return {
    rm: 100,
    className: '7EF',
    shift: 'Matutino',
    firstName: 'Rui',
    lastName: 'Teste',
    schedule: [],
    reportCards: [],
    ...overrides,
  };
}

export function makeGuardian(overrides: Partial<Guardian> = {}): Guardian {
  return {
    id: 1,
    firstName: 'Ana',
    lastName: 'Teste',
    students: [makeStudent({ rm: 100 }), makeStudent({ rm: 200, firstName: 'Bia' })],
    ...overrides,
  };
}
