import type { BoletimDTO, DiaAgendaDTO, ResponsavelDTO } from './dtos';

export interface GuardianDataSource {
  signIn(cpfDigits: string, password: string): Promise<ResponsavelDTO | null>;
  getById(id: number): Promise<ResponsavelDTO | null>;
  getSchedule(rm: number): Promise<DiaAgendaDTO[]>;
  getReportCards(rm: number): Promise<BoletimDTO[]>;
}
