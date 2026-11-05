# T04 — Autenticação e sessão

**Depende de:** T02, T03 · **Specs:** `features/authentication.md`, `01-architecture.md` §5–6

## Objetivo

Login funcional contra o JSON, com sessão persistida, restaurada na abertura e encerrável.

## Escopo

1. Use cases `authenticateGuardian` e `restoreSession`.
2. `SessionProvider` + `useSession()` (`restoring`/`signedOut`/`signedIn`, `signIn`, `selectStudent`, `signOut`).
3. Composition root `src/app/bootstrap/dependencies.ts`.
4. `RootNavigator` com troca condicional Login ↔ área autenticada (placeholder das abas por enquanto).
5. `LoginScreen` + `useLoginViewModel` + `UnderlineInput`, com todos os estados do Figma.

## Fora de escopo

Abas reais, cabeçalho e animações finas (T05/T09). A animação de troca de tela pode entrar com `animation: 'fade'`.

## Critérios de aceite

Todos os itens de `features/authentication.md` §7, exceto os que dependem do botão "SAIR" no cabeçalho (cobertos por teste via `signOut` e concluídos na T05).

## Validação

typecheck, lint, testes (unitários + RNTL do Login + restauração); verificação manual em Android e iOS: login válido, inválido, reabrir app.

## Status (2026-11-04) — concluída (exceto validação em dispositivo)

Implementado:

- `domain/usecases`: `createAuthenticateGuardian` (normaliza CPF, rejeita DV inválido e senha vazia sem consultar dados, erro genérico) e `createRestoreSession` (descarta sessão inválida ou de responsável inexistente; troca aluno órfão pelo primeiro; falhas de storage não travam).
- `StoredSession.selectedStudentRm` aceita `null` (responsável sem alunos, caso defensivo).
- `app/providers/SessionProvider.tsx`: estados `restoring`/`signedOut`/`signedIn`, `signIn`, `selectStudent`, `signOut`, `selectedStudent` derivado. Gravação que falha não derruba a sessão.
- `app/bootstrap/dependencies.ts`: composition root com latência de 800 ms.
- Navegação: `RootNavigator` (native-stack, `animation: 'fade'`, telas condicionais), tema de navegação escuro, tela de restauração preta.
- `MainPlaceholderScreen` **temporária** (saudação, turma/RM/período e SAIR) para validar o fluxo; substituída na T05.
- Login: `UnderlineInput` (rótulo, valor 32 pt centralizado, sublinhado cinza/branco), `useLoginViewModel` (máscara, habilitação, erro que some ao editar, bloqueio de envio duplo) e `LoginScreen` com as medidas do Figma (topo = área segura + 80; 80 até o CPF; 40 entre campos; 32 até o erro; botão colado na base com área segura, que some com o teclado aberto).
- Tokens novos: `spacing.giant` (80) e medidas do Login em `sizes`.

Testes: 16 suítes, 120 testes (casos de uso, provider, tela de Login e fluxo integrado do `App` com JSON real + AsyncStorage mockado: login válido/ inválido, restauração, SAIR).

Pendente / riscos:

- **Validação em dispositivo** (builds adiados): fonte, medidas, comportamento do teclado. `KeyboardAvoidingView` usa `behavior="padding"` nos dois sistemas, pensando no Android edge-to-edge (target 36), onde `adjustResize` não redimensiona a janela; precisa ser conferido no aparelho.
- **Diferença do Figma:** a senha aparece com bolinhas (máscara nativa do `secureTextEntry`), não com asteriscos como no Figma. Reproduzir os asteriscos exigiria máscara própria, o que quebraria gerenciadores de senha e acessibilidade.
- Animação do erro (fade) fica para a T09.
