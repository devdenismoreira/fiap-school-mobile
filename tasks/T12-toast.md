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

Não iniciada. Aguarda aprovação da spec e deste plano.
