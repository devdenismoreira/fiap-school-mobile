export type DisciplinaDTO = {
  nome: string;
  nota: number | null;
  faltas: number | null;
};

export type TrimestreDTO = {
  trimestre: number;
  disciplinas: DisciplinaDTO[];
};

export type BoletimDTO = {
  ano: string;
  turma: string;
  trimestres: TrimestreDTO[];
};

export type AulaDTO = {
  horario: string;
  disciplina: string;
};

export type DiaAgendaDTO = {
  dia: string;
  aulas: AulaDTO[];
};

export type AlunoDTO = {
  rm: number;
  turma: string;
  periodo: string;
  primeiroNome: string;
  sobrenome: string;
};

export type ResponsavelDTO = {
  id: number;
  primeiroNome: string;
  sobrenome: string;
  alunos: AlunoDTO[];
};

export type AgendaRespostaDTO = {
  agenda: DiaAgendaDTO[];
};

export type BoletinsRespostaDTO = {
  boletins: BoletimDTO[];
};
