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
| AsyncStorage (sessão) | 3.1.1 |
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
| `yarn ios` | Simulador iOS padrão |
| `yarn ios:device` | iPhone conectado (USB ou mesma rede) |
| `yarn ios:release` | iPhone conectado, em Release: JS embutido, roda sem o Metro |
| `yarn ios:select` | Lista simuladores e aparelhos para escolher |
| `yarn android` | Emulador ou aparelho Android, compilando todas as arquiteturas |
| `yarn android:device` | Emulador ou aparelho conectado, compilando só a arquitetura dele (bem mais rápido) |
| `yarn android:release` | Aparelho conectado, em release: JS embutido, roda sem o Metro |
| `yarn android:select` | Lista emuladores e aparelhos para escolher |

**iPhone físico:** na primeira vez, abra `ios/FiapSchoolMobile.xcworkspace` no Xcode. Em *Signing & Capabilities*, escolha o seu time de desenvolvimento e um *Bundle Identifier* único (o padrão do template, `org.reactjs.native.example…`, costuma conflitar). No iPhone, autorize o desenvolvedor em Ajustes › Geral › VPN e Gerenciamento de Dispositivos.

**Android físico:** ative as Opções do desenvolvedor e a Depuração USB, e confira se o aparelho aparece em `adb devices`. O `release` usa a chave de debug do template, o que basta para testes locais.

## Dados de teste

A autenticação é **simulada** a partir do JSON fornecido pelo desafio, em [`src/data/datasources/local/responsaveis.json`](src/data/datasources/local/responsaveis.json). Para entrar, use os campos `cpf` e `senha` de qualquer responsável desse arquivo. O CPF pode ser digitado com ou sem máscara.

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

- **Repository Pattern:** a fonte local se comporta como uma API de login. Ela valida as credenciais, devolve o responsável **sem** CPF, senha ou e-mail e simula 800 ms de latência para o estado "carregando" do Figma aparecer. Trocar por REST exige só outra implementação de `GuardianDataSource`.
- **Casos de uso só onde há regra real:** `authenticateGuardian` (normaliza o CPF, valida o dígito verificador, erro genérico) e `restoreSession` (descarta sessão inválida e troca um aluno desvinculado pelo primeiro).
- **Context API** apenas para a sessão e o aluno selecionado. O estado de cada tela (dia escolhido, ano, acordeões abertos) fica no ViewModel da tela (`use<Tela>ViewModel`).
- **Navegação** no padrão de auth flow: telas condicionais por estado de sessão. A troca de aluno é uma rota modal acima das abas.
- **Design system com Restyle:** cores, espaçamentos, raios, variantes de texto e de card vêm do Figma. Componentes usam props de token, então o TypeScript recusa tokens inexistentes.
- **Organização:** cada componente ou tela fica numa pasta (`Nome.tsx`, `Nome.test.tsx`, `index.ts`). O ViewModel e os componentes exclusivos ficam junto da tela. Os imports usam o alias `@/` → `src/`.

## Segurança e persistência

- A sessão salva no AsyncStorage contém **apenas** `{ version, guardianId, selectedStudentRm }`. Nunca CPF, senha, nome ou e-mail, e há teste para isso.
- Credenciais erradas, CPF inválido ou inexistente geram a **mesma** mensagem, sem indicar qual campo errou.
- A autenticação é simulada para o desafio e **não** representa segurança de produção: o JSON com as senhas vai junto no app.

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

O desenvolvimento seguiu Spec-Driven Development: especificações em `specs/` (visão geral, arquitetura, modelo de dados, design system e uma spec por funcionalidade), tarefas incrementais com critérios de aceite em `tasks/`, e o contexto de IA em `CLAUDE.md`.

O histórico usa Conventional Commits, com um commit por funcionalidade.
