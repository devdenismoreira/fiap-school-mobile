# Feature — Toast (avisos discretos)

> Status: **aprovada, implementada e validada em aparelho** (T12, 2026-11-05; visual redesenhado depois, ver `launch-and-polish.md`) · Decisões: D-27 a D-34 · Referência: o toast do Instagram, com os tokens do design system do projeto

## 1. Objetivo

Dar um retorno curto e discreto em situações que hoje passam em silêncio, sem interromper o uso e sem substituir os estados do Figma.

## 2. Onde aparece (D-30)

| Situação | Gatilho | Texto (proposto, D-34) | Duração |
|---|---|---|---|
| Sessão expirada | Ao abrir o app, havia sessão salva, mas a API recusou: refresh vencido, revogado ou reutilizado. O app vai para o Login | "Sua sessão expirou.\nEntre novamente." | 4 s |
| Troca de aluno | Escolher **outro** aluno na Mudança de aluno. O toast aparece já de volta à aba | "Mostrando os dados de {primeiroNome}." | 3 s |
| Sem conexão | A internet cai **depois** que o app abriu, em qualquer tela | "Sem conexão com a internet." | 4 s |
| Conexão de volta | A internet volta depois de um "Sem conexão" | "Conexão restabelecida." (substitui o anterior) | 3 s |

Ficam como estão, sem toast:

| Situação | Comportamento |
|---|---|
| Login realizado | Navega direto para a Agenda |
| Senha incorreta | Mensagem abaixo dos campos (Figma) |
| Falha ao carregar na abertura | Tela de conexão com TENTAR NOVAMENTE (D-21) |
| Sem conexão no login | Mensagem de conexão abaixo dos campos (D-20) |
| Logout | Navega direto para o Login |

Regras:
1. **Sessão expirada:** só quando havia sessão salva e ela foi recusada. Abrir o app pela primeira vez, ou depois de SAIR, não mostra nada. Substitui a D-23 (Login sem aviso).
2. **Troca de aluno:** escolher o aluno que já estava selecionado não mostra toast.
3. **Conexão:**
   - o estado ao abrir o app não gera toast, porque a tela de conexão e a mensagem do Login já cobrem a abertura;
   - mudanças que duram menos de 1 s são ignoradas, para não piscar em redes instáveis.
4. **Reconexão na tela de conexão (D-33):** quando a internet volta e o app está nessa tela, ele tenta restaurar a sessão sozinho, além de mostrar "Conexão restabelecida.".

## 3. Visual (revisado em 2026-11-05, a partir da referência do desenvolvedor)

Quatro variantes, cada uma com ícone pequeno (20 pt, traço) e uma linha de destaque de 2 pt na base, na cor da variante:

| Variante | Cor | Tema | Uso |
|---|---|---|---|
| `success` | turquesa #20E6D0 | `feedbackSuccess` | Conexão restabelecida |
| `info` | turquesa #20E6D0 | `feedbackInfo` | Perfil alterado |
| `error` | rosa #F0005B | `feedbackError` | Sem conexão |
| `warning` | âmbar #F5C84B | `feedbackWarning` | Sessão expirada |

| Propriedade | Valor |
|---|---|
| Fundo | `surface` (#262626) |
| Título | `bodySemiBold`, branco; mensagem `caption` |
| Raio, margens | `m` (8); 16 pt nas laterais |
| Fechar | X cinza à direita; tocar no toast ou arrastar para baixo também fecha |
| Sombra | leve, `elevation` 8 no Android |

Textos: "Sessão expirada · Entre novamente para continuar.", "Perfil alterado · Mostrando os dados de {nome}.", "Sem conexão · Verifique sua internet.", "Conexão restabelecida · Você está online novamente.". O `showToast` aceita `title` e `variant`.

## 4. Comportamento

**Posição (D-28):** embaixo, acima do que ocupa a base da tela, com folga de `xs` (8):

| Tela | Distância da base |
|---|---|
| Abas (Agenda, Boletim) | `insets.bottom` + barra de abas (64) |
| Login e tela de conexão | `insets.bottom` + `PrimaryButton` (60) |
| Mudança de aluno e demais | `insets.bottom` |

Com o teclado aberto, a altura dele é somada, para o toast não ficar escondido.

**Animação:**
- entrada: sobe de baixo com fade, `quickTiming` (260 ms, curva suave);
- saída: desce com fade, 220 ms (`emphasizedAccelerate`), a mesma do fechamento do dropdown;
- "Reduzir movimento" troca as duas por aparecer e sumir sem animação (`ReduceMotion.System`).

**Interação:**
- some sozinho ao fim da duração;
- tocar no toast o fecha;
- arrastar para baixo também: passou de 24 pt, fecha; abaixo disso, volta ao lugar;
- o resto da tela continua tocável (`pointerEvents="box-none"` no contêiner).

**Um por vez:**
- um toast novo substitui o atual, como no Instagram;
- avisos com o mesmo `id` (ex.: `connectivity`) se substituem sem animar a saída.

**Acessibilidade:**
- o texto é anunciado ao aparecer (`AccessibilityInfo.announceForAccessibility`, como o erro do Login), com `accessibilityLiveRegion="polite"` no Android;
- o toast não rouba o foco;
- tem `accessibilityRole="button"` e a dica "Toque para fechar".

## 5. Arquitetura

| Peça | Onde | Papel |
|---|---|---|
| `Toast` | `src/shared/components/Toast/` (`Toast.tsx`, teste, `index.ts`) | Visual, animação e gestos de um toast |
| `ToastProvider`, `useToast()` e `useToastBottomInset(px)` | `src/app/providers/ToastProvider.tsx` | Estado do toast atual, `showToast(message, { id?, duration? })`, `hideToast()`, registro da distância da base por tela e o host, que desenha o `Toast` acima de toda a navegação |
| `useConnectivity()` | `src/core/network/useConnectivity.ts` | NetInfo com o filtro de 1 s; devolve se o app está online |
| `ConnectivityFeedback` | `src/app/providers/ConnectivityFeedback.tsx` | Sem interface: transforma as mudanças de conexão em toasts e dispara a nova tentativa (D-33) |
| Sessão expirada | `SessionProvider` e `useLoginViewModel` | O estado `signedOut` ganha `reason: 'expired' \| null`. O provider marca `expired` quando a restauração devolve `null` e havia sessão salva. O Login mostra o toast ao montar com esse motivo |
| Troca de aluno | `useStudentSelectionViewModel` | Depois de `selectStudent`, se o RM mudou, chama `showToast` e volta |
| Tokens | `motion.ts` | `toastDuration` (3000) e `toastDurationLong` (4000) |

Ordem no `App`: `AppProviders` → `ToastProvider` → `SessionProvider` → `NavigationContainer` + `ConnectivityFeedback`, com o host do toast por cima de tudo.

Nenhuma biblioteca de toast (D-27): Reanimated, Gesture Handler e Restyle já fazem tudo.

## 6. Dependência (D-32)

| Pacote | Versão | Tipo | Motivo |
|---|---|---|---|
| `@react-native-community/netinfo` | 12.0.1, fixa (publicada em fevereiro de 2026) | runtime nativo, TurboModule compatível com a New Architecture | Detectar a queda e a volta da conexão. Exige `pod install` e rebuild |

Nos testes, entra o mock oficial (`@react-native-community/netinfo/jest/netinfo-mock.js`).

## 7. Critérios de aceite

Automatizados:
- [x] **`Toast`:**
  - usa os tokens do §3;
  - fecha ao tocar;
  - fecha ao arrastar mais de 24 pt e volta abaixo disso;
  - anuncia o texto ao leitor de tela.
- [x] **`ToastProvider`:**
  - `showToast` mostra;
  - some após a duração (relógio do Jest);
  - um toast novo substitui o atual;
  - o mesmo `id` substitui;
  - `hideToast` fecha;
  - a distância da base segue a tela registrada.
- [x] **Sessão expirada:**
  - restauração recusada com sessão salva → Login + toast;
  - sem sessão salva → Login sem toast;
  - depois de SAIR → Login sem toast.
- [x] **Troca de aluno:** outro aluno → toast com o primeiro nome; o mesmo aluno → nada.
- [x] **Conexão:**
  - online → offline após 1 s → "Sem conexão com a internet.";
  - offline → online → "Conexão restabelecida.";
  - mudança de menos de 1 s → nada;
  - estado inicial → nada.
- [x] **Reconexão** com o app na tela de conexão chama `retryRestore`.
- [x] typecheck, lint e testes passam.

Manuais (aparelho ou simulador):
- [ ] Toast acima da barra de abas, do botão do Login e do teclado.
- [ ] Animação de entrada e saída, arrastar para baixo, e "Reduzir movimento" ativo.
- [ ] Modo avião no meio do uso → aviso; desligar → "Conexão restabelecida.".
- [ ] Modo avião na abertura → tela de conexão; desligar → entra sozinho.
- [ ] Sessão expirada:
  1. Com o app logado, fechar o app.
  2. No painel do Supabase, preencher `revogada_em` da sessão em `fiap_school.sessoes`.
  3. Reabrir o app → Login com o toast.
- [ ] VoiceOver e TalkBack leem o toast.

## 8. Fora de escopo

- Botões de ação no toast (ex.: "Desfazer").
- Fila de vários toasts.
- Variantes de cor (sucesso ou erro): o design system não tem essas cores.
- Toast para login realizado, senha incorreta e logout (§2).
