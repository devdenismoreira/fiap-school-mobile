# Feature — Boletim

> Status: **aprovada e implementada** (T08) · Figma: página "Boletim" (`3:317` ano fechado, `3:1054` ano aberto, `3:389` trimestre aberto, `3:549` detalhes) · Dados: `Student.reportCards`

## 1. Objetivo

Exibir notas e faltas por disciplina, organizadas por ano letivo e trimestre, refletindo **exclusivamente** os dados do JSON.

## 2. Layout (abaixo da `AppActionBar` e da `StudentGreeting`)

| Elemento | Medidas | Estilo |
|---|---|---|
| Título "BOLETIM" | 64 pt abaixo do cabeçalho, centralizado | `sectionTitle` |
| Dropdown de ano | 16 pt abaixo do título; margens 16; altura 45; padding horizontal 12 | `surface`, raio 8, `body`, seta `primary` |
| Painel de anos | 7 pt abaixo; itens a cada 36 pt; sobreposto ao conteúdo | `surface`, raio 8, `body` |
| Card de trimestre | Primeiro 16 pt abaixo do dropdown; 90 pt de altura; gap 16; padding horizontal 12 | `surfaceRaised`, raio 8; título `bodyBold primary`; seta à direita |
| Lista de disciplinas (trimestre aberto) | 16 pt abaixo do card; linhas de 17 pt com 20 pt entre elas; 32 pt após a última até o próximo card; recuo 12 pt (alinhado ao título do card) | Nome `captionMedium` caixa alta; seta 14 pt |
| Detalhe da disciplina (aberta) | 10 pt abaixo do nome: "Nota: x,x"; 4 pt; "Faltas: n" | `captionMedium` |
| Barra de abas | Fixa; "BOLETIM" ativa | `TabBar` |

## 3. Regras

1. **Anos (D-01 ✅ — padrão do JSON)**: opções = `student.reportCards` **na ordem do JSON**. Rótulo `"{className} - {year}"` usando a turma **daquele ano** ("7EF - 2025", "6EF - 2024"). Padrão: o primeiro boletim (2025 para todos os alunos atuais).
2. **Trimestres**: um card por `term`, na ordem do JSON (já numérica: 1, 2, 3; padrão D-01), com rótulo `"{n}º TRIMESTRE"`. Estado inicial: todos recolhidos (frame `3:317`).
3. **Expansão múltipla**: vários trimestres e várias disciplinas podem ficar abertos ao mesmo tempo (frame `3:549`).
4. **Disciplinas**: exibir as do trimestre, na ordem do JSON; nome em caixa alta na UI. Disciplina ausente num trimestre **não** é exibida nem simulada (RM 13752, T1/2025, sem "Arte").
5. **Nota**: `null` → "-"; número → pt-BR com 1 casa decimal ("9,5", "8,0", "10,0").
6. **Faltas**: `null` → "-"; número → inteiro ("0", "4").
7. **Proibido**: calcular média, situação (aprovado/reprovado), total de faltas, ou preencher trimestres não avaliados.
8. **Troca de ano**: fecha o painel, recolhe todos os acordeões e mostra os trimestres do ano escolhido.
9. **Troca de aluno**: volta ao primeiro boletim do novo aluno, tudo recolhido.
10. **Sem boletins** (não ocorre no JSON): sem dropdown e sem cards; abaixo do título fica só o espaço vazio. Proposta defensiva; nenhum texto novo sem aprovação.
11. **Trimestre sem disciplinas** (não ocorre): o card abre sem itens.

## 4. ViewModel (contrato proposto)

```ts
function useReportViewModel(): {
  years: { year: string; label: string }[];
  selectedYear: string | null;
  selectedYearLabel: string | null;
  terms: { number: number; label: string; subjects: { key: string; name: string; grade: string; absences: string }[] }[];
  isYearDropdownOpen: boolean;
  expandedTerms: ReadonlySet<number>;
  expandedSubjects: ReadonlySet<string>; // chave `${term}:${subjectName}`
  toggleYearDropdown(): void;
  selectYear(year: string): void;
  toggleTerm(term: number): void;
  toggleSubject(key: string): void;
};
```

A formatação (`formatGrade`, `formatAbsences`) são funções puras em `core/utils`, testadas isoladamente.

## 5. Animações

- Dropdown de ano: igual à Agenda.
- Expandir trimestre/disciplina: conteúdo com fade; cards e linhas abaixo deslizam (`LinearTransition`, 220 ms); seta gira 180°.
- Recolher: fade out rápido (150 ms) + deslizamento dos itens abaixo.
- Com "Reduzir movimento": troca instantânea.

## 6. Acessibilidade

- Card de trimestre: `accessibilityRole="button"`, rótulo "1º trimestre", `accessibilityState.expanded`.
- Linha de disciplina: rótulo "Língua Portuguesa"; quando expandida, detalhe lido como "Nota 9,5, faltas 0" ou "Nota não lançada, faltas não lançadas" para "-".
- `hitSlop` para levar as linhas de disciplina a 44 pt de área de toque.

## 7. Critérios de aceite

- [ ] Ao entrar na aba, o dropdown mostra o primeiro boletim do JSON ("7EF - 2025" para o RM 12567) e os 3 trimestres recolhidos.
- [ ] O painel de anos lista "7EF - 2025" e "6EF - 2024" para o RM 12567, e só "2EM - 2025" para o RM 12568.
- [ ] Abrir o 1º trimestre/2025 do RM 12567 lista 12 disciplinas na ordem do JSON; "LÍNGUA PORTUGUESA" mostra "Nota: 9,5" e "Faltas: 0"; "PRODUÇÃO E INTERPRETAÇÃO DE TEXTOS" mostra "8,0" e "1".
- [ ] 2º e 3º trimestres de 2025 mostram "-" em nota e faltas.
- [ ] 1º trimestre/2025 do RM 13752 lista 11 disciplinas (sem Arte), e o 2º trimestre lista 12.
- [ ] Selecionar 2024 mostra os 3 trimestres com notas.
- [ ] É possível manter dois trimestres e várias disciplinas abertos ao mesmo tempo.
- [ ] Nenhuma média ou valor derivado aparece na tela.

## 8. Testes previstos

- `formatGrade`/`formatAbsences`: `null`, inteiro, decimal, 10.
- `useReportViewModel`: ordem dos anos igual ao JSON, ano padrão = primeiro, troca de ano (reset), toggles, troca de aluno.
- `ReportScreen` (RNTL): fluxo dos critérios acima com o JSON real como fixture.
