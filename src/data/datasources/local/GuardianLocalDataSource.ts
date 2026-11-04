import { onlyDigits } from '../../../core/utils/cpf';
import type { GuardianDataSource } from '../GuardianDataSource';
import type { ResponsavelDTO } from '../dtos';
import responsaveis from './responsaveis.json';

/** Registro bruto do JSON, com credenciais. Não sai deste arquivo. */
export type ResponsavelRecord = ResponsavelDTO & {
  cpf: string;
  email: string;
  senha: string;
};

type Options = {
  /** Latência simulada do login, em ms. 0 nos testes. */
  signInLatencyMs?: number;
  records?: ResponsavelRecord[];
};

const defaultRecords: ResponsavelRecord[] = responsaveis;

function wait(ms: number): Promise<void> {
  return ms > 0
    ? new Promise(resolve => setTimeout(resolve, ms))
    : Promise.resolve();
}

/** Lista explícita de campos públicos + cópia profunda, como uma resposta serializada de API. */
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
    // A latência vale para sucesso e falha, sem diferença de tempo entre os casos.
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
