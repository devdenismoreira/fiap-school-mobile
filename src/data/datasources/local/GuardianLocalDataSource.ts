import { onlyDigits } from '@/core/utils/cpf';
import type { GuardianDataSource } from '@/data/datasources/GuardianDataSource';
import type { ResponsavelDTO } from '@/data/datasources/dtos';
import responsaveis from './responsaveis.json';

export type ResponsavelRecord = ResponsavelDTO & {
  cpf: string;
  email: string;
  senha: string;
};

type Options = {
  signInLatencyMs?: number;
  records?: ResponsavelRecord[];
};

const defaultRecords: ResponsavelRecord[] = responsaveis;

function wait(ms: number): Promise<void> {
  return ms > 0
    ? new Promise(resolve => setTimeout(resolve, ms))
    : Promise.resolve();
}

function toResponse(record: ResponsavelRecord): ResponsavelDTO {
  const response: ResponsavelDTO = {
    id: record.id,
    primeiroNome: record.primeiroNome,
    sobrenome: record.sobrenome,
    alunos: record.alunos,
  };
  return JSON.parse(JSON.stringify(response));
}

export class GuardianLocalDataSource implements GuardianDataSource {
  private readonly signInLatencyMs: number;
  private readonly records: ResponsavelRecord[];

  constructor({ signInLatencyMs = 0, records = defaultRecords }: Options = {}) {
    this.signInLatencyMs = signInLatencyMs;
    this.records = records;
  }

  async signIn(
    cpfDigits: string,
    password: string,
  ): Promise<ResponsavelDTO | null> {
    await wait(this.signInLatencyMs);

    const record = this.records.find(
      item => onlyDigits(item.cpf) === cpfDigits && item.senha === password,
    );
    return record ? toResponse(record) : null;
  }

  async getById(id: number): Promise<ResponsavelDTO | null> {
    const record = this.records.find(item => item.id === id);
    return record ? toResponse(record) : null;
  }
}
