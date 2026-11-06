# T06 — Seleção de aluno

**Depende de:** T05 · **Specs:** `features/student-selection.md`

## Objetivo

Implementar a tela "Mudança de aluno" e a troca de aluno refletida nas abas.

## Escopo

1. `StudentSelectionScreen` + `StudentCard` (normal/selecionado).
2. Integração com `selectStudent` + `goBack`.
3. Comportamento para responsável com 1 aluno (D-03).

## Critérios de aceite

Todos os itens de `features/student-selection.md` §7.

## Validação

typecheck, lint, testes RNTL; verificação visual contra o frame `2:5` em Android e iOS.

## Status (2026-11-04) — concluída (exceto conferência visual)

- `cardVariants.raised` no tema (fundo `surfaceRaised`, raio 8, 90 pt) + componente `Card` (Restyle `createRestyleComponent`), reaproveitado depois pelo card de trimestre (T08).
- `StudentCard` (pasta da tela): nome completo em caixa alta, linha turma/RM/período, borda de 1 pt sempre presente (`primary` no selecionado, transparente nos demais) para o texto não mudar de lugar; padding de 15 + borda = 16 pt do Figma; papel `radio` com `checked` e rótulo descritivo.
- `useStudentSelectionViewModel`: lista na ordem do JSON, troca imediata no contexto (gravação em paralelo), selecionar o atual ou "FECHAR" só fecha.
- Tela com título e cards rolando (lista grande não corta), `radiogroup`, área segura inferior.
- Testes: `StudentCard` (5), tela (4) e fluxo integrado novo (trocar a partir do Boletim volta ao Boletim com o cabeçalho do novo aluno e persiste). Total: 19 suítes, 138 testes.

Fica para as próximas tarefas:

- Agenda (T07) e Boletim (T08) reagirem à troca (manter a data / voltar ao primeiro boletim), conforme `features/student-selection.md` §4 item 6.
- Transição da cor da borda e foco de acessibilidade no título ao abrir (T09).
