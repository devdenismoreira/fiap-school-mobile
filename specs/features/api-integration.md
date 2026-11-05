# Feature — Integração com a FIAP School API

> Status: **aprovada e implementada em 2026-11-05** (T11; falta a validação manual em aparelho) · Branch: `feature/integrate-api` · Decisões: D-17 a D-26 · Contrato: `../FiapSchoolApi/specs/03-api-contract.md` e `../FiapSchoolApi/openapi.yaml` (Swagger em `http://localhost:3000/docs`) · Corresponde à T10 da API

## 1. Objetivo

Trocar o JSON local pela FIAP School API, sem mudar o que o responsável vê depois do login.

**Ficam intactos:**
- entidades, contratos de repositório e casos de uso do domínio;
- `GuardianDataSource`, DTOs e `toGuardian`;
- as telas de Agenda, Boletim e Mudança de aluno, e a navegação das abas.

**Mudam:**
- a camada de dados;
- o armazenamento de tokens;
- o `SessionProvider` (estado de conexão e logout no servidor);
- as mensagens de erro do Login;
- uma tela nova de conexão.

## 2. O que continua igual

- A API devolve o mesmo agregado do JSON (`ResponsavelDTO`) no login e no `/me`. A paridade é garantida por teste na API (T09 de lá).
- Depois do login ou da restauração, os dados ficam em memória como hoje: Agenda, Boletim e Mudança de aluno não fazem requisições.
- A sessão no AsyncStorage continua `{ version, guardianId, selectedStudentRm }`, **sem tokens**.
- A troca de aluno continua local.

## 3. Fluxos

### 3.1 Login

`authenticateGuardian` (sem mudança) → `GuardianRepository.findByCredentials` → `GuardianRemoteDataSource.signIn` → `POST /v1/auth/login` com `{ cpf, senha }`.

| Resposta da API | Datasource | O que o usuário vê |
|---|---|---|
| 200 | Grava o refresh no Keychain e o access em memória; devolve `responsavel` | Entra no app, como hoje |
| 401 `CREDENCIAIS_INVALIDAS` ou 400 `DADOS_INVALIDOS` | Devolve `null` → `InvalidCredentialsError` | "Usuário ou senha inválida. Pode tentar novamente?" (Figma) |
| 429 `MUITAS_TENTATIVAS` | Lança `TooManyAttemptsError` | Mensagem de muitas tentativas (D-22) |
| Sem resposta, timeout ou 5xx | Lança `NetworkError` | Mensagem de conexão (D-20) |

O 400 só ocorre com senha acima de 72 bytes, porque o app já valida o CPF. Por isso é tratado como credencial inválida.

### 3.2 Restaurar a sessão ao abrir

`restoreSession` (sem mudança) → `GuardianRepository.findById(guardianId)` → `GuardianRemoteDataSource.getById`:

1. **Sem refresh no Keychain:** devolve `null`. A sessão é descartada e o app vai para o Login.
2. **Com refresh:**
   - o interceptador renova antes, porque não há access em memória;
   - em seguida, `GET /v1/me`.
3. `responsavel.id` igual ao `guardianId` guardado: devolve o `responsavel`. Diferente: devolve `null`.
4. **Refresh com 401 (`REFRESH_INVALIDO`):**
   - limpa os tokens e devolve `null`;
   - o app volta ao Login sem aviso (D-23).
5. **Falha de rede:**
   - lança `NetworkError`, e o `SessionProvider` vai para o estado `unreachable`;
   - a tela de conexão aparece (D-21);
   - a sessão e o refresh continuam guardados.

### 3.3 Tentar novamente

Na tela de conexão, **TENTAR NOVAMENTE** chama `retryRestore()`: o estado volta para `restoring` e o fluxo 3.2 se repete.

### 3.4 Logout

`signOut` chama `endSession()`:
1. lê o refresh guardado;
2. limpa o Keychain e o access em memória;
3. se havia refresh, dispara `POST /v1/auth/logout` em segundo plano, em melhor esforço e com timeout de 5 s, sem esperar a resposta;
4. depois, limpa o AsyncStorage e vai para o Login.

Sair é imediato, e a falha de rede no logout não impede a saída. Nesse caso, a sessão no servidor continua válida até expirar, e isso fica registrado como limitação.

### 3.5 Sessão local inexistente com refresh antigo no Keychain

Os itens do Keychain no iOS **sobrevivem à desinstalação** do app. Se a restauração terminar sem sessão (`null`), o `SessionProvider` também chama `endSession()`. Assim o refresh antigo é revogado no servidor e apagado do aparelho.

### 3.6 Interceptador e renovação compartilhada

Regras para as requisições autenticadas (`/v1/me` e futuras):

1. Envia `Authorization: Bearer <access>` com o token da memória.
2. Sem access em memória e com refresh guardado: renova **antes** de enviar.
3. **401 `TOKEN_EXPIRADO`:**
   - renova e repete a requisição original **uma única vez**;
   - um segundo 401 não gera outra tentativa.
4. **Renovação compartilhada (single-flight):**
   - enquanto um refresh está em andamento, todas as requisições aguardam a mesma promessa;
   - cinco 401 simultâneos geram **um** `POST /v1/auth/refresh`.
5. **401 `TOKEN_INVALIDO` ou refresh com 401:** limpa os tokens e rejeita com `SessionExpiredError`.
6. As rotas `/v1/auth/login`, `/refresh` e `/logout` não passam pela renovação.

## 4. Mensagens e tela nova

São textos fora do Figma, aprovados pelo desenvolvedor em 2026-11-05.

| Situação | Texto | Onde |
|---|---|---|
| Credenciais inválidas | "Usuário ou senha inválida.\nPode tentar novamente?" (Figma, sem mudança) | Login, no lugar atual do erro |
| Sem conexão ou servidor fora do ar no login (D-20) | "Não foi possível conectar.\nVerifique sua internet e tente novamente." | Login, mesmo lugar e estilo |
| Muitas tentativas (D-22) | "Muitas tentativas.\nTente novamente mais tarde." | Login, mesmo lugar e estilo |
| App aberto sem conexão (D-21) | "Não foi possível conectar.\nVerifique sua internet." + botão **TENTAR NOVAMENTE** | Tela de conexão |

**Login:**
- a mensagem exibida e a anunciada ao leitor de tela dependem do tipo de erro;
- a animação continua o fade atual;
- digitar em qualquer campo apaga o erro, como hoje.

**Tela de conexão (`ConnectionErrorScreen`):**
- fundo `background`;
- logo na mesma posição do Login;
- texto `bodyMedium` centralizado, na cor e no espaçamento do erro do Login;
- `PrimaryButton` "TENTAR NOVAMENTE" na posição do "FAZER LOGIN";
- entrada com `fadeInSmooth`;
- o texto é anunciado ao leitor de tela.

Só usa componentes e tokens existentes.

## 5. Armazenamento de tokens (D-19)

| Item | Onde | Regra |
|---|---|---|
| Refresh token | `react-native-keychain` (Keychain no iOS, Keystore no Android) | `service` próprio do app e `accessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY`. É removido no logout e no descarte |
| Access token | Memória (`TokenStore`) | Perdido ao fechar o app; renovado na abertura |
| Senha | Lugar nenhum | Como hoje |
| AsyncStorage | Só `{ version, guardianId, selectedStudentRm }` | **Nenhum token**, garantido por teste |

## 6. Cliente HTTP (D-18)

- **`core/http/apiClient.ts`:**
  - instância do Axios com `baseURL` (§7), timeout de 20 s (D-25) e JSON;
  - interceptadores de requisição (Bearer e renovação antecipada) e de resposta (§3.6).
- **`core/http/apiErrors.ts`:** normaliza as falhas:
  - sem resposta, timeout ou 5xx → `NetworkError`;
  - resposta 4xx → `ApiError { status, codigo }`, com o `codigo` do corpo `{ erro: { codigo, mensagem } }`.
- **Logs:** nenhum interceptador registra corpo, cabeçalhos ou tokens.
- **Testes:** usam o `adapter` do próprio Axios, sem biblioteca extra de mock.

## 7. URL da API (D-24, D-26)

- **`core/config/apiConfig.ts`:**
  - lê `process.env.API_URL`, injetada no bundle pelo `babel-plugin-transform-inline-environment-variables`;
  - o plugin é limitado à variável `API_URL`, para não vazar outras variáveis do ambiente.
- **Sem `API_URL`, em debug:**
  - simulador iOS: `http://localhost:3000`;
  - emulador Android: `http://10.0.2.2:3000`.
- **Aparelho físico:**
  - túnel HTTPS (`cloudflared tunnel --url http://localhost:3000`);
  - depois, `API_URL=https://… yarn start --reset-cache`.
- **Release:**
  - exige `API_URL` com `https://`;
  - sem ela, falha na inicialização com erro claro (D-26).
- **Nenhuma exceção nova de ATS ou de tráfego sem TLS:**
  - o simulador iOS já tem `localhost` liberado (`NSAllowsLocalNetworking`);
  - o Android de debug já permite HTTP (`usesCleartextTraffic` do template);
  - o release só fala `https://`.

## 8. Composição

- **`createDependencies()`:**
  - monta o `TokenStore` do Keychain e o `apiClient` com a URL de `getApiUrl()`;
  - delega a composição a `createRemoteDependencies(http, tokenStore)`. Os testes de ponta a ponta usam essa mesma função com um adaptador falso do Axios;
  - a latência simulada de 800 ms sai do caminho de produção.
- O `GuardianLocalDataSource` continua disponível para os testes: `App.test` usa `createLocalDependencies()`.
- **`SessionDependencies`** ganha `endSession(): Promise<void>`. O `makeSessionDependencies` dos testes recebe um padrão que não faz nada.
- **`SessionState`** ganha `{ status: 'unreachable' }`, e o contexto ganha `retryRestore()`. No `RootNavigator`, o estado `unreachable` → `ConnectionErrorScreen`.

## 9. Critérios de aceite

Automatizados:
- [x] Os testes atuais de Agenda, Boletim, Mudança de aluno e navegação passam sem mudança nas telas.
- [x] **`apiClient`:**
  - envia o Bearer;
  - renova antes quando não há access;
  - um 401 `TOKEN_EXPIRADO` gera uma renovação e repete a requisição uma vez;
  - **cinco requisições simultâneas com 401 geram um único refresh**;
  - refresh com 401 limpa os tokens e rejeita com `SessionExpiredError`;
  - nunca repete mais de uma vez;
  - as rotas de autenticação não renovam.
- [x] **`GuardianRemoteDataSource`:**
  - login 200 grava os tokens e devolve o `responsavel`;
  - 401 e 400 → `null`;
  - 429 → `TooManyAttemptsError`;
  - sem resposta, timeout ou 5xx → `NetworkError`;
  - `getById` sem refresh → `null`;
  - com refresh → renova e chama o `/me`;
  - id diferente → `null`.
- [x] **`TokenStore`:** o refresh vai para o Keychain com `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, o access fica só em memória, e `clear` remove os dois. Nenhum token chega ao AsyncStorage.
- [x] **Login:** as três mensagens aparecem e são anunciadas conforme o erro.
- [x] **`SessionProvider`:**
  - erro de rede na restauração → `unreachable`;
  - `retryRestore` restaura;
  - `signOut` chama `endSession` e limpa a sessão;
  - restauração sem sessão chama `endSession`.
- [x] **`ConnectionErrorScreen`:** texto, botão, papel e anúncio de acessibilidade.
- [x] **`apiConfig`:** usa `API_URL` quando definida; usa o padrão por plataforma em debug; recusa release sem `https://`.
- [x] typecheck e lint passam.

Manuais (aparelho ou simulador, com a API local ou o túnel):
- [ ] Login → Agenda → Boletim → trocar aluno → fechar e reabrir (entra sem login) → sair.
- [ ] Modo avião ao abrir → tela de conexão. Ao voltar a internet, TENTAR NOVAMENTE entra direto.
- [ ] Modo avião no login → mensagem de conexão.
- [ ] Cinco senhas erradas → mensagem de muitas tentativas.
- [ ] Depois de sair, reabrir o app abre no Login.

## 10. Dependências

Pedem aprovação para instalar.

| Pacote | Versão | Tipo | Motivo |
|---|---|---|---|
| `axios` | 1.20.0, fixa | runtime | Pedido do desenvolvedor (padrão dos projetos dele). A 1.21.0 foi publicada há 9 dias; fixar uma versão com semanas de uso reduz o risco de pacote comprometido |
| `react-native-keychain` | 10.0.0 | runtime nativo (TurboModule, compatível com a New Architecture) | Refresh com proteção nativa. Exige `pod install` e rebuild nos dois sistemas. Última versão de março de 2025: o build no RN 0.88 precisa ser conferido |
| `babel-plugin-transform-inline-environment-variables` | estável atual, conferida na instalação | desenvolvimento | `API_URL` no bundle, sem código nativo |

## 11. Limitações conhecidas

- Logout sem internet não revoga a sessão no servidor, que expira em até 30 dias.
- Hospedagem gratuita pode hibernar (T11 da API). A primeira requisição depois disso pode passar do timeout de 20 s e mostrar a tela de conexão. O timeout será revisto na T11 (D-25).
- Os dados não ficam disponíveis offline. Sem conexão na abertura, o app mostra a tela de conexão (D-21).
