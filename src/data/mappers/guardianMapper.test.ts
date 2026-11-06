import type {
  BoletimDTO,
  DiaAgendaDTO,
  ResponsavelDTO,
} from '@/data/datasources/dtos';
import { toGuardian, toReportCard, toScheduleDay } from './guardianMapper';

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
    },
  ],
};

const agenda: DiaAgendaDTO[] = [
  { dia: '2025-03-16', aulas: [] },
  {
    dia: '2025-03-17',
    aulas: [
      { horario: '07:15 - 08:00', disciplina: 'Matemática I' },
      { horario: '08:00 - 08:45', disciplina: 'Matemática I' },
    ],
  },
];

const boletim: BoletimDTO[] = [
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
];

describe('toGuardian', () => {
  it('traduz o responsável e os alunos; agenda e boletim chegam depois, pelas rotas de alunos', () => {
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
          schedule: [],
          reportCards: [],
        },
      ],
    });
  });
});

describe('toScheduleDay', () => {
  it('traduz os dias na ordem, com dias sem aula e aulas repetidas', () => {
    const days = agenda.map(toScheduleDay);

    expect(days).toEqual([
      { date: '2025-03-16', classes: [] },
      {
        date: '2025-03-17',
        classes: [
          { time: '07:15 - 08:00', subject: 'Matemática I' },
          { time: '08:00 - 08:45', subject: 'Matemática I' },
        ],
      },
    ]);
    expect(days[1].classes).toHaveLength(2);
  });
});

describe('toReportCard', () => {
  it('traduz anos, trimestres e disciplinas e preserva null sem preencher valores', () => {
    const [current, previous] = boletim.map(toReportCard);

    expect(current.terms[0].subjects).toEqual([
      { name: 'Arte', grade: 8, absences: 0 },
      { name: 'Coding', grade: 9.5, absences: 2 },
    ]);
    expect(current.terms[1].subjects[0]).toEqual({
      name: 'Arte',
      grade: null,
      absences: null,
    });
    expect(previous).toEqual({ year: '2024', className: '6EF', terms: [] });
  });
});
