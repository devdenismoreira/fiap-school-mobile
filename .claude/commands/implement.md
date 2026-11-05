---
description: Implement (SDD) — implementa uma tarefa aprovada, com testes, sem sair do escopo
argument-hint: <tarefa, ex.: tasks/T08-boletim.md>
---

Fase **Implement** do SDD para: $ARGUMENTS

Delegue ao agente `mobile-developer`. Se a tarefa pedir testes extensos, use também o `test-engineer`.

1. Confirme que a tarefa foi aprovada. Leia a tarefa, as specs citadas e o código vizinho antes de editar.
2. Implemente somente o escopo da tarefa, seguindo `CLAUDE.md` e as convenções do agente:
   - Restyle e tokens;
   - presets de animação;
   - pasta por componente;
   - alias `@/`;
   - sem comentários no código.
3. Escreva ou atualize os testes de cada critério de aceite.
4. Rode `yarn typecheck`, `yarn lint` e `yarn test` (com `nvm use`). Corrija até passar ou explique o bloqueio.
5. Se uma decisão mudar durante a implementação, atualize a spec correspondente.
6. Atualize a seção "Status" da tarefa.
7. Não rode builds nativos, não abra emulador e não faça commit nem push sem pedido explícito.

Ao final, informe:
- arquivos alterados;
- decisões;
- comandos executados, com resultados;
- pendências;
- o que conferir em aparelho.

Sugira os commits no padrão Conventional Commits (tipo em inglês, mensagem em português, um por funcionalidade).
