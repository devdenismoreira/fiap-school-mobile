# Especificações do FIAP School Mobile

Especificações escritas a partir do repositório, do Figma e do JSON real do desafio (D-06; desde 2026-11-05 fora do app, em `../FiapSchoolApi/prisma/data/responsaveis.json`, D-35). Cada documento registra requisitos, estados, critérios de aceite, casos de borda e decisões. Decisões do desenvolvedor estão marcadas com ✅ em `00-project-overview.md` §6. A diretriz geral é seguir o Figma fielmente ("Perfect Pixel").

| Documento | Conteúdo |
|---|---|
| [00-project-overview.md](00-project-overview.md) | Objetivo, diagnóstico do repositório, inventário do Figma, requisitos, divergências e dúvidas |
| [01-architecture.md](01-architecture.md) | Camadas, pastas, sessão, navegação, erros, testes, trade-offs |
| [02-data-model.md](02-data-model.md) | Estrutura do JSON, entidades, mapper, persistência, casos de borda |
| [03-design-system.md](03-design-system.md) | Tokens Restyle, tipografia, componentes, assets, movimento, acessibilidade |
| [features/authentication.md](features/authentication.md) | Login, sessão, logout |
| [features/student-selection.md](features/student-selection.md) | Cabeçalho e troca de aluno |
| [features/classes.md](features/classes.md) | Agenda por dia |
| [features/report.md](features/report.md) | Boletim por ano e trimestre |
| [features/api-integration.md](features/api-integration.md) | Evolução depois da entrega: troca do JSON pela FIAP School API (tokens, interceptador, mensagens de conexão) |
| [features/toast.md](features/toast.md) | Toast no estilo do Instagram com os tokens do projeto: sessão expirada, troca de aluno, conexão |
| [features/records-from-student-routes.md](features/records-from-student-routes.md) | Agenda e boletins pelas rotas de alunos, carga ao trocar de aluno e puxar para atualizar |
| [features/empty-states.md](features/empty-states.md) | `EmptyState`: sem alunos, boletim vazio ou com erro |
| [features/launch-and-polish.md](features/launch-and-polish.md) | Bootsplash, toast redesenhado, teclado iOS, loading no botão, animações, URL única |

Regras de manutenção: atualizar a spec quando uma decisão mudar, e não tratar documentação como substituta de testes.
