import type { Guardian } from '@/domain/entities/Guardian';
import type { ReportCard } from '@/domain/entities/ReportCard';
import type { ScheduleDay } from '@/domain/entities/Schedule';
import type { Student } from '@/domain/entities/Student';
import type {
  AlunoDTO,
  BoletimDTO,
  DiaAgendaDTO,
  ResponsavelDTO,
} from '@/data/datasources/dtos';

export function toScheduleDay(dto: DiaAgendaDTO): ScheduleDay {
  return {
    date: dto.dia,
    classes: dto.aulas.map(aula => ({
      time: aula.horario,
      subject: aula.disciplina,
    })),
  };
}

export function toReportCard(dto: BoletimDTO): ReportCard {
  return {
    year: dto.ano,
    className: dto.turma,
    terms: dto.trimestres.map(trimestre => ({
      number: trimestre.trimestre,
      subjects: trimestre.disciplinas.map(disciplina => ({
        name: disciplina.nome,
        grade: disciplina.nota,
        absences: disciplina.faltas,
      })),
    })),
  };
}

function toStudent(dto: AlunoDTO): Student {
  return {
    rm: dto.rm,
    className: dto.turma,
    shift: dto.periodo,
    firstName: dto.primeiroNome,
    lastName: dto.sobrenome,
    schedule: [],
    reportCards: [],
  };
}

export function toGuardian(dto: ResponsavelDTO): Guardian {
  return {
    id: dto.id,
    firstName: dto.primeiroNome,
    lastName: dto.sobrenome,
    students: dto.alunos.map(toStudent),
  };
}
