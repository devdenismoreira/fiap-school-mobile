---
description: Review (SDD) — revisão técnica do diff contra specs, arquitetura, Figma, acessibilidade, segurança e testes
argument-hint: "[intervalo git ou tarefa (opcional)]"
---

Fase **Review** do SDD. Alvo: $ARGUMENTS. Sem alvo, use as mudanças pendentes (`git diff` e `git diff --cached`).

1. Delegue ao agente `code-reviewer`, informando o alvo e a tarefa relacionada em `tasks/`.
2. Peça os achados ordenados por gravidade (bloqueante, importante, sugestão), cada um com `arquivo:linha`, o cenário concreto de falha e a correção sugerida.
3. Confira cada achado bloqueante ou importante no código antes de apresentá-lo. Descarte falsos positivos e diga por quê.
4. Não aplique correções sem aprovação. Com a aprovação, corrija, rode `yarn typecheck`, `yarn lint` e `yarn test`, e reporte o resultado.

Ao final, resuma o que foi verificado, os achados confirmados e as decisões que cabem ao desenvolvedor.
