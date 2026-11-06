# T12 — Toast (avisos discretos)

**Depende de:** T11 · **Branch:** `feature/integrate-api` · **Specs:** `features/toast.md`, D-27 a D-34

## Objetivo

Toast no estilo do Instagram, com os tokens do design system, para sessão expirada, troca de aluno e queda e volta da conexão. Sem biblioteca de toast.

## Escopo (em ordem de dependência)

1. **Dependência** (pede aprovação):
   - `@react-native-community/netinfo@12.0.1`, com versão fixa;
   - `yarn ios:pods`;
   - mock oficial no `jest.setup.ts`.

   O rebuild nativo fica com o desenvolvedor.
2. **Tokens:** `motion.toastDuration` (3000) e `motion.toastDurationLong` (4000).
3. **Componente** `src/shared/components/Toast/` (tela, teste e `index.ts`):
   - visual do §3 da spec;
   - entrada com `openTiming`, saída com `emphasizedAccelerate`;
   - fechar ao tocar e ao arrastar para baixo (Gesture Handler);
   - anúncio de acessibilidade.
4. **`ToastProvider`** (`src/app/providers/ToastProvider.tsx`):
   - `showToast`, `hideToast` e substituição por `id`;
   - temporizador da duração;
   - `useToastBottomInset`;
   - host acima da navegação, somando a altura do teclado.
5. **Distâncias da base:** registrar `useToastBottomInset` em `MainTabs` (barra de abas), `LoginScreen` e `ConnectionErrorScreen` (botão).
6. **Sessão expirada:**
   - `SessionState` `signedOut` com `reason: 'expired' | null`;
   - o `SessionProvider` confere se havia sessão salva antes de restaurar;
   - o `useLoginViewModel` mostra o toast ao montar com `reason === 'expired'`.
7. **Troca de aluno:** o `useStudentSelectionViewModel` mostra o toast quando o RM muda.
8. **Conexão:**
   - `src/core/network/useConnectivity.ts`: NetInfo com o filtro de 1 s;
   - `src/app/providers/ConnectivityFeedback.tsx`: toasts de queda e volta, e `retryRestore` no estado `unreachable` (D-33);
   - montado no `App`.
9. **Documentação:** README (feedback e NetInfo), `CLAUDE.md` §4 (versão do NetInfo), status desta tarefa e da spec.

## Critérios de aceite

Os de `features/toast.md` §7: automatizados e manuais.

## Validação

- `yarn typecheck`, `yarn lint` e `yarn test`.
- **Build nativo** (`yarn ios:pods`, `yarn ios`, `yarn android`) e roteiro manual: feitos pelo desenvolvedor.

## Commits sugeridos

1. `build(deps): adiciona @react-native-community/netinfo`
2. `feat(ui): adiciona toast no estilo do Instagram com os tokens do design system`
3. `feat(session): avisa quando a sessão expira ao abrir o app`
4. `feat(students): confirma a troca de aluno com toast`
5. `feat(network): avisa queda e volta da conexão e reconecta a sessão sozinho`
6. `docs: documenta o toast`

## Status

**Concluída em 2026-11-05**, com build nativo e roteiro manual conferidos pelo desenvolvedor em aparelho. O visual foi redesenhado depois (variantes, ícone e barra de progresso). Spec, plano, NetInfo, D-33 e os textos foram aprovados quando o desenvolvedor pediu para começar a T12.

Entregue:
- **Dependência:**
  - `@react-native-community/netinfo@12.0.1`;
  - `yarn ios:pods` rodou e instalou o `react-native-netinfo` 12.0.1;
  - a reformatação do `project.pbxproj` pelo CocoaPods, sem mudança de conteúdo, foi descartada.
- **Tokens e animação:** `motion.toastDuration` e `motion.toastDurationLong`; presets `toastEntering` (`openTiming`) e `toastExiting` (220 ms, acelerando).
- **`Toast`:**
  - `surfaceRaised`, raio 8, `bodyMedium` branco em até 2 linhas, sombra;
  - fecha ao tocar (`Pressable`) e ao arrastar para baixo (Gesture Handler);
  - anuncia o texto.
- **`ToastProvider`:**
  - `showToast`, `hideToast`, substituição por `id` e temporizador;
  - `useToastBottomInset` registrado por `MainTabs` (barra de abas), Login e tela de conexão (botão);
  - host acima da navegação, somando a altura do teclado (`useKeyboardHeight`).
- **Sessão expirada:**
  - o `SessionProvider` lê a sessão salva antes de restaurar; se ela existia e a restauração devolveu `null`, o estado é `signedOut` com `sessionExpired: true`;
  - o Login mostra o toast por 4 s.
- **Troca de aluno:** `useStudentSelectionViewModel` mostra "Mostrando os dados de {primeiroNome}." só quando o aluno muda.
- **Conexão:**
  - `useConnectivity` (NetInfo, filtro de 1 s, estado inicial sem aviso);
  - `ConnectivityFeedback` (toasts com `id` `connectivity` e `retryRestore` no estado `unreachable`), montado no `App`.
- **Testes:** `renderWithSession` passou a incluir `GestureHandlerRootView` e `ToastProvider`; o `jest.setup` usa o mock oficial do NetInfo.

Ajuste encontrado pelo teste: o fechamento por arrasto decidia pela distância acumulada no `onUpdate`. Um gesto rápido termina sem update, e o toast não fechava. Passou a usar o `translationY` do evento final.

Validação:
- `yarn typecheck` e `yarn lint` passando.
- `yarn test`: 37 suítes e 251 testes passando. Entre eles:
  - `Toast` (5);
  - `ToastProvider` (8, inclusive teclado e posição);
  - `ConnectivityFeedback` (4, inclusive reconexão automática);
  - sessão expirada no Login e no fluxo completo com a API simulada;
  - toast da troca de aluno.

Validação em aparelho: feita pelo desenvolvedor (iOS e Android).
