# FIAP School Mobile — Contexto do Projeto

## 1. Papel do Claude

Atue como engenheiro de software mobile sênior, parceiro de implementação e revisão técnica deste desafio.

Seu objetivo é ajudar a entregar um aplicativo consistente, funcional e bem acabado, respeitando os requisitos do desafio, o design do Figma e as decisões registradas neste repositório.

Não presuma requisitos nem invente dados, telas, regras de negócio ou comportamentos. Quando houver ambiguidade, registre-a e pergunte antes de tomar uma decisão que altere o escopo.

## 2. Informações do projeto

- **Projeto:** FIAP School Mobile
- **Objetivo:** aplicativo para responsáveis acompanharem as aulas diárias e o boletim anual de seus alunos.
- **Plataformas:** Android e iOS.
- **Repositório:** `github.com/devdenismoreira/fiap-school-mobile`, **privado** até o desenvolvedor concluir a revisão e torná-lo público; trabalho na branch `develop`.
- **Estado atual:**
  - tarefas T01–T15 implementadas e validadas em aparelho (`tasks/README.md`): T01–T10 são a entrega; T11 integra a API, T12 o toast, T13 as rotas de alunos, T14 os estados vazios e T15 a abertura e os ajustes de experiência;
  - a API (`../FiapSchoolApi`) está em produção na Railway, e o app usa só ela (D-35, D-37, D-38).

  Valide o estado real do repositório antes de alterar arquivos.
- **Figma:** consultado pelo MCP oficial do Figma. Os assets já foram exportados para `src/assets/` (D-16).

### Link do Figma

`FIGMA_FILE_URL=https://www.figma.com/design/YBBIc9PlBhxcLuHTOi4V9p/Teste-T%C3%A9cnico-Mobile---FIAP--Copy-?node-id=4001-2`

Não tente localizar outro arquivo por conta própria nem assuma que a conexão MCP garante acesso ao documento. Se o acesso falhar, avise o desenvolvedor.

### Dados JSON do desafio

O desafio fornece um JSON com responsáveis (CPF, senha, nome), alunos, agenda e boletins.
- **Até a entrega**, ele ficava no app, servido por um datasource local que simulava uma API com 800 ms de latência (D-04, D-06).
- **Desde 2026-11-05 (D-35)**, o app usa só a API, e o JSON foi movido para o repositório dela, onde alimenta o seed: `CHALLENGE_JSON_PATH=../FiapSchoolApi/prisma/data/responsaveis.json`.
- **Nos testes do app**, entra um fixture anonimizado (`src/test-utils/fixtures/responsaveis.json`): mesma agenda e boletins, com nomes, RMs e e-mails fictícios e CPFs sintéticos. A API simulada `createFakeApi` (`src/test-utils/fakeApi.ts`) usa esse fixture.

Não invente credenciais, nomes, RM, turmas, aulas, notas ou estrutura JSON. Não copie CPFs ou senhas para docs ou testes. O código de produção nunca importa JSON de dados nem `src/test-utils`.

## 3. Requisitos funcionais conhecidos

O aplicativo deve contemplar:

1. **Login**
   - Autenticação pela FIAP School API, que usa os dados do JSON fornecido (seed). Na entrega era simulada localmente.
   - Entrada de CPF e senha.
   - Máscara e normalização de CPF.
   - Persistência da sessão para que o responsável não precise autenticar novamente ao reabrir o app.
   - Estados de carregamento, erro e sucesso.

2. **Identificação do responsável e aluno**
   - Exibir os dados relevantes do responsável.
   - Exibir aluno selecionado, RM, turma e período, conforme os dados disponíveis.
   - Não inventar campos que não existam no JSON ou no Figma.

3. **Aulas**
   - Exibir aulas organizadas por dia da semana.
   - Permitir navegar entre os dias disponíveis conforme o design e os dados reais.
   - Tratar dias sem aulas e dados ausentes.

4. **Boletim**
   - Exibir o boletim anual de 2025.
   - O primeiro trimestre está avaliado, conforme o enunciado.
   - Os demais períodos devem refletir exclusivamente os dados fornecidos.
   - Não calcular, inferir ou preencher notas sem regra explícita.

5. **Seleção de aluno**
   - Permitir selecionar outro aluno vinculado ao responsável.
   - A seleção deve ser acessível fora das abas principais.
   - Após selecionar, retornar à tela anterior e atualizar os dados exibidos.
   - Preservar o contexto de navegação sempre que possível.

6. **Experiência**
   - Todas as telas devem contemplar animações/transições adequadas.
   - Animações devem ser discretas, consistentes e não prejudicar acessibilidade ou desempenho.

## 4. Stack e restrições

### Obrigatório / direcionamento

- React Native CLI (não Expo).
- TypeScript.
- Shopify Restyle para estilização e design system.
- Android e iOS.
- Git e documentação no README.
- Spec-Driven Development (SDD).
- Arquivos de configuração/contexto de IA no repositório.

### Bibliotecas a considerar

Verifique primeiro o `package.json` e a versão efetiva do React Native. Não instale versões incompatíveis.

- React Navigation: navegação nativa, stack e bottom tabs.
- React Native Reanimated: animações.
- React Native Gesture Handler: gestos, se necessário pela navegação ou interação.
- React Native Safe Area Context e React Native Screens: dependências usuais do ecossistema de navegação.
- AsyncStorage: persistência não sensível da sessão.
- Jest e React Native Testing Library: testes.

Não adicione bibliotecas por conveniência sem justificar a necessidade. Não adicione Firebase nem crie uma API/backend dentro deste repositório: a API fica em repositório próprio.

Depois da entrega, a API passou a existir em repositório próprio (`../FiapSchoolApi`, Express + Prisma). O contrato dela está em `../FiapSchoolApi/specs/03-api-contract.md`. Mudanças em `GuardianDataSource`, nos DTOs ou no `toGuardian` exigem atualizar esse contrato.

### Versões em uso

| Pacote | Versão |
|---|---|
| React Native (New Architecture, Hermes) | 0.88.1 |
| React | 19.3.0 |
| TypeScript (`strict`) | 6.0 |
| Shopify Restyle | 2.4 |
| React Navigation (native-stack, bottom-tabs) | 7 |
| react-native-screens | 4.30 |
| React Native Reanimated | 4.7 |
| react-native-worklets | 0.13 |
| Gesture Handler | 3.4 |
| Safe Area Context | 5.11 |
| AsyncStorage | 3.1 |
| react-native-svg | 15.16 |
| Axios (versão fixa) | 1.20.0 |
| react-native-keychain | 10.0 |
| @react-native-community/netinfo (versão fixa) | 12.0.1 |
| react-native-bootsplash (versão fixa) | 7.3.3 |
| Jest | 29 |
| React Native Testing Library | 14 |

Ambiente: Node 22 (`.nvmrc`; rode `nvm use` antes dos comandos) e Yarn 1.22 (`packageManager`).

## 5. Arquitetura recomendada

Adote uma arquitetura pragmática, com separação clara de responsabilidades, sem criar abstrações desnecessárias.

- **Presentation:** telas, componentes de feature e ViewModels/hooks de apresentação.
- **Domain:** entidades, contratos de repositório e casos de uso que representem regras reais.
- **Data:** acesso à API (Axios), fontes de dados e implementações dos repositórios.
- **Core:** tema, armazenamento, erros e utilitários transversais.
- **Shared:** componentes e hooks realmente reutilizados.
- **App:** composição de dependências, providers e inicialização.
- **Navigation:** configuração dos navegadores e tipos de rotas.

Estrutura de referência (adapte ao projeto existente; não recrie o projeto do zero):

```text
src/
├── app/
│   ├── providers/
│   └── bootstrap/
├── core/
│   ├── theme/
│   ├── storage/
│   ├── errors/
│   └── utils/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
├── data/
│   ├── datasources/
│   │   └── remote/
│   ├── repositories/
│   └── mappers/
├── modules/
│   ├── auth/
│   ├── students/
│   ├── classes/
│   └── report/
├── navigation/
└── shared/
    ├── components/
    └── hooks/
```

Regras:
- Use Repository Pattern para isolar a origem local dos dados e permitir substituição futura por REST sem criar uma API agora.
- Use Context API para sessão e aluno selecionado, se isso atender à complexidade real.
- Mantenha estado específico de tela no ViewModel/hook da feature.
- Faça injeção manual de dependências no composition root; não adicione container de DI.
- Não crie UseCase para operações triviais sem regra de negócio.
- Não crie BaseRepository, BaseViewModel ou camadas genéricas sem benefício concreto.
- Não crie mappers se não houver transformação real.
- Evite duplicação, mas não transforme cada pequeno elemento em abstração global.

Convenções adotadas:
- **Pastas:**
  - uma pasta por componente ou tela: `Nome/Nome.tsx`, `Nome.test.tsx` e `index.ts`;
  - o ViewModel (`use<Tela>ViewModel.ts`) e os componentes exclusivos (`components/`) ficam junto da tela.
- Sem arquivos `styles.ts`. O estilo vem das props do Restyle e, quando necessário, de um `StyleSheet.create` no fim do arquivo.
- Imports pelo alias `@/` (→ `src/`).
- Utilitários de teste em `src/test-utils/` (`renderWithTheme`, `renderWithSession`, `fixtures`).

## 6. Segurança e persistência

- A autenticação é da API (bcrypt, JWT, refresh rotativo). O refresh token fica só no Keychain e o access token só em memória.
- Os logins de demonstração do README são dados fictícios do desafio, com senhas fracas de propósito; não use em produção.
- Nunca armazene senha em AsyncStorage ou em qualquer armazenamento persistente.
- Persista apenas os identificadores mínimos necessários para restaurar a sessão, conforme a estrutura real dos dados.
- Não registre CPF, senha ou dados pessoais em logs.
- Normalize o CPF para comparação, preservando a máscara apenas na interface.
- Trate erros de credenciais sem revelar se CPF ou senha isoladamente estão corretos, salvo se o enunciado determinar outra regra.
- Não inclua credenciais reais em commits, documentação pública ou arquivos de configuração.

## 7. Navegação recomendada

- `RootNavigator`: decide entre fluxo autenticado e não autenticado após restauração da sessão.
- `AuthNavigator`: fluxo de login.
- `MainNavigator`: área autenticada.
- Bottom tabs para Aulas e Boletim, conforme o Figma.
- Seleção de aluno em uma rota de stack acima das abas, para permitir retorno à tela anterior.
- Tipar parâmetros de rotas em TypeScript.
- Evitar duplicar estado de aluno selecionado em diferentes telas.

A navegação final deve seguir o Figma e os requisitos efetivos.

Implementação atual (`specs/01-architecture.md` §6):
- `RootNavigator` (native-stack) troca as telas pelo estado da sessão. Não há `AuthNavigator`, porque o fluxo de login tem uma única tela.
- `MainTabs` (bottom-tabs com `TabBar` próprio) mantém a `AppActionBar` fixa acima das abas.
- `StudentSelection` fica acima das abas como rota empilhada que sobe de baixo (`presentation: 'card'`, `slide_from_bottom`).

## 8. Design system e fidelidade ao Figma

Use Restyle para centralizar:
- cores;
- tipografia;
- espaçamentos;
- raios;
- variantes de componentes;
- temas e tokens necessários.

Antes de implementar as telas:
1. Inspecione o arquivo do Figma via MCP.
2. Liste páginas, frames e fluxos.
3. Extraia tokens e propriedades visuais.
4. Identifique componentes reutilizáveis.
5. Registre estados, interações e animações visíveis.
6. Compare o design com o enunciado e o JSON.
7. Registre lacunas e ambiguidades.

Não invente medidas ou estilos quando o Figma puder ser consultado. Se um detalhe não estiver disponível, documente a suposição e peça validação quando relevante.

Priorize fidelidade visual, hierarquia, alinhamento, espaçamento, legibilidade, responsividade e acessibilidade. Não adicione ícones decorativos grandes ou elementos que não estejam justificados pelo design.

## 9. Animações

Use Reanimated quando fizer sentido e estiver compatível com a versão instalada.
- Prefira transições curtas e consistentes.
- Respeite redução de movimento quando possível.
- Não anime tudo indiscriminadamente.
- Evite animações que atrasem ações ou dificultem testes.
- Documente quais interações terão animação e por quê.

Os tokens ficam em `src/core/theme/motion.ts` e os presets em `src/shared/animations.ts`. A tabela de interações animadas está em `specs/03-design-system.md` §8. Reutilize os presets e use `ReduceMotion.System` em toda animação.

## 10. Qualidade e testes

Priorize testes para:
- normalização e validação de CPF;
- autenticação válida e inválida;
- restauração e encerramento de sessão;
- seleção e troca de aluno;
- exibição e navegação dos dias de aula;
- apresentação do boletim e regras dos períodos;
- estados vazios e dados incompletos;
- navegação essencial.

Execute e reporte os comandos disponíveis no projeto, como:
- lint;
- TypeScript/typecheck;
- testes;
- build Android;
- build iOS, quando o ambiente permitir.

Não afirme que algo foi validado sem executar o comando correspondente. Registre limitações do ambiente.

Comandos: `yarn typecheck`, `yarn lint` e `yarn test`. Builds nativos (`yarn ios`, `yarn android` e variantes) e emulador/simulador só quando o desenvolvedor pedir. Não fique acompanhando builds longos.

## 11. SDD — Spec-Driven Development

Trabalhe em ciclos curtos:

1. **Specify:** documentar comportamento, requisitos, critérios de aceite, estados e casos de borda.
2. **Plan:** decompor em tarefas pequenas, dependências e estratégia de validação.
3. **Implement:** implementar somente o escopo aprovado.
4. **Validate:** executar testes, análise estática e validação visual/funcional.
5. **Review:** revisar arquitetura, qualidade, acessibilidade, segurança e aderência ao Figma.

Organize os artefatos em `specs/` e `tasks/`. Atualize as especificações quando decisões forem alteradas. Não trate documentação como substituta de testes.

No Claude Code, o ciclo está nos comandos `/specify`, `/plan`, `/implement`, `/validate` e `/review` (`.claude/commands/`). Eles delegam aos agentes de `.claude/agents/` (ver §16).

## 12. Organização de tarefas sugerida

1. Fundação do projeto e diagnóstico da configuração existente.
2. Análise do Figma e do JSON; design system.
3. Modelagem de domínio e camada de dados local.
4. Autenticação e persistência de sessão.
5. Seleção de aluno.
6. Aulas.
7. Boletim.
8. Animações, estados e refinamento visual.
9. Testes, validação Android/iOS e README.

A ordem pode mudar após a inspeção dos arquivos e do projeto. O plano executado está em `tasks/README.md` (T01–T15).

## 13. Padrões de código e colaboração

- TypeScript estrito sempre que viável; evite `any`.
- Componentes pequenos, com responsabilidades claras.
- Nomes claros e consistentes.
- Não faça refatorações fora do escopo sem explicar o motivo.
- Não sobrescreva configurações nativas ou scripts sem inspecioná-los.
- Antes de adicionar uma dependência, explique a necessidade, compatibilidade e alternativa.
- Não altere arquivos de plataforma em massa.
- Não execute comandos destrutivos sem explicar o impacto e obter confirmação.
- Não faça commit ou push sem solicitação explícita.
- Ao concluir uma etapa, informe arquivos alterados, decisões, comandos executados, resultados e pendências.
- Seja objetivo e técnico; explique trade-offs relevantes.
- Não use `useMemo`/`useCallback` indiscriminadamente.
- Siga os padrões existentes no repositório quando forem razoáveis.
- Não escreva comentários no código. As decisões vão para specs, tasks ou README. Ficam apenas comentários de configuração (`jest.setup.ts`, configs, `.d.ts`, arquivos nativos) e diretivas (`eslint-disable`, `@ts-expect-error`).
- Responda, pergunte e documente em português.
- Commits:
  - Conventional Commits, com tipo e escopo em inglês e mensagem em português (ex.: `feat(report): ...`);
  - um commit por funcionalidade, com os próprios testes;
  - quando um arquivo mistura assuntos, monte o índice em etapas.
- Nunca faça push automaticamente, mesmo depois de um commit autorizado.
- A URL da API é única (D-37, `src/core/config/apiConfig.ts`): não crie variável de ambiente nem alternativa por plataforma. Mudanças locais nesse arquivo ficam fora dos commits.

## 14. Critérios de entrega

A entrega deve:
- executar em Android e iOS;
- cumprir os fluxos e requisitos do desafio;
- apresentar fidelidade ao Figma;
- usar React Native CLI, TypeScript e Restyle;
- ter arquitetura compreensível e proporcional ao escopo;
- tratar erros, loading e estados vazios;
- incluir testes relevantes;
- incluir README com pré-requisitos, instalação, execução, dados de teste, arquitetura e testes;
- conter documentação SDD e arquivos de contexto de IA exigidos.

## 15. Primeira ação obrigatória

Ao iniciar uma sessão:
1. Leia este arquivo integralmente.
2. Inspecione o estado real do repositório (`git status`, `package.json`, estrutura de pastas e configuração nativa).
3. Não presuma que o projeto esteja limpo ou que dependências estejam instaladas.
4. Leia as specs e a tarefa da área que vai mudar, incluindo as decisões D-xx em `specs/00-project-overview.md` §6.
5. Para escopo novo, siga o ciclo SDD: `/specify` → aprovação → `/plan` → aprovação → `/implement` → `/validate` → `/review`.
6. Não implemente nada até o desenvolvedor aprovar a spec e o plano.

## 16. Configuração do Claude Code

| Arquivo | Função |
|---|---|
| `CLAUDE.md` | Contexto, regras e convenções do projeto (este arquivo) |
| `.claude/agents/architect.md` | Specify e Plan: specs e tarefas a partir de Figma, JSON e enunciado; não edita código |
| `.claude/agents/mobile-developer.md` | Implement: código e testes de uma tarefa aprovada |
| `.claude/agents/test-engineer.md` | Validate: testes dos critérios de aceite e casos de borda |
| `.claude/agents/code-reviewer.md` | Review: revisão do diff, somente leitura |
| `.claude/commands/*.md` | `/specify`, `/plan`, `/implement`, `/validate`, `/review` |
| `.claude/settings.json` | Permissões compartilhadas (detalhadas abaixo) |
| `AI_USAGE.md` | Como a IA foi usada no desenvolvimento e como as respostas foram validadas |

Permissões do `.claude/settings.json`:
- **Liberado:** typecheck, lint, testes, leitura do git e leitura do Figma.
- **Pede confirmação:** commit, push, dependências, builds e pods.
- **Bloqueado:** push forçado, `git reset --hard`, `git clean` e arquivos `.env`.

Configurações pessoais ficam em `.claude/settings.local.json`, ignorado pelo git.
