import { formatCpf, onlyDigits } from '../../../core/utils/cpf';
import { GuardianLocalDataSource } from './GuardianLocalDataSource';
import responsaveis from './responsaveis.json';

// Credenciais lidas do fixture em tempo de execução; nunca escritas no teste.
const [first] = responsaveis;
const cpf = onlyDigits(first.cpf);
const password = first.senha;

describe('GuardianLocalDataSource', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('devolve o responsável sem credenciais quando CPF e senha conferem', async () => {
    const result = await new GuardianLocalDataSource().signIn(cpf, password);

    expect(result?.id).toBe(first.id);
    expect(result?.alunos).toHaveLength(first.alunos.length);
    expect(result).not.toHaveProperty('cpf');
    expect(result).not.toHaveProperty('senha');
    expect(result).not.toHaveProperty('email');
    expect(JSON.stringify(result)).not.toContain(first.cpf);
    expect(JSON.stringify(result)).not.toContain(first.email);
  });

  it('retorna null com senha errada', async () => {
    const result = await new GuardianLocalDataSource().signIn(
      cpf,
      `${password}x`,
    );
    expect(result).toBeNull();
  });

  it('retorna null para CPF inexistente', async () => {
    const result = await new GuardianLocalDataSource().signIn(
      '52998224725',
      password,
    );
    expect(result).toBeNull();
  });

  it('só aceita o CPF já normalizado (11 dígitos exatos)', async () => {
    const dataSource = new GuardianLocalDataSource();

    await expect(dataSource.signIn(formatCpf(cpf), password)).resolves.toBeNull();
    await expect(dataSource.signIn(`${cpf}0`, password)).resolves.toBeNull();
  });

  it('busca por id sem expor credenciais', async () => {
    const dataSource = new GuardianLocalDataSource();

    const found = await dataSource.getById(first.id);
    expect(found?.primeiroNome).toBe(first.primeiroNome);
    expect(found).not.toHaveProperty('senha');

    await expect(dataSource.getById(999)).resolves.toBeNull();
  });

  it('devolve cópias independentes, como uma resposta serializada', async () => {
    const dataSource = new GuardianLocalDataSource();

    const firstResponse = await dataSource.getById(first.id);
    firstResponse!.alunos[0].primeiroNome = 'Alterado';

    const secondResponse = await dataSource.getById(first.id);
    expect(secondResponse!.alunos[0].primeiroNome).toBe(
      first.alunos[0].primeiroNome,
    );
  });

  it('aplica a latência do login tanto no sucesso quanto na falha', async () => {
    jest.useFakeTimers();
    const dataSource = new GuardianLocalDataSource({ signInLatencyMs: 800 });

    for (const attempt of [password, `${password}x`]) {
      let settled = false;
      const promise = dataSource.signIn(cpf, attempt).then(result => {
        settled = true;
        return result;
      });

      await jest.advanceTimersByTimeAsync(799);
      expect(settled).toBe(false);

      await jest.advanceTimersByTimeAsync(1);
      expect(settled).toBe(true);
      await promise;
    }
  });

  it('não aplica latência na busca por id (restauração de sessão)', async () => {
    jest.useFakeTimers();
    const dataSource = new GuardianLocalDataSource({ signInLatencyMs: 800 });

    await expect(dataSource.getById(first.id)).resolves.not.toBeNull();
  });
});
