---
description: Plan (SDD) — decompõe uma spec aprovada em tarefa com passos, testes e critérios de aceite
argument-hint: <spec aprovada, ex.: specs/features/report.md>
---

Fase **Plan** do SDD para: $ARGUMENTS

Delegue ao agente `architect`.

1. Confirme que a spec está aprovada (decisões com ✅ ou aprovação registrada). Se não estiver, pare e peça a aprovação.
2. Leia `tasks/README.md` e as tarefas existentes para manter a numeração e o formato.
3. Crie `tasks/Txx-<slug>.md` com:
   - **Depende de** e **Specs**;
   - **Objetivo**;
   - **Escopo**, em passos pequenos e na ordem de dependência, citando os arquivos afetados (pasta por componente: `Nome.tsx`, `Nome.test.tsx`, `index.ts`);
   - **Critérios de aceite**, em checklist;
   - **Validação**: `yarn typecheck`, `yarn lint`, `yarn test` e o que só pode ser conferido em aparelho.
4. Liste dependências novas, se houver, com necessidade, compatibilidade e alternativa. Nenhuma é instalada nesta fase.
5. Adicione a tarefa ao índice `tasks/README.md`.
6. Não escreva código.

Ao final, apresente o plano e peça aprovação explícita para o `/implement`.
