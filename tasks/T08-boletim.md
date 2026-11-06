# T08 — Boletim

**Depende de:** T05, T07 (reuso do `Dropdown`) · **Specs:** `features/report.md`

## Objetivo

Exibir o boletim por ano e trimestre, com notas/faltas por disciplina e "-" quando não avaliado.

## Escopo

1. `useReportViewModel`, `ReportScreen`, `TermAccordion`, `SubjectRow`.
2. Seletor de ano conforme D-01.
3. Expansão múltipla de trimestres e disciplinas.

## Critérios de aceite

Todos os itens de `features/report.md` §7.

## Validação

typecheck, lint, testes (formatação + ViewModel + RNTL com o JSON real); verificação visual contra `3:317`, `3:1054`, `3:389` e `3:549`.

## Status (2026-11-04) — concluída (exceto conferência visual)

- `useReportViewModel`: anos na ordem do JSON ("turma - ano"), primeiro selecionado; trimestres e disciplinas na ordem do JSON; nota/faltas via `formatGrade`/`formatAbsences` ("-" para `null`); expansão múltipla. O estado guarda o RM do aluno: se o aluno muda, volta ao primeiro boletim com tudo recolhido (sem `useEffect`). Trocar de ano fecha o dropdown e recolhe tudo.
- `TermAccordion`: `Card variant="raised"` (90 pt), título `bodyBold primary`, seta espelhada quando aberto; disciplinas 16 pt abaixo, 20 pt entre si, 32 pt até o próximo card.
- `SubjectRow`: linha de 17 pt, nome em caixa alta, área de toque ampliada (+10 pt acima/abaixo); aberta mostra "Nota:" (10 pt abaixo) e "Faltas:" (4 pt abaixo) com o valor 12 pt à direita; detalhe lido como "Nota 9,5, faltas 0" ou "Nota não lançada, faltas não lançadas".
- Dropdown de ano reutiliza o da T07 com recuo `sm` (12 pt), como no Figma.
- Testes: ViewModel (6) e tela com dados reais (8: abertura em "7EF - 2025", anos 2025/2024, 12 disciplinas com 9,5/0 e 8,0/1, "-" no 2º trimestre, dois trimestres abertos, 2024 completo, RM 13752 com 11 disciplinas sem Arte no T1, nenhuma média). Total: 24 suítes, 166 testes.

Normalizações (D-12):

- Seta dos cards de trimestre centralizada verticalmente nos dois estados (no Figma a seta "aberta" aparece 14 pt mais abaixo nos metadados, mas centralizada nos screenshots).
- Seta das disciplinas centralizada na linha de 17 pt (no Figma fica 3 pt abaixo do topo do texto quando fechada e alinhada ao topo quando aberta).
