# T07 — Agenda

**Depende de:** T05 · **Specs:** `features/classes.md`

## Objetivo

Exibir as aulas por dia, com seletor de dia e estado vazio.

## Escopo

1. `Dropdown` compartilhado (`shared/components`), reutilizado na T08.
2. `useAgendaViewModel`, `AgendaScreen`, `ClassItem`, `NoClassesState`.
3. Regra de dia inicial conforme D-02 e preservação de data na troca de aluno.

## Critérios de aceite

Todos os itens de `features/classes.md` §7.

## Validação

typecheck, lint, testes (ViewModel + RNTL); verificação visual contra `2:24`, `2:48` e `2:88`.

## Status (2026-11-04) — concluída (exceto conferência visual)

- `Dropdown` (`shared/components/Dropdown`): gatilho 45 pt `surface` raio 8, seta espelhada quando aberto, painel num `Modal` transparente posicionado por `measureInWindow` 7 pt abaixo do gatilho (fica acima de tudo, fecha ao tocar fora/no gatilho/voltar do Android; invisível até a medição chegar). Opções a cada 36 pt; recuo do texto configurável (`m` na Agenda, `sm` no Boletim). Acessibilidade: gatilho `button` com `expanded` e rótulo "Dia selecionado: …"; opções `menuitem` com `selected`.
- `useAgendaViewModel`: dia exibido derivado da data preferida (cai no primeiro dia se a data não existir no aluno atual) — regra de troca de aluno sem `useEffect`.
- `ClassItem`: marcador vazado 6 pt (5 pt do topo), horário `caption`, disciplina `bodySemiBold` 8 pt abaixo, 10 pt do marcador; item lido como "07:15 às 08:00, Matemática I".
- `NoClassesState`: caixa 328 × 208 recortando a imagem de 328 × 290 pelo topo; texto 20 pt abaixo (spec corrigida de 12 para 20).
- Testes: `Dropdown` (5), ViewModel (5, inclui troca de aluno mantendo/voltando a data) e tela com dados reais do JSON (4: domingo vazio, 7 rótulos do Figma, 6 aulas de segunda na ordem, sábado vazio). Total: 22 suítes, 152 testes.

Observações:

- Opções do dropdown têm 36 pt de área de toque (medida do Figma), abaixo dos 44 pt recomendados; ampliar exigiria mudar o espaçamento visual.
- Posição do painel depende de `measureInWindow` + `Modal` com `statusBarTranslucent`/`navigationBarTranslucent`: **conferir no aparelho**, principalmente no Android edge-to-edge.
- Animação do painel e escalonamento da lista ficam para a T09.
