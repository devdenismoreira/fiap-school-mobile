import type { ResponsavelDTO } from '@/data/datasources/dtos';
import { toGuardian } from './guardianMapper';

const dto: ResponsavelDTO = {
  id: 7,
  primeiroNome: 'Ana',
  sobrenome: 'Teste',
  alunos: [
    {
      rm: 100,
      turma: '7EF',
      periodo: 'Matutino',
      primeiroNome: 'Rui',
      sobrenome: 'Teste',
      agenda: [
        { dia: '2025-03-16', aulas: [] },
        {
          dia: '2025-03-17',
          aulas: [
            { horario: '07:15 - 08:00', disciplina: 'Matemática I' },
            { horario: '08:00 - 08:45', disciplina: 'Matemática I' },
          ],
        },
      ],
      boletim: [
        {
          ano: '2025',
          turma: '7EF',
          trimestres: [
            {
              trimestre: 1,
              disciplinas: [
                { nome: 'Arte', nota: 8, faltas: 0 },
                { nome: 'Coding', nota: 9.5, faltas: 2 },
              ],
            },
            {
              trimestre: 2,
              disciplinas: [{ nome: 'Arte', nota: null, faltas: null }],
            },
          ],
        },
        { ano: '2024', turma: '6EF', trimestres: [] },
      ],
    },
  ],
};

describe('toGuardian', () => {
  it('traduz todos os campos do DTO para a entidade de domínio', () => {
    expect(toGuardian(dto)).toEqual({
      id: 7,
      firstName: 'Ana',
      lastName: 'Teste',
      students: [
        {
          rm: 100,
          className: '7EF',
          shift: 'Matutino',
          firstName: 'Rui',
          lastName: 'Teste',
          schedule: [
            { date: '2025-03-16', classes: [] },
            {
              date: '2025-03-17',
              classes: [
                { time: '07:15 - 08:00', subject: 'Matemática I' },
                { time: '08:00 - 08:45', subject: 'Matemática I' },
              ],
            },
          ],
          reportCards: [
            {
              year: '2025',
              className: '7EF',
              terms: [
                {
                  number: 1,
                  subjects: [
                    { name: 'Arte', grade: 8, absences: 0 },
                    { name: 'Coding', grade: 9.5, absences: 2 },
                  ],
                },
                {
                  number: 2,
                  subjects: [{ name: 'Arte', grade: null, absences: null }],
                },
              ],
            },
            { year: '2024', className: '6EF', terms: [] },
          ],
        },
      ],
    });
  });

  it('preserva null sem preencher valores e mantém aulas repetidas', () => {
    const [student] = toGuardian(dto).students;

    expect(student.reportCards[0].terms[1].subjects[0]).toEqual({
      name: 'Arte',
      grade: null,
      absences: null,
    });
    expect(student.schedule[1].classes).toHaveLength(2);
  });
});
