# 00 — Visão geral do projeto

> Status: **aprovada** · Decisões D-01 a D-16 registradas (✅ = aprovada pelo desenvolvedor) · Fase SDD: T01–T10 implementadas

## 1. Objetivo

Aplicativo mobile (Android e iOS) para que **responsáveis** acompanhem, para cada aluno vinculado:

- a **agenda de aulas** organizada por dia;
- o **boletim** por ano letivo e trimestre (notas e faltas por disciplina).

A autenticação é **simulada** a partir de um JSON local fornecido pelo desafio. Não há backend, Firebase nem API própria.

## 2. Fontes de verdade

| Fonte | Localização | Observação |
|---|---|---|
| Regras do projeto | `CLAUDE.md` | Papel, stack, arquitetura, segurança, SDD |
| Design | Figma `YBBIc9PlBhxcLuHTOi4V9p` ("Teste Técnico Mobile - FIAP (Copy)") | Páginas: Capa, Login, Aulas, Boletim, Mudança de Aluno |
| Dados | `src/responsaveis.json` | 2 responsáveis, 3 alunos. Detalhes em `02-data-model.md` |

Quando Figma, JSON e `CLAUDE.md` divergirem, a divergência é registrada na seção 6 e decidida pelo desenvolvedor.

## 3. Diagnóstico do repositório (2026-11-04)

| Item | Estado observado |
|---|---|
| Repositório remoto | `github.com/devdenismoreira/fiap-school-mobile`, **privado** até a entrega (depois será exibido). Nenhum remote configurado localmente ainda. Os docs seguem sem credenciais, porque o repositório ficará visível |
| Git | Branch `main`, 1 commit (`Initial commit`). `package.json`/`package-lock.json` modificados (dependências adicionadas). `CLAUDE.md`, `PROMPT-INICIAL-CLAUDE-CODE.md`, `specs/`, `tasks/`, `src/` não rastreados |
| Projeto | React Native CLI **0.88.1**, React **19.3.0**, TypeScript **6.0.3**; `App.tsx` ainda é o template (`NewAppScreen`) |
| Scripts | `android`, `ios`, `lint`, `start`, `test` (não há script de `typecheck`) |
| Dependências instaladas | `@shopify/restyle` 2.4.5, `@react-navigation/{native 7.5.1, native-stack 7.21.0, bottom-tabs 7.21.0}`, `react-native-reanimated` 4.7.1, `react-native-gesture-handler` 3.4.0, `react-native-screens` 4.30.1, `react-native-safe-area-context` 5.11.1, `@react-native-async-storage/async-storage` 3.1.1 |
| `react-native-worklets` | 0.13.1 presente em `node_modules` **apenas como peer** do Reanimated 4 — **não** está em `dependencies`, então o autolinking nativo não o inclui |
| Babel | Sem o plugin `react-native-worklets/plugin` (obrigatório para Reanimated 4) |
| Testes | Jest 29 + `@react-native/jest-preset`; **sem** `@testing-library/react-native` |
| Node | `nvm` com padrão **22.22.2** (atende `>= 22.11.0`); o shell do editor herdou v20.19.4 → usar `nvm use` (proposta: `.nvmrc` com `22`) |
| Android | `newArchEnabled=true`, `hermesEnabled=true`, `edgeToEdgeEnabled=true`, minSdk 24 / target 36 / compile 37, `applicationId com.fiapschoolmobile` |
| iOS | `Podfile` padrão; **Pods não instalados** (sem `Podfile.lock`/`.xcworkspace`); bundle id padrão do template |
| Fontes | Nenhuma fonte customizada vinculada (sem `UIAppFonts`, sem `android/app/src/main/assets/fonts`) |

Linha de base executada (sem alterações no projeto):

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0 |
| `npm test -- --ci` | 1 suíte / 1 teste passou |
| Build Android / iOS | **não executado** nesta etapa (Pods ausentes e Node abaixo do exigido) |

## 4. Inventário do Figma

Frames em 414 × 736 pt (o Boletim expandido tem 1796 pt de altura por ser rolável). Fundo das telas: preto. Não há variáveis nem estilos publicados no arquivo (`get_variable_defs` retornou vazio), então os tokens foram derivados dos valores brutos (`03-design-system.md`).

| Página | Frames (node id) | Estados representados |
|---|---|---|
| Capa | `4001:3` | Apenas logo FIAP (não é tela do app) |
| Login | `2:6`, `3:1216`, `3:1246`, `3:1232`, `3:1262` | Inicial · CPF com máscara · senha preenchida + botão ativo · carregando · erro |
| Aulas | `2:24`, `2:48`, `2:88` + barras `3:908`, `17:14`, `17:2` | Dia sem aulas · dropdown de dias aberto · lista de aulas · variantes da barra de ações (com/sem "TROCAR PERFIL", com/sem "SAIR") |
| Boletim | `3:317`, `3:1054`, `3:389`, `3:549` | Dropdown de ano fechado · aberto · 1º trimestre expandido · detalhes de nota/faltas (inclusive trimestre sem notas) |
| Mudança de Aluno | `2:5` | Lista de alunos com o selecionado destacado |

O arquivo **não contém protótipo nem especificação de animações** inspecionáveis pelas ferramentas usadas. As animações propostas estão em `03-design-system.md` §8 e em cada feature, e precisam de validação.

## 5. Escopo funcional

| ID | Requisito | Spec |
|---|---|---|
| RF-01 | Login com CPF (máscara + normalização) e senha, contra o JSON local | `features/authentication.md` |
| RF-02 | Estados de carregamento, erro e sucesso no login | `features/authentication.md` |
| RF-03 | Persistir sessão e restaurá-la ao reabrir o app | `features/authentication.md` |
| RF-04 | Encerrar sessão ("SAIR") | `features/authentication.md` |
| RF-05 | Exibir responsável ("Olá, NOME") e aluno selecionado (nome, turma, RM, período) | `features/student-selection.md` |
| RF-06 | Trocar de aluno numa rota acima das abas, retornando à tela anterior com os dados atualizados | `features/student-selection.md` |
| RF-07 | Agenda: aulas por dia, seletor de dia, estado "Sem aulas neste dia" | `features/classes.md` |
| RF-08 | Boletim: seletor de ano, trimestres expansíveis, nota/faltas por disciplina, "-" quando não avaliado | `features/report.md` |
| RF-09 | Animações/transições discretas em todas as telas, respeitando "reduzir movimento" | `03-design-system.md` §8 |

Requisitos não funcionais: Android + iOS; TypeScript estrito; Restyle como design system; acessibilidade (rótulos, papéis, área de toque ≥ 44 pt); sem senha nem CPF em armazenamento persistente ou logs; testes para regras e fluxos essenciais.

Fora de escopo: backend/API, Firebase, cadastro ou recuperação de senha, notificações, cálculo de média ou aprovação, edição de dados.

## 6. Divergências, lacunas e decisões

Diretriz geral do desenvolvedor (2026-11-04): **seguir o Figma fielmente ("Perfect Pixel")**. Onde houver conflito entre uma proposta minha e o Figma, vale o Figma.

| ID | Tema | Observação | Decisão |
|---|---|---|---|
| D-01 ✅ | Ano do boletim | `CLAUDE.md` fala em "boletim anual de 2025"; o Figma tem seletor de ano ("7EF - 2025", "6EF - 2024") e o JSON tem 2024 para um aluno | **Seguir o padrão do JSON**: seletor com os boletins do aluno na ordem do JSON; selecionado por padrão o primeiro (2025 em todos os alunos) |
| D-02 ✅ | Dia inicial da Agenda | O Figma mostra "16 de março, domingo" (1º dia do JSON, sem aulas) como estado de entrada | **Como no Figma**: primeiro dia da agenda |
| D-03 ✅ | "SAIR" (logout) | Os frames principais mostram só "TROCAR PERFIL"; as variantes `3:908` (TROCAR PERFIL + SAIR) e `17:14` (só SAIR) existem no arquivo | **Fiel ao Figma**: `3:908` quando o responsável tem 2+ alunos; `17:14` quando tem 1 |
| D-04 ✅ | Loading do login | O frame "carregando" mostra o botão vazio, sem indicador | **Latência simulada de 800 ms** (0 nos testes); botão vazio como no Figma, com `accessibilityState.busy` |
| D-05 ✅ | Ícones SVG | Ícones vêm como SVG | **`react-native-svg` aprovado** |
| D-06 ✅ | Simulação de dados / README | O JSON foi colocado em `src/` só para leitura; a forma de simular os dados ficou a meu critério | JSON movido para a camada de dados como fixture local, servido por um datasource assíncrono com latência (simula uma API) atrás do repositório. O README aponta para o arquivo, sem copiar credenciais |
| D-07 | CPF no Figma | O CPF exibido nos frames de Login corresponde a um responsável real do JSON | Não repetir em docs; usar placeholders |
| D-08 | Intervalo entre aulas | Há um intervalo de 30 min nos horários (ex.: 08:45 → 09:15) que não existe como registro no JSON nem aparece no Figma | Não exibir nada para o intervalo |
| D-09 | Disciplina ausente | Aluno RM 13752: o 1º trimestre/2025 tem 11 disciplinas (sem "Arte"); 2º e 3º têm 12 | Exibir só as disciplinas presentes no trimestre; sem placeholder |
| D-10 ✅ | Rolagem do cabeçalho | Figma estático | **Só a barra de ações é fixa** (logo, TROCAR PERFIL, SAIR), acima das abas; saudação e aluno rolam com o conteúdo de cada aba (decisão do desenvolvedor após teste em aparelho) |
| D-11 | Barra só com logo (`17:2`) | Variante sem ações, sem uso evidente | Não usar até haver definição |
| D-12 | Imprecisões do Figma | Recuos de 40/43/46 pt na lista de aulas, 28/32,7 pt no 3º trimestre, 29/32 pt no card de aluno | Única exceção ao "Perfect Pixel": usar o valor que o próprio Figma repete na maioria das ocorrências (ver `03-design-system.md` §7). Reproduzir desvios de 3–6 pt pareceria bug. Reverter se o desenvolvedor preferir |
| D-13 | Validação de CPF | O Figma tem um único estado de erro genérico | Botão habilitado com 11 dígitos + senha; CPF com dígito verificador inválido gera o mesmo erro genérico, sem consultar dados |
| D-14 | Tela de restauração | Não há splash no Figma | Fundo preto sem conteúdo enquanto restaura (sem novo elemento visual) |
| D-15 | Ambiente | Shell do editor em Node 20 (nvm padrão = 22); Pods não instalados; `react-native-worklets` não declarado; Babel sem plugin de worklets | Corrigir na tarefa T01 |
| D-16 ✅ | Limite do Figma MCP | O plano Starter atingiu o limite de chamadas durante a inspeção; URLs temporárias de assets expiram em ~2026-11-11 | Assets salvos em `src/assets/` (autorizado em 2026-11-04) |

### Evolução depois da entrega: integração com a API (2026-11-05)

Na entrega, backend e API ficaram fora do escopo (§5). Depois dela, o desenvolvedor criou a FIAP School API (`../FiapSchoolApi`), e o app passa a usá-la na branch `feature/integrate-api` (`features/api-integration.md`).

| ID | Tema | Observação | Decisão |
|---|---|---|---|
| D-17 ✅ | Integração com a API | O app deve trocar o JSON pela API sem mudar o que o usuário vê | `GuardianRemoteDataSource` no lugar do local. Domínio, DTOs, `toGuardian` e as telas de Agenda, Boletim e Mudança de aluno ficam intactos. O datasource local ficou nos testes até a D-35 |
| D-18 ✅ | Cliente HTTP | Pedido do desenvolvedor: Axios, como nos projetos dele | `axios` com versão fixa 1.20.0. A 1.21.0 tinha 9 dias de publicação; uma versão com semanas de uso reduz o risco na cadeia de dependências |
| D-19 ✅ | Tokens | Definido pelo desenvolvedor | O refresh vai para o `react-native-keychain` (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`), e o access fica só em memória. Nenhum token no AsyncStorage; a senha nunca é persistida |
| D-20 ✅ | Login sem conexão | O Figma só tem o erro de credenciais | Mensagem nova no mesmo lugar e estilo: "Não foi possível conectar.\nVerifique sua internet e tente novamente." |
| D-21 ✅ | App aberto sem conexão | A renovação falha por rede com a sessão salva | Tela de conexão (logo, mensagem e **TENTAR NOVAMENTE**). A sessão continua guardada e entra direto quando a conexão voltar |
| D-22 ✅ | Login bloqueado (429) | A API limita as tentativas por CPF e por IP | Mensagem específica: "Muitas tentativas.\nTente novamente mais tarde." |
| D-23 | Sessão expirada ou revogada | Refresh recusado pela API ao abrir o app | ~~Volta ao Login sem aviso~~. **Substituída pela D-31** (Login com toast) |
| D-24 | URL da API em desenvolvimento | — | ~~Padrão por plataforma e túnel com `API_URL`~~. **Substituída pela D-37** |
| D-25 | Timeout | A hospedagem gratuita pode hibernar | 20 s por requisição, revisto quando a API for publicada (T11 da API) |
| D-26 | URL em release | — | ~~Release exige `API_URL` com `https://`~~. **Substituída pela D-37** |

### Toast (2026-11-05)

Pedido do desenvolvedor: um toast como o do Instagram, com o estilo do design system (`features/toast.md`).

| ID | Tema | Observação | Decisão |
|---|---|---|---|
| D-27 ✅ | Implementação | Há bibliotecas prontas, mas o projeto já tem Reanimated, Gesture Handler e Restyle | Componente próprio, sem biblioteca de toast |
| D-28 ✅ | Posição | Referência: Instagram | Embaixo, acima da barra de abas ou do botão principal, e acima do teclado quando aberto |
| D-29 ✅ | Visual | O design system não tem cores de sucesso nem de erro | Fundo `surfaceRaised`, texto `bodyMedium` branco, raio 8, sem ícone |
| D-30 ✅ | Situações | Comparação com a tabela de feedback trazida pelo desenvolvedor | Toast em sessão expirada, troca de aluno e queda e volta da conexão. Login realizado, senha incorreta, falha ao carregar e logout ficam como estão |
| D-31 ✅ | Sessão expirada | A D-23 deixava a pessoa no Login sem explicação | Login com o toast, só quando havia sessão salva e a API a recusou |
| D-32 ✅ | Conectividade | Detectar a queda e a volta da internet exige um módulo nativo | `@react-native-community/netinfo` com versão fixa 12.0.1 (TurboModule); mudanças de menos de 1 s são ignoradas |
| D-33 ✅ | Reconexão na tela de conexão | A internet volta com o app parado na tela de conexão | Tenta restaurar a sessão sozinho, além do toast |
| D-34 ✅ | Textos | Não há textos de toast no Figma | "Sua sessão expirou.\nEntre novamente."; "Mostrando os dados de {primeiroNome}."; "Sem conexão com a internet."; "Conexão restabelecida." |

### Remoção do JSON local (2026-11-05)

| ID | Tema | Observação | Decisão |
|---|---|---|---|
| D-35 ✅ | JSON e datasource local | Com a API indo para produção, o app não usa mais o JSON. Mesmo assim, o `dependencies.ts` importava o `GuardianLocalDataSource`, e por isso o bundle de produção carregava o JSON com CPFs e senhas | **Decisão do desenvolvedor:** "aquele JSON já era".<br>- O arquivo foi movido para a API (`../FiapSchoolApi/prisma/data/responsaveis.json`), onde alimenta o seed e os testes de paridade.<br>- O app perdeu o `GuardianLocalDataSource` e o `createLocalDependencies`.<br>- Os testes usam um fixture anonimizado (`src/test-utils/fixtures/responsaveis.json`): mesma agenda e boletins, com nomes, RMs, e-mails e senhas fictícios e CPFs sintéticos válidos.<br>- Os testes também usam a API simulada `createFakeApi`.<br>- O código de produção não importa JSON nem `test-utils` |

### Abertura mantida até a sessão restaurar (2026-11-05)

| ID | Tema | Observação | Decisão |
|---|---|---|---|
| D-36 ✅ | Launch screen até restaurar a sessão | Entre a launch screen e o primeiro conteúdo, o app ficava com a tela preta enquanto restaurava a sessão (renovação do token e `/me`) | `react-native-bootsplash` 7.3.3 (versão fixa; a 7.3.5 tinha 6 dias): a abertura continua na tela até o `BootSplashGate` chamar `BootSplash.hide({ fade: true })`, quando a sessão deixa de estar em `restoring`. No iOS, reaproveita o `LaunchScreen.storyboard`; no Android, o `BootTheme` usa o fundo preto e o `splash_icon`, e o `LaunchTheme` e o `launch_screen` foram removidos |

### URL única da API (2026-11-05)

| ID | Tema | Observação | Decisão |
|---|---|---|---|
| D-37 ✅ | URL única | A API foi publicada na Railway (`https://fiap-school-api-production.up.railway.app`, com HTTPS e HSTS) | **Decisão do desenvolvedor:** essa é a única URL, em debug e em release. Saem o `API_URL` por variável, o plugin `babel-plugin-transform-inline-environment-variables` (dependência removida), o tipo `env.d.ts` e os padrões por plataforma. Rodar contra uma API local exige alterar `apiConfig.ts` |

### Dados do aluno pelas rotas de alunos (2026-11-06)

| ID | Tema | Observação | Decisão |
|---|---|---|---|
| D-38 ✅ | Agenda e boletins pelas rotas de alunos | Na revisão de código, o desenvolvedor notou que as rotas `GET /v1/alunos/{rm}/agenda` e `/boletins` não eram usadas: o app lia tudo do `/me`, e são essas rotas que garantem a autorização pelo vínculo entre o aluno e o responsável do token | A agenda e os boletins do aluno selecionado vêm **só** dessas rotas: ao abrir o app, ao trocar de aluno e ao puxar a tela para baixo (`reloadRecords`). O login e o `/me` continuam trazendo o responsável e a lista de alunos; a agenda e os boletins embutidos nessas respostas deixam de ser lidos. Estados novos: carregando, erro com TENTAR NOVAMENTE e toast de erro se o puxar para atualizar falhar. A API foi enxugada na D-28 dela: o login e o `/me` deixaram de devolver agenda e boletim, e o `AlunoDTO` perdeu esses campos |
