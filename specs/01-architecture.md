# 01 — Arquitetura

> Status: **aprovada e implementada** (T01–T10)

## 1. Princípios

- Proporcional ao escopo: 4 telas, dados locais e um único "backend" simulado.
- Camadas com dependência num só sentido: `presentation → domain ← data`. `core`/`shared` são transversais.
- Repository Pattern para isolar o JSON local e permitir trocar por REST no futuro, sem criar API agora.
- Context API apenas para **sessão** e **aluno selecionado**. Estado de tela (dia escolhido, trimestres abertos, dropdown aberto) fica no ViewModel/hook da feature.
- Injeção manual de dependências num composition root. Sem container de DI, `BaseRepository` ou `BaseViewModel`.
- UseCase só onde há regra real: **autenticar** e **restaurar sessão**. Leitura de agenda e boletim é seleção de dados já carregados e fica em funções puras/hook.

## 2. Stack (versões efetivas)

| Item | Versão | Uso |
|---|---|---|
| React Native CLI | 0.88.1 (New Architecture + Hermes) | Base |
| React | 19.3.0 | |
| TypeScript | 6.0.3 (`@react-native/typescript-config`) | `strict` herdado do preset |
| @shopify/restyle | 2.4.5 | Tema, tokens, `Box`/`Text`, variantes |
| @react-navigation/native · native-stack · bottom-tabs | 7.5.1 · 7.21.0 · 7.21.0 | Navegação |
| react-native-screens · safe-area-context | 4.30.1 · 5.11.1 | Dependências da navegação |
| react-native-reanimated (+ react-native-worklets 0.13.x) | 4.7.1 | Animações |
| react-native-gesture-handler | 3.4.0 | Root view de gestos exigida pelo ecossistema |
| @react-native-async-storage/async-storage | 3.1.1 | Persistência mínima da sessão |
| Jest · @react-native/jest-preset | 29.7 · 0.88.1 | Testes |

Ajustes de configuração necessários (tarefa T01, aguardando aprovação):

1. Node ≥ 22.11 (exigência do `package.json`/RN 0.88). O nvm já tem 22.22.2 como padrão; adicionar `.nvmrc` com `22` para que `nvm use` e as ferramentas peguem a versão certa.
2. Declarar `react-native-worklets@0.13.x` em `dependencies`, para que o autolinking o inclua no build nativo.
3. Adicionar `react-native-worklets/plugin` ao `babel.config.js` (último plugin).
4. Envolver o app em `GestureHandlerRootView`.
5. `bundle install && bundle exec pod install` no iOS.
6. Vincular a fonte Montserrat (ver `03-design-system.md` §3).

## 3. Estrutura de pastas

```text
App.tsx                          → reexporta src/app/App (mantém index.js intacto)
src/
├── assets/
│   ├── icons/                   → SVGs exportados do Figma (react-native-svg)
│   ├── images/                  → logo, ilustração "no-classroom"
│   └── fonts/                   → Montserrat (T02)
├── app/
│   ├── App.tsx                  → monta providers + RootNavigator
│   ├── bootstrap/
│   │   └── dependencies.ts      → composition root (instancia datasource, repositórios, use cases)
│   └── providers/
│       ├── AppProviders.tsx     → GestureHandlerRootView, SafeAreaProvider, ThemeProvider, SessionProvider
│       └── SessionProvider.tsx  → contexto de sessão + useSession()
├── core/
│   ├── theme/                   → theme.ts (tokens Restyle), Box, Text, fonts
│   ├── storage/                 → keyValueStorage.ts (interface + AsyncStorage)
│   ├── errors/                  → InvalidCredentialsError
│   └── utils/                   → cpf.ts, formatDayLabel.ts, formatGrade.ts
├── domain/
│   ├── entities/                → Guardian, Student, ScheduleDay, ClassSession, ReportCard, Term, SubjectGrade
│   ├── repositories/            → GuardianRepository, SessionRepository (interfaces)
│   └── usecases/                → authenticateGuardian.ts, restoreSession.ts
├── data/
│   ├── datasources/             → GuardianDataSource.ts (contrato), dtos.ts (formato da "API")
│   │   └── local/               → responsaveis.json, GuardianLocalDataSource.ts
│   ├── mappers/                 → guardianMapper.ts (DTO PT → entidade EN)
│   └── repositories/            → GuardianRepositoryImpl.ts, AsyncStorageSessionRepository.ts
├── modules/
│   ├── auth/screens/LoginScreen/          → LoginScreen.tsx, .test, useLoginViewModel.ts, index.ts,
│   │                                        components/UnderlineInput/
│   ├── students/screens/StudentSelectionScreen/
│   ├── classes/screens/AgendaScreen/
│   └── report/screens/ReportScreen/
├── navigation/
│   ├── RootNavigator.tsx, MainTabs.tsx, navigationTheme.ts, types.ts
│   └── TabBar/
├── shared/
│   ├── components/                        → AppHeader/, Icon/, PrimaryButton/, TabScreenLayout/
│   └── hooks/                             → useKeyboardVisible.ts
└── test-utils/                            → fixtures, renderWithTheme, renderWithSession
```

**Convenção de pastas (decidida em 2026-11-04):**

- **Componentes e telas** ficam numa pasta própria: `Nome/Nome.tsx`, `Nome/Nome.test.tsx` e `Nome/index.ts` (`export * from './Nome'`). Os imports apontam para a pasta (`shared/components/AppHeader`).
- **Agrupamento por tela:** o ViewModel e os componentes exclusivos da tela ficam dentro da pasta dela (`LoginScreen/useLoginViewModel.ts`, `LoginScreen/components/`). O que é usado por mais de um módulo fica em `shared/`.
- **TypeScript puro** (utils, casos de uso, repositórios, entidades, hooks genéricos) e navegadores/configs ficam em arquivos planos, com o teste ao lado.
- Sem barrels agregados (`components/index.ts` exportando tudo), para evitar ciclos de import e lentidão no Jest.
- Estilos: props de token do Restyle no JSX e `StyleSheet` no fim do mesmo arquivo; não há `styles.ts` separado, porque mover tudo para StyleSheet perderia a checagem de tokens do Restyle.

## 4. Domínio e dados

- **Nomes**: identificadores de código em inglês (`Guardian`, `Student`, `ReportCard`); textos de UI em português. O mapper traduz o DTO (`ResponsavelDTO`) para entidades.
- **Credenciais não saem da fonte de dados.** O `GuardianLocalDataSource.signIn` faz a comparação como um servidor faria e devolve o responsável numa lista explícita de campos, sem `cpf`, `email` e `senha`.
- **O mapper se justifica** pela tradução PT → EN da estrutura inteira, preservando valores, `null` e ordem. Detalhes em `02-data-model.md`.
- **GuardianRepository** (interface no domínio):
  - `findByCredentials(cpfDigits: string, password: string): Promise<Guardian | null>`
  - `findById(id: number): Promise<Guardian | null>`
- **SessionRepository** (interface no domínio):
  - `load(): Promise<StoredSession | null>`
  - `save(session: StoredSession): Promise<void>`
  - `clear(): Promise<void>`
- **Use cases**:
  - `authenticateGuardian(cpfInput, password)`: normaliza o CPF, valida formato e dígito verificador, consulta o repositório e lança `InvalidCredentialsError` genérico em qualquer falha (não revela qual campo errou).
  - `restoreSession()`: lê a sessão salva, busca o responsável por id e valida se o aluno salvo ainda pertence a ele; senão cai para o primeiro aluno. Dados inválidos ou corrompidos → limpa e retorna `null`.
- O `Guardian` contém os alunos com agenda e boletins (como no JSON). Após o login tudo fica em memória, sem novas consultas. É o suficiente para o escopo; um cliente REST futuro pode reimplementar o repositório.
- **Simulação de dados (D-06)**: o JSON vira fixture da camada de dados. O `GuardianLocalDataSource` implementa o contrato `GuardianDataSource` como um cliente de API: `signIn` (equivale a um POST de login) e `getById`, assíncronos, devolvendo cópias serializadas. O `GuardianRepositoryImpl` só conhece o contrato; trocar por REST significa escrever outra implementação dele, sem mexer em domínio ou UI.
- **Latência (D-04)**: **800 ms** em `signIn`, igual para sucesso e falha, configurada no composition root (`signInLatencyMs`); 0 ms nos testes. `getById`, usado na restauração da sessão, não tem latência, para o app abrir sem atraso artificial.

## 5. Sessão (Context API)

```ts
type SessionState =
  | { status: 'restoring' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; guardian: Guardian; selectedStudentRm: number | null };

interface SessionContextValue {
  state: SessionState;
  selectedStudent: Student | null;        // derivado de guardian + rm
  signIn(cpf: string, password: string): Promise<void>; // lança InvalidCredentialsError
  selectStudent(rm: number): Promise<void>;
  signOut(): Promise<void>;
}
```

- Persistência: chave `@fiap-school/session` → `{ version: 1, guardianId: number, selectedStudentRm: number | null }`. **Nunca** CPF, senha ou nome.
- Falha de escrita no storage não derruba a sessão em memória: o app segue e a falha é tratada sem logar dados pessoais.

## 6. Navegação

```text
RootStack (native-stack, headerShown: false)
├── [signedOut] Login
└── [signedIn]
    ├── MainTabs (bottom-tabs, tabBar customizado)
    │   ├── Agenda
    │   └── Boletim
    └── StudentSelection  (presentation: 'card', animation: 'slide_from_bottom', animationDuration: 480, gestureEnabled: false)
```

- Status bar: `statusBarStyle: 'light'` nas `screenOptions` do RootStack. No iOS, `UIViewControllerBasedStatusBarAppearance` = YES faz as telas da `react-native-screens` controlarem a barra, e o `<StatusBar>` do `App` sozinho não basta. O `Modal` do dropdown herda o estilo da tela que o apresenta.
- `StudentSelection` era `fullScreenModal`. Virou `card` porque a transição do modal nativo do iOS não aceita duração e o fechamento ficava rápido demais (2026-11-04).

- `RootNavigator` lê `session.state.status`: `restoring` → tela preta vazia (D-14); `signedOut` → `Login`; `signedIn` → `MainTabs`. As telas são trocadas condicionalmente (padrão de auth flow do React Navigation), sem `navigate` manual após login/logout.
- **Desvio do `CLAUDE.md`**: não haverá `AuthNavigator` separado, pois o fluxo de auth tem uma única tela e um navigator a mais não traria benefício. Se surgir outra tela de auth, o grupo vira navigator.
- `StudentSelection` fica no RootStack, acima das abas. Ao fechar (FECHAR ou seleção), `goBack()` volta à aba de origem com o estado de navegação preservado.
- Tipos em `navigation/types.ts`: `RootStackParamList`, `MainTabParamList` e `CompositeScreenProps` para as abas.
- Cabeçalho (`AppHeader`) é componente compartilhado renderizado dentro do scroll de cada aba (D-10), não o header do navigator.

## 7. Erros

| Erro | Origem | Tratamento |
|---|---|---|
| `InvalidCredentialsError` | `authenticateGuardian` | Mensagem do Figma: "Usuário ou senha inválida. Pode tentar novamente?" |
| Falha inesperada no login | qualquer | Mesmo estado de erro visual, sem detalhes técnicos na UI |
| Sessão corrompida/inexistente | `restoreSession` | Limpa o storage e vai para Login |
| Aluno salvo inexistente | `restoreSession` | Seleciona o primeiro aluno do responsável |
| Responsável sem alunos | dados | Não ocorre no JSON; tratar defensivamente (ver `features/student-selection.md`) |

Logs: nenhum `console.log` com CPF, senha, nome ou e-mail.

## 8. Estratégia de testes

| Nível | Alvo |
|---|---|
| Unitário (funções puras) | `cpf.ts` (máscara, normalização, dígito verificador), `formatDayLabel`, `formatGrade`, `guardianMapper` |
| Unitário (use cases) | `authenticateGuardian` (válido, CPF inválido, senha errada, CPF com máscara), `restoreSession` (sem sessão, válida, corrompida, rm inexistente) |
| Componente (RNTL) | Login (botão habilitado/desabilitado, loading, erro, sucesso), Agenda (troca de dia, vazio), Boletim (troca de ano, acordeões, "-"), Seleção de aluno |
| Integração de navegação | Restauração → abas; logout → Login; trocar perfil → volta à aba de origem com dados novos |

Mocks: AsyncStorage (mock oficial do pacote), Reanimated (mock do pacote) e latência 0.

## 9. Trade-offs registrados

| Decisão | Ganho | Custo |
|---|---|---|
| Guardian com dados aninhados em memória | Simples, sem cache nem loading por tela | Se trocar por REST, o repositório e o contexto mudam |
| Sem `AuthNavigator` | Menos código | Desvia da sugestão do `CLAUDE.md` |
| Cabeçalho dentro do scroll | Fiel ao frame alto do Boletim | Ações do topo somem ao rolar |
| Formatação de data própria (tabelas pt-BR) | Determinística, testável, sem depender de `Intl` no Hermes/Android | Pequena tabela de meses/dias para manter |
| Latência simulada de 800 ms no login (D-04) | Torna visível o estado "carregando" do Figma | Comportamento artificial (configurável) |
| Normalizar desvios de 3–6 pt do Figma (D-12) | Alinhamento consistente | Única exceção à diretriz "Perfect Pixel"; reversível |
