# T09 — Animações, acessibilidade e refinamento visual

**Depende de:** T06, T07, T08 · **Specs:** `03-design-system.md` §8–9 e seções de animação de cada feature

## Objetivo

Aplicar as animações aprovadas de forma consistente e fechar as pendências de acessibilidade e fidelidade visual.

## Escopo

1. Animações da tabela `03-design-system.md` §8 (Reanimated 4 + transições do React Navigation).
2. "Reduzir movimento": comportamento verificado em Android e iOS.
3. Revisão de acessibilidade (§9): rótulos, papéis, estados, áreas de toque, leitura da mensagem de erro.
4. Comparação lado a lado com os frames do Figma e ajuste de diferenças.

## Critérios de aceite

- [x] Todas as telas têm transições de entrada/saída e as interações listadas animam (Reanimated 4 na thread de UI).
- [x] Com "Reduzir movimento" ativo, nenhuma animação de deslocamento/rotação é executada (implementado; **conferir no aparelho**).
- [x] Testes continuam determinísticos.
- [ ] Lista de diferenças visuais restantes — **depende de rodar o app** (builds adiados).

## Validação

typecheck, lint, testes; gravação de tela ou capturas Android/iOS; leitura com TalkBack/VoiceOver nos fluxos principais.

## Status (2026-11-04) — implementada; conferência no aparelho pendente

Movimento (`src/shared/animations.ts`, tokens `motion`, `Easing.out(Easing.cubic)`, todos com `ReduceMotion.System`):

| Interação | Implementação |
|---|---|
| Login ↔ abas, troca de aba | `animation: 'fade'` nos navegadores; `'none'` com "Reduzir movimento" (`useReducedMotion`) |
| Troca de aluno | `slide_from_bottom`; `'none'` com "Reduzir movimento" |
| Erro do login | `FadeIn`/`FadeOut` 150 ms |
| Botão → carregando | texto sai com `FadeOut` 150 ms (botão vazio, como no Figma) |
| Dropdown | painel entra com fade + 4 pt vindo de cima (150 ms); seta gira 180° (`ExpandArrow`) |
| Troca de dia (Agenda) | aulas entram com fade + 8 pt, escalonadas 30 ms (máx. 6); estado vazio com fade 220 ms; chaves incluem a data para recriar o conteúdo |
| Trimestre/disciplina | conteúdo com fade (220/150 ms), itens abaixo deslizam (`LinearTransition` 220 ms), seta gira |
| Toque | opacidade 0,7 (já existente) |

Não aplicado: transição de cor da borda do `StudentCard`. Ao selecionar, a tela fecha na hora, então a transição nunca seria vista.

Acessibilidade:

- Foco do leitor de tela vai para o título ao abrir a troca de aluno (`sendAccessibilityEvent(..., 'focus')` no `transitionEnd`).
- Revisão dos itens da spec 03 §9: papéis (`button`, `tab`/`tablist`, `radio`/`radiogroup`, `menu`/`menuitem`, `header`), estados (`expanded`, `selected`, `checked`, `disabled`, `busy`), áreas de toque ampliadas (ações do cabeçalho, linhas de disciplina, FECHAR), ícones decorativos ocultos, erro anunciado, escala de fonte limitada a 1,3×. Pendência conhecida: opções do dropdown com 36 pt (medida do Figma).

Testes novos: `ExpandArrow` (rotação 0° → 180° após a duração; já montada aberta) e foco no título da troca de aluno. Total: 25 suítes, 169 testes.

## Ajustes após teste em aparelho (2026-11-04)

Retorno: animações "secas", troca Agenda → Boletim rápida, troca de perfil fechando rápido, dropdown abrindo rápido, trimestre sem "descer e focar" e status bar com ícones escuros no iOS.

| Ajuste | Implementação |
|---|---|
| Status bar branca no iOS | `statusBarStyle: 'light'` no RootStack (`UIViewControllerBasedStatusBarAppearance` = YES) |
| Curva das aberturas | `smoothEasing` (0.4, 0, 0.2, 1) no lugar de *emphasized decelerate*; tokens `motion.open` (400) e `motion.transition` (480) |
| Dropdown | abre com `openTiming`; o fechamento (220 ms, acelerando) foi mantido |
| Troca de aba | 480 ms com `smoothEasing` |
| Troca de perfil | `presentation: 'card'` + `slide_from_bottom` + `animationDuration` 480 ms (iOS); gesto de voltar desligado |
| Trimestre | `Collapsible` com altura animada e rolagem sincronizada via `useScrollFocus` (`TabScreenLayout`) |
| Entradas | seções da tela 400 ms; itens da Agenda 320 ms; detalhes de disciplina e estado vazio com `fadeInSmooth` |

Teste: `jest.setup.ts` substitui `useScrollOffset` por um valor fixo, porque no Jest o ref animado não tem tag nativa e a biblioteca emitia avisos. Total: 26 suítes, 173 testes.

**Conferir no aparelho:** a rolagem que acompanha o trimestre (iOS e Android), o fechamento da troca de perfil e a status bar no iOS (exige rebuild nativo, junto com ícones e launch screen).

Também em 2026-11-04: comentários removidos do código TypeScript (`src/`, `__tests__/`; 168 em 70 arquivos). Ficaram só os de configuração (`jest.setup.ts`, configs, `.d.ts`, arquivos nativos). O Prettier ajustou a formatação de 6 arquivos de teste/utilitários que estavam fora do padrão.
