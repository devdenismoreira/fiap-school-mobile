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
- **Testes:** 27 suítes e 176 testes, cobrindo:
  - CPF;
  - login válido e inválido;
  - restauração e fim da sessão;
  - troca de aluno;
  - agenda;
  - regras do boletim;
  - estados vazios;
  - navegação.
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

## 5. Configuração de IA no repositório

| Caminho | Conteúdo |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Contexto, requisitos, arquitetura, segurança e convenções |
| [`.claude/agents/`](.claude/agents/) | `architect` (Specify/Plan), `mobile-developer` (Implement), `test-engineer` (Validate) e `code-reviewer` (Review) |
| [`.claude/commands/`](.claude/commands/) | `/specify`, `/plan`, `/implement`, `/validate` e `/review` |
| [`.claude/settings.json`](.claude/settings.json) | Permissões compartilhadas. Verificações (typecheck, lint, testes, leitura do git e do Figma) liberadas; commit, push, dependências e builds pedem confirmação; operações destrutivas bloqueadas |
| [`specs/`](specs/) e [`tasks/`](tasks/) | Artefatos do SDD, com status e decisões de cada etapa |

Os agentes e comandos de `.claude/` foram criados no fim do projeto. Eles formalizam o ciclo que foi conduzido durante o desenvolvimento pelo `CLAUDE.md` e por instruções diretas nas sessões, e deixam o processo reproduzível para a evolução do app.

## 6. Segurança e privacidade

- O login é simulado com o JSON fornecido pelo desafio. Não representa autenticação de produção.
- Nenhuma credencial foi copiada para docs ou testes: os testes leem os dados do JSON em tempo de execução.
- A senha nunca é persistida. A sessão guarda só os identificadores mínimos.
- Não foram versionados:
  - o histórico das conversas;
  - as configurações pessoais (`.claude/settings.local.json`);
  - tokens ou dados de autenticação do Figma.

## 7. Limitações

- A IA não vê a tela do aparelho. Fidelidade visual, animações e leitores de tela foram conferidos pelo desenvolvedor.
- O plano Starter do Figma atingiu o limite de chamadas do MCP durante a inspeção. Os assets foram salvos em `src/assets/` (D-16).

## 8. Responsabilidade

A IA foi usada como apoio. As decisões técnicas, a revisão das implementações e a validação final do aplicativo são de responsabilidade do desenvolvedor.
