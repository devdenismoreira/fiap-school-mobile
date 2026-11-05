---
description: Validate (SDD) — executa as verificações do projeto e confere os critérios de aceite da tarefa um a um
argument-hint: <tarefa, ex.: tasks/T07-agenda.md>
---

Fase **Validate** do SDD para: $ARGUMENTS

1. Com Node 22 (`nvm use`), rode e registre a saída real de:
   - `yarn typecheck`
   - `yarn lint`
   - `yarn test`: número de suítes e de testes e avisos no console.
2. Para cada critério de aceite da tarefa, indique a evidência:
   - teste (`arquivo` e nome do caso);
   - comando executado;
   - ou "só verificável em aparelho", com o roteiro manual.
3. Se faltar cobertura, delegue ao agente `test-engineer` para escrever os testes, e rode tudo de novo.
4. Liste o que depende de validação manual em Android e iOS: visual contra o Figma, animações, "Reduzir movimento", TalkBack/VoiceOver, status bar, teclado e transições nativas.
5. Builds nativos (`yarn android`, `yarn ios`) só se o desenvolvedor pedir.

Não afirme que algo foi validado sem o comando ou a evidência correspondente. Atualize a seção "Status" da tarefa com o resultado.
