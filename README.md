# FIAP School Mobile

Aplicativo para responsáveis acompanharem a **agenda de aulas** e o **boletim** dos alunos vinculados. Feito em React Native CLI para Android e iOS, seguindo o design do Figma do desafio.

## Funcionalidades

- **Login** com CPF (máscara e normalização) e senha, validados pela [FIAP School API](https://github.com/devdenismoreira/fiap-school-api). Tem os estados de carregamento (indicador no botão), erro e sucesso, com mensagens próprias para credenciais inválidas, falta de conexão e excesso de tentativas.
- **Sessão persistente:** ao reabrir o app, o responsável volta direto para a área logada, no mesmo aluno, sem pedir login. "SAIR" encerra a sessão, inclusive no servidor.
- **Cabeçalho** com o responsável ("Olá, NOME") e o aluno selecionado (nome, turma, RM e período).
- **Agenda:** seletor de dia e aulas do dia na ordem dos dados, com estado "Sem aulas neste dia".
- **Boletim:** seletor de ano, trimestres expansíveis e nota/faltas por disciplina. Mostra "-" quando o valor ainda não foi lançado e nunca calcula nem preenche notas.
- **Troca de aluno** numa tela acima das abas. Ao fechar, volta para a aba de origem já com os dados do novo aluno. Só aparece quando o responsável tem mais de um aluno.
- **Puxar para atualizar** nas duas abas: busca de novo a agenda e os boletins do aluno selecionado.
- **Estados de erro e vazios:**
  - responsável sem alunos: tela única com "Nenhum aluno vinculado";
  - aluno sem boletim: "Nenhum boletim encontrado" com TENTAR NOVAMENTE;
  - falha ao carregar: mensagem e TENTAR NOVAMENTE;
  - app aberto sem conexão: tela de conexão.
- **Avisos (toast)** para sessão expirada, troca de aluno e queda ou volta da internet.
- **Abertura (splash)** que fica na tela até a sessão ser restaurada.
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
| NetInfo (aviso de queda e volta da conexão) | 12.0.1 |
| React Native BootSplash (abertura até restaurar a sessão) | 7.3.3 |
| Jest + React Native Testing Library | 29.7 + 14.1 |
| Gerenciador de pacotes | Yarn 1.22 (clássico) |

### Dependências além do básico e por que existem

O enunciado pede só o necessário. Fora o ecossistema do React Navigation (rotas, abas, safe area, screens) e o Restyle, estas foram acrescentadas:

| Pacote | Para quê |
|---|---|
| Reanimated + Worklets, Gesture Handler | Animações na thread de UI e gestos (toast, puxar para atualizar) |
| React Native SVG | Ícones e ilustrações exportados do Figma |
| AsyncStorage | Sessão não sensível (`guardianId` e aluno selecionado), nunca tokens |
| Axios | Cliente HTTP com interceptadores para renovar o token de forma compartilhada |
| React Native Keychain | Guardar o refresh token com proteção nativa (Keychain e Keystore) |
| NetInfo | Avisar a queda e a volta da internet |
| BootSplash | Manter a launch screen até a sessão ser restaurada |

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

O app consome a [FIAP School API](https://github.com/devdenismoreira/fiap-school-api), em repositório próprio (Express + Prisma + PostgreSQL no Supabase). Os dados do desafio estão no banco da API. Specs: [`features/api-integration.md`](specs/features/api-integration.md) e [`features/records-from-student-routes.md`](specs/features/records-from-student-routes.md).

**A API de produção já está no ar** e é a única URL do app: `https://fiap-school-api-production.up.railway.app` (em `src/core/config/apiConfig.ts`). Vale para debug e release, em simulador, emulador e aparelho. Não há variável de ambiente nem túnel. Para apontar para outra API, altere a constante e gere o app de novo.

> **Primeira abertura lenta ou tela de conexão?** A hospedagem gratuita pode hibernar sem uso. Aguarde alguns segundos e toque em **TENTAR NOVAMENTE**.

**Rodar a API por conta própria** (opcional): o passo a passo está no README da API (Supabase, variáveis de ambiente, chaves, migrations, seed e execução). Depois, altere `API_URL` em `src/core/config/apiConfig.ts`.

Como os dados chegam:
- **Login e `/me`:** trazem só o responsável e a lista dos seus alunos.
- **Agenda e boletins:** vêm das rotas de alunos (`/v1/alunos/{rm}/agenda` e `/boletins`), que só entregam alunos vinculados ao responsável do token. São buscados ao abrir o app, ao trocar de aluno e ao puxar a tela para baixo.
- **Tokens:** o refresh token fica no Keychain (iOS) ou no Keystore (Android); o access token, só em memória. Nenhum token vai para o AsyncStorage, e a senha nunca é guardada.
- **Ao abrir o app:** renova a sessão com o refresh guardado e entra sem pedir login.
- **Token vencido:** um 401 gera uma única renovação, compartilhada entre as requisições, e cada requisição é repetida uma vez.
- **Sem conexão:** mensagem no login, tela de conexão na abertura e aviso (toast) durante o uso. Após 5 senhas erradas, a API bloqueia o login e o app avisa.

### Avisos (toast)

Toast no estilo do Instagram, com os tokens do design system: quatro variantes (sucesso, informação, erro e atenção) com ícone, título, mensagem e uma barra de progresso que encolhe até o toast sumir. Sobe de baixo, acima da barra de abas, do botão principal ou do teclado, e fecha ao tocar ou ao arrastar para baixo. É lido por VoiceOver e TalkBack. Spec: [`features/toast.md`](specs/features/toast.md).

## Dados de teste

Logins válidos na API de produção (dados do desafio e de demonstração; o CPF pode ser digitado com ou sem máscara):

| Responsável | CPF | Senha | Alunos |
|---|---|---|---|
| Gustavo da Silva | 969.294.560-04 | 123456 | Rafael e Joana (testa a troca de aluno) |
| Adelaide Silveira da Costa | 508.795.670-07 | 987654 | Bianca (um aluno: sem TROCAR PERFIL) |
| Carla Mendes | 333.666.999-57 | 112233 | nenhum (tela "Nenhum aluno vinculado") |
| Diego Rocha | 444.777.000-83 | 445566 | Felipe, sem boletim (estado "Nenhum boletim encontrado") |

Os dois primeiros vêm do JSON do desafio; Carla e Diego são fictícios, criados para exercitar os estados vazios. São dados de demonstração.

## Arquitetura

Camadas com dependência num só sentido (apresentação → domínio ← dados). Ela é proporcional ao escopo: não há DI container, BaseRepository nem UseCase para operações triviais.

```text
src/
├── app/            Composition root (dependencies.ts), providers e SessionProvider
├── assets/         Fontes (Montserrat), ícones SVG e imagens exportados do Figma
├── core/           Tema Restyle (tokens), cliente HTTP, tokens, rede, erros e utilitários (CPF, data, nota)
├── domain/         Entidades, contratos de repositório e casos de uso
├── data/           Datasource remoto (API), mapper e repositórios
├── modules/        Telas por funcionalidade: auth, students, classes, report
├── navigation/     RootNavigator (stack), MainTabs (abas), TabBar e tipos de rota
├── shared/         Componentes reutilizados (Toast, EmptyState, Dropdown…), hooks e presets de animação
└── test-utils/     Fixture anonimizado, API simulada e helpers de renderização para testes
```

Principais decisões:

- **Repository Pattern:** na entrega, a fonte local se comportava como uma API de login. Ela validava as credenciais, devolvia o responsável **sem** CPF, senha ou e-mail e simulava 800 ms de latência para o estado "carregando" do Figma aparecer. A integração com a API confirmou o desenho: bastou outra implementação de `GuardianDataSource` (`GuardianRemoteDataSource`, com Axios). Depois disso, a fonte local e o JSON saíram do app; os testes usam uma API simulada sobre um fixture anonimizado.
- **Casos de uso só onde há regra real:** `authenticateGuardian` (normaliza o CPF, valida o dígito verificador, erro genérico), `restoreSession` (descarta sessão inválida e troca um aluno desvinculado pelo primeiro) e `loadStudentRecords` (busca agenda e boletins do aluno em paralelo).
- **Context API** para a sessão, o aluno selecionado e o estado do carregamento dos dados dele, além do toast. O estado de cada tela (dia escolhido, ano, acordeões abertos) fica no ViewModel da tela (`use<Tela>ViewModel`).
- **Navegação** no padrão de auth flow: telas condicionais por estado de sessão. A troca de aluno é uma rota empilhada acima das abas, que sobe de baixo.
- **Design system com Restyle:** cores, espaçamentos, raios, variantes de texto e de card vêm do Figma. Componentes usam props de token, então o TypeScript recusa tokens inexistentes.
- **Organização:** cada componente ou tela fica numa pasta (`Nome.tsx`, `Nome.test.tsx`, `index.ts`). O ViewModel e os componentes exclusivos ficam junto da tela. Os imports usam o alias `@/` → `src/`.

## Segurança e persistência

- A sessão salva no AsyncStorage contém **apenas** `{ version, guardianId, selectedStudentRm }`. Nunca CPF, senha, nome, e-mail ou token, e há teste para isso.
- O refresh token fica no Keychain/Keystore (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`); o access token, só em memória.
- Credenciais erradas, CPF inválido ou inexistente geram a **mesma** mensagem, sem indicar qual campo errou.
- Autenticação real pela API: JWT, sessão no servidor com refresh rotativo, HTTPS e autorização pelo vínculo entre responsável e aluno em todas as rotas de dados.
- O bundle não carrega dados pessoais: o JSON do desafio não vai mais no app.

## Testes e qualidade

```sh
yarn test        # Jest + React Native Testing Library
yarn typecheck   # tsc --noEmit
yarn lint        # ESLint + Prettier
```

São 273 testes em 42 suítes, cobrindo:

- **Regras:** CPF (máscara, normalização, dígito verificador), datas em pt-BR sem deslocamento de fuso, formatação de nota e faltas.
- **Dados e API:** cliente HTTP (renovação compartilhada, uma repetição, erros normalizados), tokens, datasource remoto (inclusive aluno de outro responsável), mapper e repositórios.
- **Casos de uso e sessão:** login, restauração, sem conexão, nova tentativa, carregamento dos dados do aluno ao abrir e ao trocar, recarga, troca de aluno e logout no servidor.
- **Telas:** Login (mensagens de erro e aviso de sessão expirada), tela de conexão, Agenda e Boletim (carregando, erro e vazio), tela sem alunos, troca de aluno, cabeçalho, barra de abas, dropdown, puxar para atualizar e animações.
- **Toast, conexão e abertura:** variantes e barra de progresso, fechar ao tocar e arrastar, posição, queda e volta da internet e o splash.
- **Fluxo integrado**, contra uma API simulada que aplica o mesmo vínculo da real: login, reabertura, troca de aba e de aluno (com busca dos dados do novo aluno) e SAIR.

As telas usam um fixture anonimizado com a estrutura dos dados do desafio e identidades fictícias.

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
| [`specs/`](specs/README.md) | Visão geral e decisões (D-01 a D-38), arquitetura, modelo de dados, design system e uma spec por funcionalidade |
| [`tasks/`](tasks/README.md) | Tarefas T01–T15 com dependências, critérios de aceite, validação e status |
| [`CLAUDE.md`](CLAUDE.md) | Contexto e regras do projeto para a IA |
| [`.claude/`](.claude/) | Agentes (`architect`, `mobile-developer`, `test-engineer`, `code-reviewer`), comandos (`/specify`, `/plan`, `/implement`, `/validate`, `/review`) e permissões compartilhadas |
| [`AI_USAGE.md`](AI_USAGE.md) | Como a IA foi usada e como as respostas foram validadas |

A API tem o mesmo método no repositório dela (specs, tarefas, agentes e comandos). O histórico usa Conventional Commits, com um commit por funcionalidade.
