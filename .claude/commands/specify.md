---
description: Specify (SDD) — escreve ou atualiza a spec de uma funcionalidade a partir do Figma, do JSON e do enunciado, sem código
argument-hint: <funcionalidade ou mudança>
---

Fase **Specify** do SDD para: $ARGUMENTS

Delegue ao agente `architect` e acompanhe o resultado.

1. Leia `CLAUDE.md`, `specs/README.md`, `specs/00-project-overview.md` (decisões D-xx) e a spec existente da área, se houver, em `specs/features/`.
2. Levante os insumos reais:
   - frames e componentes do Figma pelo MCP, com os ids dos nós;
   - os campos do JSON em `src/data/datasources/local/responsaveis.json`;
   - o requisito correspondente em `CLAUDE.md` §3.
3. Escreva ou atualize `specs/features/<funcionalidade>.md` no formato das specs existentes:
   - layout com medidas e tokens;
   - regras numeradas;
   - contrato do ViewModel;
   - estados (carregando, erro, vazio, dados incompletos);
   - animações;
   - acessibilidade;
   - critérios de aceite em checklist.
4. Divergências entre Figma, JSON e enunciado viram dúvidas ou propostas D-xx. Não decida sozinho o que altera escopo.
5. Não escreva nem altere código.

Ao final, mostre um resumo da spec, as dúvidas em aberto e peça aprovação explícita para seguir ao `/plan`.
