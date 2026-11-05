# FIAP School Mobile

Aplicativo para responsáveis acompanharem a **agenda de aulas** e o **boletim** dos alunos vinculados. Feito em React Native CLI para Android e iOS, seguindo o design do Figma do desafio.

## Funcionalidades

- **Login** com CPF (máscara e normalização) e senha, validados contra os dados locais do desafio. Tem os estados de carregamento, erro e sucesso do Figma.
- **Sessão persistente:** ao reabrir o app, o responsável volta direto para a área logada, no mesmo aluno. "SAIR" encerra a sessão.
- **Cabeçalho** com o responsável ("Olá, NOME") e o aluno selecionado (nome, turma, RM e período).
- **Agenda:** seletor de dia e aulas do dia na ordem do JSON, com estado "Sem aulas neste dia".
- **Boletim:** seletor de ano, trimestres expansíveis e nota/faltas por disciplina. Mostra "-" quando o valor ainda não foi lançado e nunca calcula nem preenche notas.
- **Troca de aluno** numa tela acima das abas. Ao fechar, volta para a aba de origem já com os dados do novo aluno. Só aparece quando o responsável tem mais de um aluno.
- **Animações** discretas em todas as telas, que respeitam o "Reduzir movimento" do sistema.

## Stack

| Item | Versão |
|---|---|
| React Native CLI (New Architecture + Hermes) | 0.88.1 |
| React | 19.3.0 |
| TypeScript (`strict`) | 6.0.3 |
| Shopify Restyle (design system) | 2.4.5 |
| React Navigation (native-stack + bottom-tabs) | 7.x |
| React Native Reanimated + Worklets | 4.7.1 + 0.13.1 |
| React Native Gesture Handler, Screens, Safe Area Context | 3.4 / 4.30 / 5.11 |
| React Native SVG (ícones do Figma) | 15.16.0 |
| AsyncStorage (sessão, sem tokens) | 3.1.1 |
| Axios (cliente HTTP da API) | 1.20.0 |
| React Native Keychain (refresh token) | 10.0.0 |
| Jest + React Native Testing Library | 29.7 + 14.1 |
| Gerenciador de pacotes | Yarn 1.22 (clássico) |

## Pré-requisitos

- **Node.js 22** (≥ 22.11). O projeto tem `.nvmrc`, então basta rodar `nvm use`.
- **Yarn 1** (clássico): `npm install -g yarn`.
- **iOS:** macOS com Xcode, Ruby e CocoaPods.
- **Android:** Android Studio com SDK 36/37, JDK 17 e um emulador ou aparelho.

Guia oficial de ambiente: [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment).

## Instalação

```sh
nvm use
yarn install
yarn ios:pods   # iOS: instala os Pods
```

## Execução

Em um terminal, deixe o Metro rodando com `yarn start`. Se houver cache antigo, use `yarn start:reset`. Os comandos abaixo rodam em outro terminal.

| Comando | O que faz |
|---|---|
| `yarn ios` | Simulador iPhone 17 |
| `yarn ios:device` | iPhone conectado (USB ou mesma rede) |
| `yarn ios:release` | iPhone conectado, em Release: JS embutido, roda sem o Metro |
| `yarn android` | Emulador ou aparelho Android conectado |
| `yarn android:release` | Aparelho Android conectado, em release: JS embutido, roda sem o Metro |

Os builds de desenvolvimento compilam só a arquitetura do emulador ou aparelho em uso, o que deixa o build mais rápido e o app menor. Para escolher outro emulador, simulador ou aparelho: `yarn android --list-devices` ou `yarn react-native run-ios --list-devices`.

**iPhone físico:** na primeira vez, abra `ios/FiapSchoolMobile.xcworkspace` no Xcode. Em *Signing & Capabilities*, escolha o seu time de desenvolvimento e um *Bundle Identifier* único (o padrão do template, `org.reactjs.native.example…`, costuma conflitar). No iPhone, autorize o desenvolvedor em Ajustes › Geral › VPN e Gerenciamento de Dispositivos.

**Android físico:** ative as Opções do desenvolvedor e a Depuração USB, e confira se o aparelho aparece em `adb devices`. O `release` usa a chave de debug do template, o que basta para testes locais.

## Integração com a FIAP School API

Na branch `feature/integrate-api`, o app usa a [FIAP School API](../FiapSchoolApi) no lugar do JSON local. A API devolve o mesmo formato de dados, então domínio, telas e navegação não mudaram (spec [`features/api-integration.md`](specs/features/api-integration.md)).

1. Suba a API (`yarn dev` em `../FiapSchoolApi`) e confira em `http://localhost:3000/docs`.
2. Rode o app normalmente. Em debug, sem configuração, ele usa:
   - simulador iOS: `http://localhost:3000`;
   - emulador Android: `http://10.0.2.2:3000`.
3. **Aparelho físico:** abra um túnel HTTPS para a API e passe a URL ao Metro. A `API_URL` é gravada no bundle, por isso o `--reset-cache`.

   ```sh
   cloudflared tunnel --url http://localhost:3000   # ou: ngrok http 3000
   API_URL=https://<endereço-do-túnel> yarn start --reset-cache
   ```

4. **Release:** exige `API_URL` com `https://` no momento do bundle; sem ela, o app falha ao abrir com uma mensagem clara.

Comportamento:
- **Tokens:** o refresh token fica no Keychain (iOS) ou no Keystore (Android); o access token, só em memória. Nenhum token vai para o AsyncStorage, e a senha nunca é guardada.
- **Ao abrir o app:** ele renova a sessão com o refresh guardado e entra sem pedir login.
- **Token vencido:** um 401 gera uma única renovação, compartilhada entre as requisições, e cada requisição é repetida uma vez.
- **Sem conexão:**
  - no login, aparece uma mensagem de conexão;
  - na abertura do app, aparece uma tela com **TENTAR NOVAMENTE**;
  - após 5 tentativas erradas, a API bloqueia o login, e o app avisa.
- **SAIR** revoga a sessão também na API.

## Dados de teste

Na versão da entrega, a autenticação é **simulada** a partir do JSON fornecido pelo desafio, em [`src/data/datasources/local/responsaveis.json`](src/data/datasources/local/responsaveis.json). Com a API, o mesmo arquivo alimenta o banco pelo seed de lá, e as credenciais são as mesmas. Para entrar, use os campos `cpf` e `senha` de qualquer responsável desse arquivo. O CPF pode ser digitado com ou sem máscara.

- O **primeiro responsável** tem dois alunos e permite testar a troca de aluno.
- O **segundo** tem um aluno só, então a ação "TROCAR PERFIL" não aparece.

> Este README não repete credenciais de propósito: elas estão apenas no arquivo de dados do desafio.

## Arquitetura

Camadas com dependência num só sentido (apresentação → domínio ← dados). Ela é proporcional ao escopo: não há DI container, BaseRepository nem UseCase para operações triviais.

```text
src/
├── app/            Composition root (dependencies.ts), providers e SessionProvider
├── assets/         Fontes (Montserrat), ícones SVG e imagens exportados do Figma
├── core/           Tema Restyle (tokens), storage, erros e utilitários (CPF, data, nota)
├── domain/         Entidades, contratos de repositório e casos de uso
├── data/           Fonte de dados local (JSON), mapper e repositórios
├── modules/        Telas por funcionalidade: auth, students, classes, report
├── navigation/     RootNavigator (stack), MainTabs (abas), TabBar e tipos de rota
├── shared/         Componentes reutilizados, hooks e presets de animação
└── test-utils/     Fixtures e helpers de renderização para testes
```

Principais decisões:

- **Repository Pattern:** na entrega, a fonte local se comportava como uma API de login. Ela validava as credenciais, devolvia o responsável **sem** CPF, senha ou e-mail e simulava 800 ms de latência para o estado "carregando" do Figma aparecer. A integração com a API confirmou o desenho: bastou outra implementação de `GuardianDataSource` (`GuardianRemoteDataSource`, com Axios). A fonte local continua nos testes.
- **Casos de uso só onde há regra real:** `authenticateGuardian` (normaliza o CPF, valida o dígito verificador, erro genérico) e `restoreSession` (descarta sessão inválida e troca um aluno desvinculado pelo primeiro).
- **Context API** apenas para a sessão e o aluno selecionado. O estado de cada tela (dia escolhido, ano, acordeões abertos) fica no ViewModel da tela (`use<Tela>ViewModel`).
- **Navegação** no padrão de auth flow: telas condicionais por estado de sessão. A troca de aluno é uma rota empilhada acima das abas, que sobe de baixo.
- **Design system com Restyle:** cores, espaçamentos, raios, variantes de texto e de card vêm do Figma. Componentes usam props de token, então o TypeScript recusa tokens inexistentes.
- **Organização:** cada componente ou tela fica numa pasta (`Nome.tsx`, `Nome.test.tsx`, `index.ts`). O ViewModel e os componentes exclusivos ficam junto da tela. Os imports usam o alias `@/` → `src/`.

## Segurança e persistência

- A sessão salva no AsyncStorage contém **apenas** `{ version, guardianId, selectedStudentRm }`. Nunca CPF, senha, nome ou e-mail, e há teste para isso.
- Credenciais erradas, CPF inválido ou inexistente geram a **mesma** mensagem, sem indicar qual campo errou.
- Na versão da entrega, a autenticação é simulada e **não** representa segurança de produção, porque o JSON com as senhas vai junto no app.
- Com a API, a autenticação é real: JWT, sessão no servidor e refresh token protegido pelo Keychain ou Keystore.

## Testes e qualidade

```sh
yarn test        # Jest + React Native Testing Library
yarn typecheck   # tsc --noEmit
yarn lint        # ESLint + Prettier
```

São 169 testes em 25 suítes, cobrindo:

- **Regras:** CPF (máscara, normalização, dígito verificador), datas em pt-BR sem deslocamento de fuso, formatação de nota e faltas.
- **Dados:** fonte local, mapper, repositórios e validação da sessão salva.
- **Casos de uso e sessão:** login, restauração, troca de aluno e logout.
- **Telas:** Login, Agenda e Boletim com os **dados reais do JSON**, troca de aluno, cabeçalho, barra de abas, dropdown e animações.
- **Fluxo integrado do app:** login válido e inválido, reabertura com sessão, troca de aba, troca de aluno voltando à aba de origem e SAIR.

## Fidelidade ao Figma

Medidas, cores, tipografia e estados seguem o Figma. Diferenças conhecidas:

- **Normalizações:** onde o próprio Figma desenha o mesmo elemento em posições diferentes (desvios de 1 a 6 pt), foi usado o valor que se repete na maioria das ocorrências.
- **Senha:** aparece com a máscara nativa (bolinhas), e não com asteriscos. Assim os gerenciadores de senha e os leitores de tela continuam funcionando.
- **Imagens:** o logo e a ilustração "sem aulas" vêm do Figma só em @1x e podem ficar levemente suavizados em telas de alta densidade.
- **Opções dos dropdowns:** têm 36 pt de área de toque, a medida do Figma, abaixo dos 44 pt recomendados.

## Documentação do processo (SDD)

O desenvolvimento seguiu Spec-Driven Development (Specify → Plan → Implement → Validate → Review), com o Claude Code como apoio.

| Caminho | Conteúdo |
|---|---|
| [`specs/`](specs/README.md) | Visão geral e decisões (D-01 a D-16), arquitetura, modelo de dados, design system e uma spec por funcionalidade |
| [`tasks/`](tasks/README.md) | Tarefas T01–T10 com dependências, critérios de aceite, validação e status |
| [`CLAUDE.md`](CLAUDE.md) | Contexto e regras do projeto para a IA |
| [`.claude/`](.claude/) | Agentes (`architect`, `mobile-developer`, `test-engineer`, `code-reviewer`), comandos (`/specify`, `/plan`, `/implement`, `/validate`, `/review`) e permissões compartilhadas |
| [`AI_USAGE.md`](AI_USAGE.md) | Como a IA foi usada e como as respostas foram validadas |

O histórico usa Conventional Commits, com um commit por funcionalidade.
