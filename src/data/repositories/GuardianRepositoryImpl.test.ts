import type { GuardianDataSource } from '@/data/datasources/GuardianDataSource';
import { fixtureGuardians, withoutCredentials } from '@/test-utils/fakeApi';
import { GuardianRepositoryImpl } from './GuardianRepositoryImpl';

const fixtureDataSource: GuardianDataSource = {
  signIn: async (cpf, password) => {
    const record = fixtureGuardians.find(
      r => r.cpf === cpf && r.senha === password,
    );
    return record ? withoutCredentials(record) : null;
  },
  getById: async id => {
    const record = fixtureGuardians.find(r => r.id === id);
    return record ? withoutCredentials(record) : null;
  },
  getSchedule: async rm =>
    fixtureGuardians.flatMap(g => g.alunos).find(a => a.rm === rm)?.agenda ??
    [],
  getReportCards: async rm =>
    fixtureGuardians.flatMap(g => g.alunos).find(a => a.rm === rm)?.boletim ??
    [],
};

describe('GuardianRepositoryImpl', () => {
  it('delega à fonte de dados e devolve a entidade mapeada', async () => {
    const dataSource: GuardianDataSource = {
      signIn: jest.fn().mockResolvedValue({
        id: 1,
        primeiroNome: 'Ana',
        sobrenome: 'Teste',
        alunos: [],
      }),
      getById: jest.fn().mockResolvedValue(null),
      getSchedule: jest.fn().mockResolvedValue([]),
      getReportCards: jest.fn().mockResolvedValue([]),
    };
    const repository = new GuardianRepositoryImpl(dataSource);

    await expect(
      repository.findByCredentials('52998224725', 'segredo'),
    ).resolves.toEqual({
      id: 1,
      firstName: 'Ana',
      lastName: 'Teste',
      students: [],
    });
    expect(dataSource.signIn).toHaveBeenCalledWith('52998224725', 'segredo');

    await expect(repository.findById(2)).resolves.toBeNull();
    expect(dataSource.getById).toHaveBeenCalledWith(2);
  });

  it('retorna null quando as credenciais não conferem', async () => {
    const repository = new GuardianRepositoryImpl(fixtureDataSource);

    await expect(
      repository.findByCredentials('52998224725', 'qualquer'),
    ).resolves.toBeNull();
  });

  it('preserva a estrutura dos dados: alunos pelo login e dias, aulas, boletins e disciplinas pelas rotas de alunos', async () => {
    const repository = new GuardianRepositoryImpl(fixtureDataSource);

    for (const record of fixtureGuardians) {
      const guardian = await repository.findByCredentials(
        record.cpf,
        record.senha,
      );

      expect(guardian?.id).toBe(record.id);
      expect(guardian?.students.map(s => s.rm)).toEqual(
        record.alunos.map(a => a.rm),
      );

      for (const aluno of record.alunos) {
        const schedule = await repository.findStudentSchedule(aluno.rm);
        const reportCards = await repository.findStudentReportCards(aluno.rm);

        expect(schedule.map(d => [d.date, d.classes.length])).toEqual(
          aluno.agenda.map(d => [d.dia, d.aulas.length]),
        );
        expect(
          reportCards.map(r => [
            r.year,
            r.className,
            r.terms.map(t => [t.number, t.subjects.map(s => s.name)]),
          ]),
        ).toEqual(
          aluno.boletim.map(b => [
            b.ano,
            b.turma,
            b.trimestres.map(t => [
              t.trimestre,
              t.disciplinas.map(d => d.nome),
            ]),
          ]),
        );
      }
    }
  });
});
