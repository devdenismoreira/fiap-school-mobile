# Uso de IA — FIAP School Mobile

Este documento descreve como a inteligência artificial foi usada no desenvolvimento, qual método foi seguido e como as respostas foram validadas.

## 1. Ferramentas

| Ferramenta | Uso |
|---|---|
| Claude Code (extensão do VS Code, modelo Claude Opus) | Análise de requisitos, especificação, planejamento, implementação, testes e revisão |
| MCP oficial do Figma | Leitura de frames, medidas, variáveis, componentes e capturas do arquivo do desafio |

O contexto do projeto ficou no [`CLAUDE.md`](CLAUDE.md), escrito pelo desenvolvedor antes da primeira sessão. Ele reúne:
- requisitos;
- stack;
- arquitetura esperada;
- regras de segurança;
- a regra de não implementar nada antes da aprovação do plano.

As preferências que surgiram durante o trabalho (organização de pastas, padrão de commits, ausência de comentários no código) foram incorporadas a ele.

## 2. Método: Spec-Driven Development

1. **Especificação antes do código.** A primeira sessão produziu só documentos:
   - diagnóstico do repositório: Node 20 no shell, Pods não instalados e `react-native-worklets` ausente (D-15);
   - inventário do Figma pelo MCP;
   - análise do JSON real;
   - as specs [`00` a `03`](specs/) e uma por funcionalidade em [`specs/features/`](specs/features/).
2. **Dúvidas e decisões registradas.** Divergências entre enunciado, Figma e JSON viraram decisões numeradas (D-01 a D-16 em [`specs/00-project-overview.md`](specs/00-project-overview.md) §6). O desenvolvedor respondeu antes de qualquer código. As decisões aprovadas estão marcadas com ✅. Exemplos:
   - seletor de ano no padrão do JSON (D-01);
   - "SAIR" conforme as variantes do Figma (D-03);
   - latência simulada de 800 ms (D-04);
   - uso do `react-native-svg` (D-05).
3. **Plano.** Dez tarefas ([`tasks/`](tasks/README.md), T01–T10), cada uma com dependências, escopo, critérios de aceite e estratégia de validação.
4. **Implementação incremental.** Uma tarefa por vez. Ao fim de cada uma, a IA relatava:
   - arquivos alterados;
   - decisões;
   - comandos executados e resultados;
   - pendências.

   Os commits seguem Conventional Commits, um por funcionalidade, e só foram feitos com autorização.
5. **Validação.** `yarn typecheck`, `yarn lint` e `yarn test` rodaram a cada etapa. O desenvolvedor testou em aparelhos físicos e emuladores, e os ajustes resultantes estão registrados na [T09](tasks/T09-animacoes-e-refinamento.md).
6. **Atualização das specs.** Quando uma decisão mudou (por exemplo, a D-10, cabeçalho fixo), a spec foi atualizada junto com o código.

## 3. Onde a IA contribuiu

- **Design system:** extração de cores, tipografia, espaçamentos, raios e medidas do Figma para o tema Restyle, com as diferenças intencionais documentadas ([`specs/03-design-system.md`](specs/03-design-system.md) §7).
- **Dados:**
  - modelagem do domínio a partir do JSON real;
  - identificação de casos de borda que existem nos dados: disciplina ausente no 1º trimestre de um aluno (D-09) e intervalo entre aulas sem registro (D-08).
- **Aplicação:** implementação de telas, navegação, sessão persistida, acessibilidade e animações.
- **Testes:** na entrega, 27 suítes e 176 testes; depois da integração com a API, 40 suítes e 264 testes, cobrindo:
  - CPF;
  - login válido e inválido;
  - restauração e fim da sessão;
  - troca de aluno;
  - agenda;
  - regras do boletim;
  - estados vazios;
  - navegação;
  - cliente HTTP (renovação compartilhada), tokens, toast, conexão e abertura.
- **Diagnóstico** de problemas de ambiente e de plataforma (§4).

## 4. Validação humana e correções de rumo

As respostas da IA não foram aceitas automaticamente. Situações em que o desenvolvedor mudou a direção:

| Situação | Decisão |
|---|---|
| Gerenciador de pacotes | A migração para Yarn 4 via Corepack exigia configuração extra na máquina e falhou ao rodar o app. Voltou-se ao Yarn 1 (`09ba072`) |
| Organização do código | O desenvolvedor propôs separar os estilos. A análise mostrou que, com Restyle, o estilo está nas props. Decidiu-se por pasta por componente e tela e alias `@/` (`42c89a8`, `beaa183`) |
| Cabeçalho | Depois de testar no aparelho, só a barra de ações ficou fixa; a saudação rola com o conteúdo (D-10) |
| Animações | No aparelho, as aberturas pareceram "secas". As curvas e durações foram revistas, e o trimestre do boletim passou a abrir com altura animada e rolagem acompanhando (`c2bd6ad` a `d0a80cf`) |
| Comentários no código | Removidos a pedido do desenvolvedor; as decisões ficam nas specs (`bfc0b47`) |
| Builds | Builds nativos e emulador só quando pedidos. A execução em aparelho foi feita pelo desenvolvedor |

Problemas encontrados no teste em aparelho e corrigidos:
- **Android:** `INSTALL_FAILED_INSUFFICIENT_STORAGE` com APK de quatro arquiteturas. Os builds de desenvolvimento passaram a compilar só a arquitetura do aparelho.
- **Android 12+:** splash pequena. Passou a usar um ícone próprio no SplashScreen do sistema.
- **iOS:**
  - piscada branca entre a launch screen e o app;
  - ícones escuros na status bar;
  - troca de perfil fechando rápido demais, porque a transição do modal nativo não aceita duração.

Problemas encontrados pelos testes automatizados:
- O logo não era exposto a leitores de tela no iOS (`170d191`).
- Testes frágeis, que navegavam pela árvore de componentes, foram reescritos com papéis acessíveis e `testID`.

## 5. Evolução depois da entrega (API, toast e abertura)

Depois da entrega, o desenvolvedor criou uma API própria (repositório `FiapSchoolApi`, com o mesmo método SDD: CLAUDE.md, agentes, comandos, specs e tarefas) e o app passou a usá-la na branch `feature/integrate-api`. O trabalho seguiu o ciclo specify → aprovação → implementação → validação, com a spec em [`specs/features/api-integration.md`](specs/features/api-integration.md) e as decisões D-17 a D-36.

| Entrega | O que a IA fez | Decisões e validação do desenvolvedor |
|---|---|---|
| Integração com a API (T11) | Cliente Axios com renovação compartilhada do token, datasource remoto, tokens no Keychain, mensagens de conexão e tela de conexão | Escolheu o Axios, o Keychain e o texto de cada mensagem; aprovou a spec antes do código. Validado contra a API real e em aparelho |
| Toast (T12) | Componente próprio com variantes, ícones, barra de progresso, avisos de sessão, perfil e conexão | Pediu o estilo do Instagram, as situações e o visual a partir de uma referência; ajustou textos e cores |
| Remoção do JSON do app (D-35) | Moveu o arquivo para a API, criou fixture anonimizado e API simulada para os testes | Percebeu que o JSON "já era" e decidiu movê-lo, não duplicá-lo |
| Estados vazios | `EmptyState` com ação, tela sem alunos e boletim vazio com "tentar novamente" | Definiu o comportamento e a mensagem; pediu casos de teste no banco para ver as telas |
| Ajustes de experiência | Animações mais curtas, botão e teclado juntos no iOS, loading no botão | Apontou cada incômodo no aparelho e o que já estava bom e não deveria mudar (trimestres e modal) |
| Abertura (D-36) | `react-native-bootsplash` reaproveitando o launch screen existente | Propôs a biblioteca; testou em iOS e Android |

Correções de rumo desta etapa:
- **Dependências:** a IA fixou versões já publicadas há semanas (Axios 1.20.0, NetInfo 12.0.1, Bootsplash 7.3.3), por causa do risco de pacotes recém-publicados.
- **Dados pessoais no bundle:** a IA notou que o `dependencies.ts` ainda importava o datasource local, o que levaria o JSON com CPFs e senhas ao app de produção. Isso levou à D-35.
- **Commit indevido:** um arquivo local do desenvolvedor (IP da rede) entrou num commit por engano. A IA corrigiu antes de qualquer push.
- **Bug achado por teste:** o toast não fechava com um arrasto rápido, porque a decisão usava um valor que gestos rápidos não atualizam.
- **Segurança por limite de ferramenta:** o desenvolvedor negou à IA a leitura de arquivos `.env` e de outro projeto. A IA seguiu sem eles e pediu ao desenvolvedor que ajustasse esses arquivos.

## 6. Configuração de IA no repositório

| Caminho | Conteúdo |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Contexto, requisitos, arquitetura, segurança e convenções (a API tem o dela, com agentes e comandos próprios) |
| [`.claude/agents/`](.claude/agents/) | `architect` (Specify/Plan), `mobile-developer` (Implement), `test-engineer` (Validate) e `code-reviewer` (Review) |
| [`.claude/commands/`](.claude/commands/) | `/specify`, `/plan`, `/implement`, `/validate` e `/review` |
| [`.claude/settings.json`](.claude/settings.json) | Permissões compartilhadas. Verificações (typecheck, lint, testes, leitura do git e do Figma) liberadas; commit, push, dependências e builds pedem confirmação; operações destrutivas bloqueadas |
| [`specs/`](specs/) e [`tasks/`](tasks/) | Artefatos do SDD, com status e decisões de cada etapa |

Os agentes e comandos de `.claude/` foram criados no fim do projeto. Eles formalizam o ciclo que foi conduzido durante o desenvolvimento pelo `CLAUDE.md` e por instruções diretas nas sessões, e deixam o processo reproduzível para a evolução do app.

## 7. Segurança e privacidade

- Na entrega, o login era simulado com o JSON do desafio e não representava autenticação de produção. Hoje a autenticação é real, pela API: JWT, sessão no servidor e refresh token protegido pelo Keychain ou Keystore.
- Nenhuma credencial foi copiada para docs ou testes. Os testes do app usam um fixture anonimizado, com identidades fictícias e CPFs sintéticos.
- A senha nunca é persistida e nenhum token vai para o AsyncStorage. A sessão local guarda só os identificadores mínimos.
- Não foram versionados:
  - o histórico das conversas;
  - as configurações pessoais (`.claude/settings.local.json`);
  - tokens ou dados de autenticação do Figma.

## 8. Limitações

- A IA não vê a tela do aparelho. Fidelidade visual, animações, leitores de tela, o código nativo (Keychain, NetInfo e abertura) e o teclado no iOS foram conferidos pelo desenvolvedor em aparelhos.
- O plano Starter do Figma atingiu o limite de chamadas do MCP durante a inspeção. Os assets foram salvos em `src/assets/` (D-16).

## 9. Responsabilidade

A IA foi usada como apoio. As decisões técnicas, a revisão das implementações e a validação final do aplicativo são de responsabilidade do desenvolvedor.
