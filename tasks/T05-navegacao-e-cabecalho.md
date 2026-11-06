# T05 — Navegação autenticada e cabeçalho

**Depende de:** T04 · **Specs:** `01-architecture.md` §6, `features/student-selection.md` §2

## Objetivo

Montar o shell autenticado: abas Agenda/Boletim com barra customizada, cabeçalho compartilhado e a rota modal de seleção de aluno.

## Escopo

1. `MainTabs` (bottom-tabs) com `TabBar` customizado (ícones + rótulos, ativo `primary`, insets).
2. `AppHeader` com saudação, dados do aluno e ações conforme D-03 ("TROCAR PERFIL", "SAIR").
3. Rota `StudentSelection` no RootStack (`fullScreenModal`, `slide_from_bottom`), ainda com conteúdo mínimo.
4. Tipos de rota em `navigation/types.ts`.
5. Telas Agenda e Boletim como placeholders com `AppHeader` + título de seção.

## Critérios de aceite

- [x] Alternar entre abas mantém o cabeçalho correto e destaca a aba ativa.
- [x] "TROCAR PERFIL" abre o modal e o voltar retorna à mesma aba.
- [x] "SAIR" encerra a sessão e mostra o Login.
- [ ] Layout respeita safe areas (notch, home indicator, Android edge-to-edge) — implementado com `useSafeAreaInsets`; **conferência visual pendente** (builds adiados).

## Validação

typecheck, lint, testes de navegação (RNTL); verificação visual em Android e iOS contra os frames `2:88`/`3:317`.

## Status (2026-11-04) — concluída (exceto conferência visual)

- **Modelo de layout:** topo do frame do Figma = topo da área segura (a barra de ações começa em y = 0 nos frames). Corrigido o Login, que descontava 20 pt de barra de status: logo agora a 100 pt da área segura.
- `AppHeader`: barra de 48 pt (logo 100×16, ações à direita), "TROCAR PERFIL" + "SAIR" com 2+ alunos e só "SAIR" com 1 (D-03), saudação/nome em caixa alta, linha turma/RM/período. Área de toque das ações ampliada para ~44 pt.
- `TabScreenLayout`: cabeçalho rola com o conteúdo; faixa da barra de status fixa e preta; título de seção a 64 pt do cabeçalho; 32 pt de respiro antes da barra de abas.
- `TabBar` customizado: fundo `surface`, ícone e rótulo `primary` na aba ativa, área segura pintada; papéis `tablist`/`tab` com estado `selected`.
- `MainTabs` (fade entre abas) e rota `StudentSelection` no RootStack (`fullScreenModal` + `slide_from_bottom`) com "FECHAR ✕" e título nas posições do Figma; cards entram na T06.
- Tela provisória da T04 removida.
- Normalização (D-12): no Figma o centro da aba Agenda está em x = 98 e o da Boletim em 310 (não simétricos); implementado com duas metades iguais (centros em 103,5 e 310,5). O ícone da Boletim estava 1 pt abaixo do da Agenda; ambos a 11 pt do topo.
- Testes: `AppHeader` (5) e fluxo integrado do `App` (8: login, erro, restauração, troca de aba, abrir/fechar seleção voltando à mesma aba, responsável com 1 aluno, SAIR). Total: 17 suítes, 128 testes.
