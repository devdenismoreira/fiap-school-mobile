# Especificações do FIAP School Mobile

Especificações escritas a partir do repositório, do Figma e do JSON real do desafio (hoje em `src/data/datasources/local/responsaveis.json`, D-06). Cada documento registra requisitos, estados, critérios de aceite, casos de borda e decisões. Decisões do desenvolvedor estão marcadas com ✅ em `00-project-overview.md` §6. A diretriz geral é seguir o Figma fielmente ("Perfect Pixel").

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

Regras de manutenção: atualizar a spec quando uma decisão mudar, e não tratar documentação como substituta de testes.
