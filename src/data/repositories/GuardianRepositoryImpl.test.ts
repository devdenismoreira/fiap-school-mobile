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

  it('preserva a estrutura dos dados: alunos, dias, aulas, boletins e disciplinas', async () => {
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

      record.alunos.forEach((aluno, studentIndex) => {
        const student = guardian!.students[studentIndex];
        expect(student.schedule.map(d => [d.date, d.classes.length])).toEqual(
          aluno.agenda.map(d => [d.dia, d.aulas.length]),
        );
        expect(
          student.reportCards.map(r => [
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
      });
    }
  });
});
