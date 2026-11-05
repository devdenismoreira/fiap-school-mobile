# Feature — Agenda (aulas por dia)

> Status: **aprovada e implementada** (T07) · Figma: página "Aulas" (`2:24` sem aulas, `2:48` dropdown aberto, `2:88` lista) · Dados: `Student.schedule`

## 1. Objetivo

Mostrar as aulas do aluno selecionado para um dia escolhido entre os dias disponíveis na agenda.

## 2. Layout (abaixo do `AppHeader`)

| Elemento | Medidas | Estilo |
|---|---|---|
| Título "AGENDA" | 64 pt abaixo do cabeçalho, centralizado | `sectionTitle` |
| Dropdown de dia | 32 pt abaixo do título; margens laterais 24; altura 45; padding horizontal 16 | `surface`, raio 8, texto `body`, seta 14 pt `primary` |
| Painel de opções | 7 pt abaixo do dropdown, mesma largura, padding vertical 8 + opções com 8 em cima e embaixo (texto a 16 pt das bordas, itens a cada 36 pt); **sobreposto** ao conteúdo num `Modal` transparente (fecha ao tocar fora e com o voltar do Android) | `surface`, raio 8, `body` |
| Lista de aulas | 24 pt abaixo do dropdown; recuo 40 pt (D-12) | — |
| Item de aula | Marcador 6 pt (borda 1 pt `timelineDot`) alinhado ao horário; horário `caption`; 8 pt; disciplina `bodySemiBold`; 16 pt até o próximo item | Texto a 10 pt do marcador |
| Estado vazio | Ilustração 328 × 208 centralizada, 20 pt abaixo do dropdown; "Sem aulas neste dia" 20 pt abaixo (corrigido: imagem termina em 570 e texto começa em 590 no Figma) | `emptyState` |
| Barra de abas | Fixa na base; "AGENDA" ativa | `TabBar` |

O conteúdo abaixo do cabeçalho rola junto com ele (D-10); a barra de abas fica fixa.

## 3. Regras

1. **Dias disponíveis** = `student.schedule`, na ordem do JSON (domingo 16/03 a sábado 22/03/2025). Todos aparecem no dropdown, inclusive os sem aulas (como no Figma).
2. **Rótulo do dia**: `"{dia} de {mês}, {dia-da-semana}"` em minúsculas e pt-BR, a partir da data ISO, sem fuso: "16 de março, domingo", "17 de março, segunda-feira", "22 de março, sábado". Dia sem zero à esquerda.
3. **Dia inicial (D-02 ✅)**: primeiro dia da agenda, como no Figma (frame `2:24`: "16 de março, domingo", sem aulas).
4. **Seleção**: tocar numa opção seleciona o dia, fecha o painel e atualiza a lista. Tocar fora do painel, no próprio dropdown, ou no voltar do Android fecha sem alterar.
5. **Lista**: exibe `classes` na ordem do JSON, sem agrupar disciplinas repetidas e sem inserir intervalo (D-08). Horário exibido como texto do JSON.
6. **Dia sem aulas** (`classes: []`): estado vazio com ilustração e "Sem aulas neste dia".
7. **Agenda vazia** (`schedule: []`, não ocorre no JSON): oculta o dropdown e mostra o estado vazio. Proposta defensiva, sem novo texto.
8. **Troca de aluno**: mantém a data se existir no novo aluno; senão aplica o dia inicial (ver `student-selection.md`).
9. O estado (dia selecionado, painel aberto) pertence ao `useAgendaViewModel`; o aluno vem de `useSession()`.

## 4. ViewModel (contrato proposto)

```ts
function useAgendaViewModel(): {
  days: { date: string; label: string }[];
  selectedDate: string | null;
  selectedDayLabel: string | null;
  classes: ClassSession[];
  isEmptyDay: boolean;
  isDropdownOpen: boolean;
  toggleDropdown(): void;
  closeDropdown(): void;
  selectDate(date: string): void;
};
```

## 5. Animações

- Painel: fade + translateY −4 → 0 (150 ms); seta gira 180° ao abrir (no Figma, a seta para cima é a mesma imagem espelhada).
- Troca de dia: itens entram com fade + 8 pt, escalonados 30 ms (máx. 6).
- Estado vazio: fade in 220 ms.
- Com "Reduzir movimento": sem escalonamento nem rotação animada.

## 6. Acessibilidade

- Dropdown: `accessibilityRole="button"`, rótulo "Dia selecionado: 17 de março, segunda-feira", `accessibilityState.expanded`.
- Opções: `accessibilityRole="menuitem"` (ou `button`), `selected` na atual.
- Item de aula lido como "07:15 às 08:00, Matemática I"; o marcador é decorativo.
- Ilustração do estado vazio decorativa; o texto é lido.

## 7. Critérios de aceite

- [ ] Ao entrar na aba, o dropdown mostra "16 de março, domingo" com o estado "Sem aulas neste dia".
- [ ] O dropdown lista os 7 dias com os rótulos exatamente no formato do Figma.
- [ ] Selecionar "17 de março, segunda-feira" para o RM 12567 mostra as 6 aulas na ordem do JSON (Matemática I … Coding).
- [ ] Domingo e sábado mostram a ilustração e "Sem aulas neste dia".
- [ ] O painel sobrepõe o conteúdo e fecha ao selecionar ou tocar fora.
- [ ] Trocar de aluno atualiza as aulas sem sair da aba.
- [ ] Os rótulos de data não sofrem deslocamento de fuso (teste com TZ `America/Sao_Paulo` e `UTC`).

## 8. Testes previstos

- `formatDayLabel`: todos os dias da semana, meses com acento ("março"), dia sem zero à esquerda, independência de fuso.
- `useAgendaViewModel`: dia inicial, seleção, dia vazio, agenda vazia, troca de aluno com e sem a mesma data.
- `AgendaScreen` (RNTL): abrir dropdown, escolher dia, lista renderizada, estado vazio.
