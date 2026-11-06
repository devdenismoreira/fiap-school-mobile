# Plano de tarefas

Cada tarefa tem escopo, dependências, critérios de aceite e estratégia de validação. A implementação só começa após aprovação, uma tarefa por vez, com relatório de arquivos alterados, comandos executados e pendências ao final de cada uma.

| # | Tarefa | Depende de | Entrega principal |
|---|---|---|---|
| T01 | [Fundação e ambiente](T01-fundacao.md) | aprovação | App compila e roda em Android/iOS; Jest configurado |
| T02 | [Design system e assets](T02-design-system.md) | T01 | Tema Restyle, Montserrat, assets, `PrimaryButton` |
| T03 | [Domínio, dados e utilitários](T03-dominio-e-dados.md) | T01 | Entidades, repositórios, CPF/datas/notas com testes |
| T04 | [Autenticação e sessão](T04-autenticacao-e-sessao.md) | T02, T03 | Login + sessão persistida/restaurada |
| T05 | [Navegação e cabeçalho](T05-navegacao-e-cabecalho.md) | T04 | Abas, cabeçalho (`AppActionBar`), rota modal, logout |
| T06 | [Seleção de aluno](T06-selecao-de-aluno.md) | T05 | Tela "Mudança de aluno" |
| T07 | [Agenda](T07-agenda.md) | T05 | Aulas por dia + `Dropdown` |
| T08 | [Boletim](T08-boletim.md) | T05, T07 | Anos, trimestres, notas/faltas |
| T09 | [Animações e refinamento](T09-animacoes-e-refinamento.md) | T06–T08 | Movimento, acessibilidade, fidelidade |
| T10 | [Validação e entrega](T10-validacao-e-entrega.md) | T09 | Builds, README, docs finais |
| T11 | [Integração com a API](T11-integracao-api.md) | T10 e a FIAP School API | Datasource remoto, Keychain, Axios com renovação compartilhada, mensagens de conexão (evolução depois da entrega) |
| T12 | [Toast](T12-toast.md) | T11 | Toast no estilo do Instagram: sessão expirada, troca de aluno e conexão (NetInfo) |
| T13 | [Rotas de alunos](T13-rotas-de-alunos.md) | T11 | Agenda e boletins por aluno (`/v1/alunos/{rm}/…`), carga ao trocar de aluno e puxar para atualizar |
| T14 | [Estados vazios](T14-estados-vazios.md) | T13 | `EmptyState`: sem alunos, boletim vazio ou com erro, tentar novamente |
| T15 | [Abertura e ajustes](T15-abertura-e-ajustes.md) | T12, T13 | Bootsplash, toast redesenhado, teclado iOS, loading no botão, animações, URL única |

T02 e T03 podem andar em paralelo após a T01. T06, T07 e T08 podem andar em paralelo após a T05 (T08 reutiliza o `Dropdown` da T07).

Novas tarefas seguem o mesmo formato. No Claude Code, o ciclo é: `/specify` → aprovação → `/plan` → aprovação → `/implement` → `/validate` → `/review` (`.claude/commands/`).
