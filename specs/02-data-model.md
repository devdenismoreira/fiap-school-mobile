# 02 — Modelo de dados

> Status: **aprovada e implementada** (T03) · Fonte: JSON do desafio (37,9 KB), inspecionado em 2026-11-04 em `src/responsaveis.json` e movido para `src/data/datasources/local/responsaveis.json` (D-06). Desde 2026-11-05 fica fora do app, em `../FiapSchoolApi/prisma/data/responsaveis.json` (D-35); este documento descreve o modelo da época da entrega

Este documento **não** reproduz CPF, senha nem e-mail dos registros. Nomes e RMs aparecem porque já constam no Figma.

## 1. Estrutura do JSON (DTO)

Raiz: **array** de responsáveis.

```ts
type ResponsavelDTO = {
  id: number;
  cpf: string;            // 11 dígitos, sem máscara
  email: string;          // domínio example.com; não usado pelo app
  senha: string;          // texto puro; só para a autenticação simulada
  primeiroNome: string;
  sobrenome: string;
  alunos: AlunoDTO[];
};

type AlunoDTO = {
  rm: number;             // identificador único do aluno
  turma: string;          // ex.: "7EF", "2EM", "1EF"
  periodo: string;        // ex.: "Matutino", "Tarde"
  primeiroNome: string;
  sobrenome: string;
  agenda: DiaAgendaDTO[];
  boletim: BoletimDTO[];
};

type DiaAgendaDTO = {
  dia: string;            // data ISO "YYYY-MM-DD"
  aulas: AulaDTO[];       // pode ser vazio
};

type AulaDTO = {
  horario: string;        // "HH:MM - HH:MM"
  disciplina: string;     // nome exibível ("Matemática I")
};

type BoletimDTO = {
  ano: string;            // "2025" — string, não número
  turma: string;          // turma naquele ano (pode diferir de AlunoDTO.turma)
  trimestres: TrimestreDTO[];
};

type TrimestreDTO = {
  trimestre: number;      // 1, 2, 3
  disciplinas: DisciplinaDTO[];
};

type DisciplinaDTO = {
  nome: string;
  nota: number | null;    // inteiro (8) ou decimal (9.5); null = não avaliado
  faltas: number | null;  // inteiro; null = não avaliado
};
```

## 2. Relacionamentos

```text
Responsável 1 ── N Aluno
Aluno 1 ── N DiaAgenda 1 ── N Aula
Aluno 1 ── N Boletim (por ano) 1 ── N Trimestre 1 ── N Disciplina
```

## 3. Conteúdo observado (resumo, sem credenciais)

| Responsável (id) | Primeiro nome | Alunos |
|---|---|---|
| 1 | Gustavo | RM 12567 — Rafael da Silva — 7EF — Matutino · RM 12568 — Joana da Silva — 2EM — Matutino |
| 2 | Adelaide | RM 13752 — Bianca Silveira da Costa — 1EF — Tarde |

| Aluno | Agenda | Boletins |
|---|---|---|
| RM 12567 | 7 dias (2025-03-16 a 2025-03-22) | 2025/7EF: T1 avaliado, T2 e T3 `null` · 2024/6EF: T1–T3 avaliados |
| RM 12568 | 7 dias, mesmas datas | 2025/2EM: T1 avaliado, T2 e T3 `null` |
| RM 13752 | 7 dias, mesmas datas | 2025/1EF: T1 avaliado **com 11 disciplinas (sem "Arte")**, T2 e T3 `null` com 12 |

Observações:

1. As datas vão de **domingo 16/03/2025 a sábado 22/03/2025**. Domingo e sábado têm `aulas: []`; segunda a sexta têm 6 aulas cada.
2. Horários: Matutino 07:15–12:15, Tarde 13:15–18:15, com intervalo de 30 min após a 2ª aula. O intervalo não é um registro (D-08).
3. A mesma disciplina pode aparecer em aulas consecutivas, cada uma como item próprio (como no Figma).
4. Ordem das disciplinas no boletim é estável entre trimestres: Língua Portuguesa, Produção e Interpretação de Textos, Matemática I, Matemática II, Geografia, História, Ciências, Língua Inglesa, Arte, Projeto, Coding, Educação Física. O Figma usa essa mesma ordem.
5. No ano corrente, os trimestres 2 e 3 trazem `nota: null` e `faltas: null` — coerente com o enunciado ("o primeiro trimestre está avaliado").
6. CPFs são únicos e têm dígito verificador válido. RMs são únicos.
7. A ordem dos boletins no array é decrescente por ano (2025, 2024). Pela decisão D-01, a UI **respeita a ordem do JSON** e seleciona o primeiro boletim por padrão.

> Localização: hoje em `src/responsaveis.json`, colocado só para leitura. Na T03 ele passa a ser a fixture do datasource local em `src/data/datasources/local/responsaveis.json` (D-06).

## 4. Entidades de domínio

Sem `cpf`, `senha` e `email` — esses campos ficam restritos à camada de dados.

```ts
type Guardian = { id: number; firstName: string; lastName: string; students: Student[] };

type Student = {
  rm: number;
  className: string;      // turma
  shift: string;          // período (texto do JSON, sem enum)
  firstName: string;
  lastName: string;
  schedule: ScheduleDay[];
  reportCards: ReportCard[];
};

type ScheduleDay = { date: string /* YYYY-MM-DD */; classes: ClassSession[] };
type ClassSession = { time: string /* "HH:MM - HH:MM" */; subject: string };

type ReportCard = { year: string; className: string; terms: Term[] };
type Term = { number: number; subjects: SubjectGrade[] };
type SubjectGrade = { name: string; grade: number | null; absences: number | null };
```

Decisões:

- `shift` é `string`, não enum: só "Matutino" e "Tarde" aparecem, e não há lista fechada definida.
- `time` permanece string: a UI exibe o texto tal como vem; não há regra que exija parse.
- `date` permanece ISO string. A formatação pt-BR ("17 de março, segunda-feira") é feita por função pura que lê ano, mês e dia **sem** `new Date('YYYY-MM-DD')`, que interpreta como UTC e pode deslocar o dia da semana no fuso do Brasil.
- `grade`/`absences` preservam `null`. Nenhum valor é calculado, inferido ou preenchido.

## 5. Mapper (DTO → domínio)

Separação de responsabilidades:

1. **Fonte de dados** (na entrega, `GuardianLocalDataSource`; hoje a API faz isso): compara o CPF (11 dígitos exatos) e a senha, como um servidor, e devolve um `ResponsavelDTO` montado por lista explícita de campos, sem `cpf`, `senha` e `email`. Também devolve cópia profunda, simulando uma resposta serializada.
2. **Mapper** (`toGuardian`): renomeia toda a estrutura para o vocabulário do domínio, sem alterar valores, `null` ou ordem dos arrays.

Assim, as credenciais nunca chegam ao repositório, ao contexto ou à UI.

## 6. Persistência

| Chave | Valor | Observação |
|---|---|---|
| `@fiap-school/session` | `{ "version": 1, "guardianId": number, "selectedStudentRm": number | null }` | Sem CPF, senha, nome ou e-mail |

- `version` permite invalidar formatos antigos: versão desconhecida → sessão descartada.
- JSON inválido, tipos errados, responsável inexistente → sessão descartada (volta ao Login).
- RM inexistente para o responsável → usa o primeiro aluno e regrava.

## 7. Casos de borda a cobrir (mesmo que o JSON atual não os tenha)

| Caso | Comportamento |
|---|---|
| `agenda` vazia | Agenda mostra o estado vazio sem seletor de dia (ver `features/classes.md`) |
| `boletim` vazio | Boletim sem seletor de ano e sem trimestres (ver `features/report.md`) |
| Trimestre sem disciplinas | Acordeão abre sem itens |
| Disciplina ausente num trimestre | Não é exibida nesse trimestre (caso real: RM 13752, T1/2025, "Arte") |
| `nota`/`faltas` `null` | Exibir "-" |
| `nota` inteira | Exibir com uma casa decimal: `8` → "8,0" (Figma) |
| Responsável sem alunos | Não ocorre; ver `features/student-selection.md` |
