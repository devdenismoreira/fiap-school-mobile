# T11 — Integração com a FIAP School API

**Depende de:** T10 (entrega) e a API rodando (`../FiapSchoolApi`, T09 de lá) · **Branch:** `feature/integrate-api` · **Specs:** `features/api-integration.md`, D-17 a D-26, `../FiapSchoolApi/specs/03-api-contract.md`

## Objetivo

Trocar o `GuardianLocalDataSource` pelo `GuardianRemoteDataSource`, com tokens seguros, renovação compartilhada e mensagens de conexão, sem mudar o domínio, os DTOs, o `toGuardian` nem as telas de Agenda, Boletim e Mudança de aluno.

## Escopo (em ordem de dependência)

1. **Dependências** (pedem aprovação):
   - `axios@1.20.0` (versão fixa) e `react-native-keychain@10.0.0`;
   - `babel-plugin-transform-inline-environment-variables` (desenvolvimento);
   - `yarn ios:pods`.

   O rebuild nativo nos dois sistemas fica com o desenvolvedor.
2. **Configuração:**
   - `babel.config.js` com o plugin limitado a `API_URL`;
   - `src/core/config/apiConfig.ts`: `API_URL` → padrão por plataforma em debug → recusa release sem `https://`.
3. **Erros:** `NetworkError`, `TooManyAttemptsError` e `SessionExpiredError` em `src/core/errors/`, no padrão do `InvalidCredentialsError`.
4. **Tokens:**
   - `src/core/storage/tokenStore.ts`: interface `TokenStore` e implementação com o refresh no Keychain (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`) e o access em memória;
   - mock do `react-native-keychain` no `jest.setup.ts`.
5. **HTTP:**
   - `src/core/http/apiErrors.ts`: normaliza as falhas;
   - `src/core/http/apiClient.ts`:
     - instância do Axios (timeout de 20 s);
     - interceptador de requisição (Bearer e renovação antecipada);
     - interceptador de resposta (401 `TOKEN_EXPIRADO` → renovação compartilhada → repete uma vez);
     - rotas de autenticação fora da renovação.
6. **Dados:**
   - `src/data/datasources/remote/GuardianRemoteDataSource.ts`, que implementa a mesma `GuardianDataSource` (spec §3.1–3.2);
   - `src/data/datasources/remote/remoteSession.ts` com `endSession()` (logout em melhor esforço com timeout de 5 s e limpeza dos tokens).
7. **Composição e sessão:**
   - `createDependencies()` passa a usar o remoto;
   - `createLocalDependencies()` passa a ser usado pelo `App.test`;
   - `SessionDependencies.endSession`;
   - `SessionProvider`: estado `unreachable`, `retryRestore()`, `endSession` no `signOut` e na restauração sem sessão;
   - `makeSessionDependencies` com o padrão do `endSession`.
8. **Apresentação:**
   - `useLoginViewModel` com o tipo de erro (credenciais, conexão, muitas tentativas) e as mensagens da spec §4;
   - `LoginScreen` exibe e anuncia a mensagem certa;
   - `src/modules/auth/screens/ConnectionErrorScreen/` (tela, teste e `index.ts`);
   - `RootNavigator`: o estado `unreachable` leva à `ConnectionErrorScreen`.
9. **Documentação:**
   - README: como rodar com a API local, `API_URL`, túnel HTTPS e limitações;
   - `CLAUDE.md` §4: versões novas e a nota de que a API agora existe em repositório próprio;
   - status desta tarefa e da spec.

## Critérios de aceite

Os de `features/api-integration.md` §9: automatizados e manuais.

## Validação

- `yarn typecheck`, `yarn lint` e `yarn test`.
- **Build nativo** (`yarn ios:pods`, `yarn ios`, `yarn android`) e roteiro manual com a API local: feitos pelo desenvolvedor.

## Commits sugeridos

1. `build(deps): adiciona axios, react-native-keychain e plugin de variáveis de ambiente`
2. `feat(core): adiciona cliente HTTP com renovação compartilhada e armazenamento seguro de tokens`
3. `feat(data): adiciona datasource remoto da FIAP School API`
4. `feat(session): adiciona estado de conexão, nova tentativa e logout no servidor`
5. `feat(auth): mostra mensagens de conexão e de muitas tentativas no login`
6. `docs: documenta a integração com a API`

## Status

**Implementada em 2026-11-05.** Faltam o build nativo e o roteiro manual, que ficam com o desenvolvedor. Spec e plano aprovados no mesmo dia.

Entregue:
- **Dependências:**
  - `axios@1.20.0` e `react-native-keychain@10.0.0` (versões fixas) e `babel-plugin-transform-inline-environment-variables@0.4.4`;
  - `yarn ios:pods` rodou: o RNKeychain 10.0.0 foi instalado, e o codegen da New Architecture gerou o `RNKeychainSpec`;
  - o CocoaPods reordenou entradas das fontes no `project.pbxproj`, sem mudar o conteúdo, e essa reformatação foi descartada.
- **Core:**
  - `apiConfig` (`API_URL` → padrão por plataforma → release só com `https://`);
  - `NetworkError`, `TooManyAttemptsError` e `SessionExpiredError`;
  - `tokenStore` (refresh no Keychain, access em memória; falha do Keychain não derruba a sessão em memória);
  - `apiErrors` e `apiClient`, com renovação compartilhada. Uma requisição que recebe 401 depois de a renovação terminar repete com o token novo, sem um segundo refresh.
- **Dados:** `GuardianRemoteDataSource` e `createEndSession`, que limpa os tokens e dispara o logout em segundo plano, para sair na hora (spec §3.4).
- **Composição e sessão:**
  - `createDependencies`, `createRemoteDependencies` e `createLocalDependencies`;
  - `SessionProvider` com `unreachable`, `retryRestore` e `endSession`.
- **Apresentação:**
  - Login com três mensagens;
  - `ConnectionErrorScreen`;
  - `RootNavigator` com o novo estado.
- **Documentação:** README (seção da API, stack, arquitetura, segurança), `CLAUDE.md` (estado, versões, nota sobre a API) e esta spec.

Decisão de implementação: um erro desconhecido no login passa a mostrar a mensagem de conexão, não mais a de credenciais. Só `InvalidCredentialsError` mostra "Usuário ou senha inválida".

Validação:
- `yarn typecheck` e `yarn lint` passando.
- `yarn test`: 35 suítes e 236 testes passando (antes eram 27 e 176). Entre os novos:
  - as cinco requisições simultâneas com um único refresh;
  - o fluxo de ponta a ponta com a API simulada (`__tests__/AppWithApi.test.tsx`): login pela tela sem nenhum token no AsyncStorage, reabertura sem login e SAIR revogando a sessão;
  - a tela de conexão no `App.test`.
- **Contra a API real** (`localhost:3000`):
  - login 200, com o `responsavel` idêntico ao JSON sem credenciais;
  - senha errada → 401 `CREDENCIAIS_INVALIDAS`;
  - o refresh roda o token, e reusar o antigo → 401 `REFRESH_INVALIDO` e sessão revogada;
  - `/me` 200 idêntico ao JSON;
  - logout 204, e o `/me` seguinte → 401 `TOKEN_INVALIDO`.

Pendente, com o desenvolvedor:
1. Build nativo (`yarn ios` e `yarn android`) com o `react-native-keychain`.
2. Roteiro manual da spec §9.

Atualização (2026-11-05, D-35):
- O `GuardianLocalDataSource`, o `createLocalDependencies` e o JSON saíram do app. O JSON foi movido para a API (`prisma/data/responsaveis.json`).
- Os testes passaram a usar um fixture anonimizado e a API simulada `createFakeApi`.
- O bundle de produção deixou de carregar CPFs e senhas.
- Suíte: 34 suítes e 229 testes.
