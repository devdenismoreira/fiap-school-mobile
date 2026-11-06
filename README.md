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
| NetInfo (aviso de queda e volta da conexão) | 12.0.1 |
| React Native BootSplash (abertura até restaurar a sessão) | 7.3.3 |
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

O app usa **uma única URL**, a da API em produção: `https://fiap-school-api-production.up.railway.app` (em `src/core/config/apiConfig.ts`). Vale para debug e release, em simulador, emulador e aparelho. Não há variável de ambiente nem túnel. Para apontar para outra API, altere a constante e gere o app de novo.

A Railway pode hibernar sem uso: a primeira abertura depois de um tempo parado pode demorar e mostrar a tela de conexão (timeout de 20 s). Basta tocar em TENTAR NOVAMENTE.

Comportamento:
- **Tokens:** o refresh token fica no Keychain (iOS) ou no Keystore (Android); o access token, só em memória. Nenhum token vai para o AsyncStorage, e a senha nunca é guardada.
- **Ao abrir o app:** ele renova a sessão com o refresh guardado e entra sem pedir login.
- **Agenda e boletins:** vêm das rotas de alunos da API (`/v1/alunos/{rm}/agenda` e `/boletins`), que só entregam alunos vinculados ao responsável do token. São buscados ao abrir o app, ao trocar de aluno e ao puxar a tela para baixo (puxar para atualizar). Enquanto carregam, aparece um indicador; se falharem, a tela oferece TENTAR NOVAMENTE.
- **Token vencido:** um 401 gera uma única renovação, compartilhada entre as requisições, e cada requisição é repetida uma vez.
- **Sem conexão:**
  - no login, aparece uma mensagem de conexão;
  - na abertura do app, aparece uma tela com **TENTAR NOVAMENTE**;
  - após 5 tentativas erradas, a API bloqueia o login, e o app avisa.
- **SAIR** revoga a sessão também na API.

### Avisos (toast)

Um toast no estilo do Instagram, com os tokens do design system, avisa sem interromper o uso:
- **Visual e comportamento:**
  - fundo `surfaceRaised`, texto branco e cantos arredondados;
  - sobe de baixo, acima da barra de abas, do botão principal ou do teclado;
  - some sozinho, ou fecha ao tocar ou ao arrastar para baixo;
  - é lido pelo VoiceOver e pelo TalkBack.
- **Quando aparece:**
  - **sessão expirada:** a sessão salva foi recusada pela API ao abrir o app;
  - **troca de aluno:** "Mostrando os dados de …";
  - **conexão:** queda e volta da internet durante o uso, pelo NetInfo. Se a internet voltar com o app na tela de conexão, ele tenta entrar sozinho.

Spec: [`features/toast.md`](specs/features/toast.md).

## Dados de teste

As credenciais de teste são as do JSON fornecido pelo desafio.
- **Até a entrega**, ele ficava no app e a autenticação era simulada.
- **Desde a integração**, ele saiu do app e fica na API, em [`../FiapSchoolApi/prisma/data/responsaveis.json`](../FiapSchoolApi/prisma/data/responsaveis.json), alimentando o banco pelo seed.

Para entrar, use os campos `cpf` e `senha` de qualquer responsável desse arquivo. O CPF pode ser digitado com ou sem máscara.

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

- **Repository Pattern:** na entrega, a fonte local se comportava como uma API de login. Ela validava as credenciais, devolvia o responsável **sem** CPF, senha ou e-mail e simulava 800 ms de latência para o estado "carregando" do Figma aparecer. A integração com a API confirmou o desenho: bastou outra implementação de `GuardianDataSource` (`GuardianRemoteDataSource`, com Axios). Depois disso, a fonte local e o JSON saíram do app; os testes usam uma API simulada sobre um fixture anonimizado.
- **Casos de uso só onde há regra real:** `authenticateGuardian` (normaliza o CPF, valida o dígito verificador, erro genérico) e `restoreSession` (descarta sessão inválida e troca um aluno desvinculado pelo primeiro).
- **Context API** apenas para a sessão e o aluno selecionado. O estado de cada tela (dia escolhido, ano, acordeões abertos) fica no ViewModel da tela (`use<Tela>ViewModel`).
- **Navegação** no padrão de auth flow: telas condicionais por estado de sessão. A troca de aluno é uma rota empilhada acima das abas, que sobe de baixo.
- **Design system com Restyle:** cores, espaçamentos, raios, variantes de texto e de card vêm do Figma. Componentes usam props de token, então o TypeScript recusa tokens inexistentes.
- **Organização:** cada componente ou tela fica numa pasta (`Nome.tsx`, `Nome.test.tsx`, `index.ts`). O ViewModel e os componentes exclusivos ficam junto da tela. Os imports usam o alias `@/` → `src/`.

## Segurança e persistência

- A sessão salva no AsyncStorage contém **apenas** `{ version, guardianId, selectedStudentRm }`. Nunca CPF, senha, nome ou e-mail, e há teste para isso.
- Credenciais erradas, CPF inválido ou inexistente geram a **mesma** mensagem, sem indicar qual campo errou.
- Na versão da entrega, a autenticação era simulada e **não** representava segurança de produção, porque o JSON com as senhas ia junto no app.
- Com a API, a autenticação é real: JWT, sessão no servidor e refresh token protegido pelo Keychain ou Keystore. O JSON saiu do app, e o bundle não carrega dados pessoais.

## Testes e qualidade

```sh
yarn test        # Jest + React Native Testing Library
yarn typecheck   # tsc --noEmit
yarn lint        # ESLint + Prettier
```

São 251 testes em 37 suítes, cobrindo:

- **Regras:** CPF (máscara, normalização, dígito verificador), datas em pt-BR sem deslocamento de fuso, formatação de nota e faltas.
- **Dados e API:**
  - cliente HTTP (renovação compartilhada, uma repetição, erros normalizados);
  - armazenamento de tokens;
  - datasource remoto, mapper, repositórios e validação da sessão salva.
- **Casos de uso e sessão:** login, restauração, sem conexão, nova tentativa, troca de aluno e logout no servidor.
- **Telas:** Login (três mensagens de erro e aviso de sessão expirada), tela de conexão, Agenda e Boletim, troca de aluno, cabeçalho, barra de abas, dropdown e animações. Usam um fixture com a estrutura dos dados do desafio e identidades fictícias.
- **Toast e conexão:**
  - visual, tocar e arrastar para fechar, duração, substituição, posição acima da barra e do teclado;
  - queda e volta da internet, ignorando oscilações de menos de 1 s;
  - nova tentativa automática.
- **Fluxo integrado do app**, contra uma API simulada:
  - login válido e inválido, sem nenhum token no AsyncStorage;
  - reabertura com renovação da sessão;
  - troca de aba;
  - troca de aluno voltando à aba de origem;
  - SAIR revogando a sessão.

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
